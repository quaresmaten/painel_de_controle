"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit, Eye, Plus, RefreshCw, Save, Search, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FieldConfig, ModuleConfig } from "@/src/lib/modules";
import { formatCurrency, formatDate, normalizeText, toDateInputValue } from "@/src/lib/utils";
import type { ResourceKey } from "@/src/lib/validation";

type RecordData = {
  id: string;
  [key: string]: unknown;
};

type RelationData = Partial<Record<ResourceKey, RecordData[]>>;

function collectRelations(fields: FieldConfig[], acc = new Set<ResourceKey>()) {
  for (const field of fields) {
    if ((field.type === "relation" || field.type === "multiRelation") && field.relation) {
      acc.add(field.relation);
    }

    if (field.fields) collectRelations(field.fields, acc);
  }

  return Array.from(acc);
}

function defaultValue(field: FieldConfig): unknown {
  if (field.type === "checkbox") return false;
  if (field.type === "items" || field.type === "multiRelation") return [];
  if (field.type === "select") return field.options?.[0]?.value ?? "";
  return "";
}

function makeEmptyForm(fields: FieldConfig[]) {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    acc[field.name] = defaultValue(field);
    return acc;
  }, {});
}

function coerceValue(field: FieldConfig, value: unknown): unknown {
  if (field.type === "number" || field.type === "currency") {
    if (value === "" || value === undefined || value === null) return 0;
    return Number(value);
  }

  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "date") {
    return value ? String(value) : undefined;
  }

  if (field.type === "items") {
    const rows = Array.isArray(value) ? value : [];
    return rows
      .map((row) => coerceForm(field.fields ?? [], row as Record<string, unknown>))
      .filter((row) =>
        Object.values(row).some((item) => {
          if (Array.isArray(item)) return item.length > 0;
          return item !== "" && item !== undefined && item !== null && item !== 0;
        })
      );
  }

  if (field.type === "multiRelation") {
    return Array.isArray(value) ? value : [];
  }

  if (field.type === "relation") {
    return value ? String(value) : undefined;
  }

  return value === undefined || value === null ? "" : String(value);
}

function coerceForm(fields: FieldConfig[], values: Record<string, unknown>) {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    acc[field.name] = coerceValue(field, values[field.name]);
    return acc;
  }, {});
}

function displayValue(value: unknown, type?: FieldConfig["type"]) {
  if (type === "currency") return formatCurrency(value);
  if (type === "date") return formatDate(value);
  if (type === "checkbox") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return String(value.length);
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

function statusTone(value: unknown) {
  const normalized = String(value ?? "");
  if (["entregue", "respondido", "resolvida", "disponivel", "approved", "pronto"].includes(normalized)) {
    return "success" as const;
  }
  if (["atrasado", "critica", "indisponivel", "rejected"].includes(normalized)) {
    return "danger" as const;
  }
  if (["no_prazo", "pendente", "em_andamento", "alta", "missao", "pending"].includes(normalized)) {
    return "warning" as const;
  }
  return "muted" as const;
}

const valueLabels: Record<string, string> = {
  approved: "Aprovado",
  rejected: "Rejeitado",
  pending: "Pendente",
  no_prazo: "No prazo",
  em_andamento: "Em andamento",
  disponivel: "Disponível",
  indisponivel: "Indisponível",
  critica: "Crítica",
  media: "Média",
  ferias: "Férias",
  missao: "Missão",
  pendente: "Pendente",
  respondido: "Respondido",
  atrasado: "Atrasado",
  entregue: "Entregue",
  resolvida: "Resolvida",
  aberta: "Aberta",
  cancelada: "Cancelada",
  pronto: "Pronto",
  outros: "Outros"
};

function formatLabel(value: unknown) {
  const raw = String(value ?? "-");
  return valueLabels[raw] ?? raw.replace(/_/g, " ");
}

export function DataModulePage({
  config,
  role
}: {
  config: ModuleConfig;
  role: "admin" | "viewer";
}) {
  const [records, setRecords] = useState<RecordData[]>([]);
  const [relations, setRelations] = useState<RelationData>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [viewing, setViewing] = useState<RecordData | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>(() =>
    makeEmptyForm(config.fields)
  );

  const isAdmin = role === "admin";
  const relationKeys = useMemo(() => collectRelations(config.fields), [config.fields]);

  async function loadRecords() {
    const response = await fetch(`/api/resources/${config.key}`, { cache: "no-store" });
    if (!response.ok) return;
    const body = await response.json();
    setRecords(body.data ?? []);
    setLoading(false);
  }

  async function loadRelations() {
    const entries = await Promise.all(
      relationKeys.map(async (key) => {
        const response = await fetch(`/api/resources/${key}`, { cache: "no-store" });
        if (!response.ok) return [key, []] as const;
        const body = await response.json();
        return [key, body.data ?? []] as const;
      })
    );

    setRelations(Object.fromEntries(entries));
  }

  useEffect(() => {
    loadRecords();
    loadRelations();
    const interval = window.setInterval(loadRecords, 30000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.key]);

  const filteredRecords = useMemo(() => {
    if (!query.trim()) return records;
    const needle = normalizeText(query);

    return records.filter((record) =>
      config.searchFields.some((field) => normalizeText(String(record[field] ?? "")).includes(needle))
    );
  }, [config.searchFields, query, records]);

  function openCreate() {
    setEditing(null);
    setViewing(null);
    setFormData(makeEmptyForm(config.fields));
    setShowForm(true);
    setError("");
  }

  function openEdit(record: RecordData) {
    setEditing(record);
    setViewing(null);
    setFormData({
      ...makeEmptyForm(config.fields),
      ...record
    });
    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setFormData(makeEmptyForm(config.fields));
  }

  function updateField(name: string, value: unknown) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function updateItem(field: FieldConfig, index: number, name: string, value: unknown) {
    const rows = Array.isArray(formData[field.name]) ? [...(formData[field.name] as unknown[])] : [];
    const current = { ...((rows[index] as Record<string, unknown>) ?? {}) };
    current[name] = value;
    rows[index] = current;
    updateField(field.name, rows);
  }

  function addItem(field: FieldConfig) {
    const rows = Array.isArray(formData[field.name]) ? [...(formData[field.name] as unknown[])] : [];
    rows.push(makeEmptyForm(field.fields ?? []));
    updateField(field.name, rows);
  }

  function removeItem(field: FieldConfig, index: number) {
    const rows = Array.isArray(formData[field.name]) ? [...(formData[field.name] as unknown[])] : [];
    rows.splice(index, 1);
    updateField(field.name, rows);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = coerceForm(config.fields, formData);
    const response = await fetch(
      editing ? `/api/resources/${config.key}/${editing.id}` : `/api/resources/${config.key}`,
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    setSaving(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "Não foi possível salvar.");
      return;
    }

    closeForm();
    await loadRecords();
  }

  async function deleteRecord(record: RecordData) {
    if (!window.confirm("Excluir este registro?")) return;

    const response = await fetch(`/api/resources/${config.key}/${record.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "Não foi possível excluir.");
      return;
    }

    setViewing(null);
    await loadRecords();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{config.group}</p>
          <h2 className="mt-1 text-2xl font-semibold">{config.title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={loadRecords}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          {isAdmin && (
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar"
          className="border-0 px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {showForm && isAdmin && (
        <form className="mb-6 rounded-lg border bg-card p-4 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">{editing ? "Editar" : "Novo registro"}</h3>
            <Button type="button" variant="ghost" size="icon" onClick={closeForm} aria-label="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {config.fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={formData[field.name]}
                relations={relations}
                onChange={(value) => updateField(field.name, value)}
                onItemChange={updateItem}
                onItemAdd={addItem}
                onItemRemove={removeItem}
              />
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancelar
            </Button>
            <Button disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      )}

      {viewing && (
        <DetailPanel
          config={config}
          record={viewing}
          relations={relations}
          onClose={() => setViewing(null)}
          onEdit={isAdmin ? () => openEdit(viewing) : undefined}
        />
      )}

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                {config.columns.map((column) => (
                <th key={column.name} className="border-b px-4 py-3 font-semibold">
                    {column.label}
                  </th>
                ))}
                <th className="border-b px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-secondary/40">
                  {config.columns.map((column) => (
                    <td key={column.name} className="border-b px-4 py-3 align-top">
                      {column.type === "select" ||
                      ["statusEntrega", "situacao", "prioridade", "disponibilidade", "status"].includes(column.name) ? (
                        <Badge tone={statusTone(record[column.name])}>
                          {formatLabel(record[column.name])}
                        </Badge>
                      ) : (
                        displayValue(record[column.name], column.type)
                      )}
                    </td>
                  ))}
                  <td className="border-b px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setViewing(record)}
                        aria-label="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(record)}
                            aria-label="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteRecord(record)}
                            aria-label="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredRecords.length && (
                <tr>
                  <td className="px-4 py-8 text-muted-foreground" colSpan={config.columns.length + 1}>
                    {loading ? "Carregando..." : "Nenhum registro encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FieldInput({
  field,
  value,
  relations,
  onChange,
  onItemChange,
  onItemAdd,
  onItemRemove
}: {
  field: FieldConfig;
  value: unknown;
  relations: RelationData;
  onChange: (value: unknown) => void;
  onItemChange: (field: FieldConfig, index: number, name: string, value: unknown) => void;
  onItemAdd: (field: FieldConfig) => void;
  onItemRemove: (field: FieldConfig, index: number) => void;
}) {
  const fullWidth = field.type === "textarea" || field.type === "items" || field.type === "multiRelation";

  if (field.type === "items") {
    const rows = Array.isArray(value) ? value : [];

    return (
      <div className={fullWidth ? "lg:col-span-2" : ""}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label>{field.label}</Label>
          <Button type="button" size="sm" variant="outline" onClick={() => onItemAdd(field)}>
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="rounded-md border p-3">
              <div className="mb-3 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onItemRemove(field, index)}
                >
                  Remover
                </Button>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {(field.fields ?? []).map((child) => (
                  <FieldInput
                    key={child.name}
                    field={child}
                    value={(row as Record<string, unknown>)[child.name]}
                    relations={relations}
                    onChange={(nextValue) => onItemChange(field, index, child.name, nextValue)}
                    onItemChange={onItemChange}
                    onItemAdd={onItemAdd}
                    onItemRemove={onItemRemove}
                  />
                ))}
              </div>
            </div>
          ))}

          {!rows.length && (
            <div className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
              Nenhum item adicionado.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (field.type === "multiRelation" && field.relation) {
    const selected = Array.isArray(value) ? value.map(String) : [];
    const options = relations[field.relation] ?? [];

    return (
      <div className="lg:col-span-2">
        <Label>{field.label}</Label>
        <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {options.map((option) => {
            const optionValue = option.id;
            const checked = selected.includes(optionValue);
            const label = String(option[field.relationLabel ?? "id"] ?? option.id);

            return (
              <label
                key={optionValue}
                className="flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange([...selected, optionValue]);
                    } else {
                      onChange(selected.filter((item) => item !== optionValue));
                    }
                  }}
                />
                <span className="truncate">{label}</span>
              </label>
            );
          })}
          {!options.length && (
            <p className="text-sm text-muted-foreground">Nenhuma opção cadastrada.</p>
          )}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
        {field.label}
      </label>
    );
  }

  return (
    <div className={fullWidth ? "lg:col-span-2" : ""}>
      <Label htmlFor={field.name}>
        {field.label}
        {field.required ? " *" : ""}
      </Label>
      <div className="mt-2">
        {field.type === "textarea" ? (
          <Textarea
            id={field.name}
            value={String(value ?? "")}
            required={field.required}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : field.type === "select" ? (
          <Select
            id={field.name}
            value={String(value ?? field.options?.[0]?.value ?? "")}
            required={field.required}
            onChange={(event) => onChange(event.target.value)}
          >
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ) : field.type === "relation" && field.relation ? (
          <Select
            id={field.name}
            value={String(value ?? "")}
            required={field.required}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="">Selecionar</option>
            {(relations[field.relation] ?? []).map((option) => (
              <option key={option.id} value={option.id}>
                {String(option[field.relationLabel ?? "id"] ?? option.id)}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            id={field.name}
            value={
              field.type === "date"
                ? toDateInputValue(value)
                : value === undefined || value === null
                  ? ""
                  : String(value)
            }
            type={field.type === "date" ? "date" : field.type === "number" || field.type === "currency" ? "number" : "text"}
            step={field.type === "currency" ? "0.01" : field.type === "number" ? "any" : undefined}
            required={field.required}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </div>
    </div>
  );
}

function DetailPanel({
  config,
  record,
  relations,
  onClose,
  onEdit
}: {
  config: ModuleConfig;
  record: RecordData;
  relations: RelationData;
  onClose: () => void;
  onEdit?: () => void;
}) {
  return (
    <section className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Detalhe</h3>
        <div className="flex gap-2">
          {onEdit && (
            <Button type="button" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {config.fields.map((field) => (
          <DetailValue
            key={field.name}
            field={field}
            value={record[field.name]}
            relations={relations}
          />
        ))}
      </div>
    </section>
  );
}

function DetailValue({
  field,
  value,
  relations
}: {
  field: FieldConfig;
  value: unknown;
  relations: RelationData;
}) {
  if (field.type === "items") {
    const rows = Array.isArray(value) ? value : [];

    return (
      <div className="md:col-span-2 xl:col-span-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">{field.label}</p>
        <div className="mt-2 space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="grid gap-2 rounded-md border p-3 md:grid-cols-2 xl:grid-cols-3">
              {(field.fields ?? []).map((child) => (
                <DetailValue
                  key={child.name}
                  field={child}
                  value={(row as Record<string, unknown>)[child.name]}
                  relations={relations}
                />
              ))}
            </div>
          ))}
          {!rows.length && <p className="text-sm text-muted-foreground">-</p>}
        </div>
      </div>
    );
  }

  let rendered = displayValue(value, field.type);

  if (field.type === "relation" && field.relation && value) {
    const option = (relations[field.relation] ?? []).find((item) => item.id === String(value));
    rendered = String(option?.[field.relationLabel ?? "id"] ?? value);
  }

  if (field.type === "multiRelation" && field.relation) {
    const ids = Array.isArray(value) ? value.map(String) : [];
    rendered =
      (relations[field.relation] ?? [])
        .filter((item) => ids.includes(item.id))
        .map((item) => String(item[field.relationLabel ?? "id"] ?? item.id))
        .join(", ") || "-";
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{field.label}</p>
      <p className="mt-1 break-words text-sm">{rendered}</p>
    </div>
  );
}
