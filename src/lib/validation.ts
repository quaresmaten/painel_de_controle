import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === null) return undefined;
  return value;
};

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional()
);

const requiredString = z.string().trim().min(1, "Campo obrigatório");

const optionalStringArray = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return [String(value).trim()].filter(Boolean);
}, z.array(z.string()).default([]));

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}, z.number().optional());

const optionalDate = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return new Date(String(value));
}, z.date().optional());

const optionalBoolean = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return Boolean(value);
}, z.boolean().optional());

const idString = z.preprocess(emptyToUndefined, z.string().trim().optional());

const allocationSchema = z.object({
  requisicao: optionalString,
  valorRequisicao: optionalNumber.default(0),
  numeroNEGerada: optionalString,
  valorNE: optionalNumber.default(0),
  valorLiquidado: optionalNumber.default(0),
  valorNaoLiquidado: optionalNumber.default(0)
});

const budgetItemSchema = z.object({
  codigo: optionalString,
  fonte: optionalString,
  descricao: optionalString,
  unidade: optionalString,
  quantidade: optionalNumber.default(0),
  valorUnitario: optionalNumber.default(0),
  valorComBdi: optionalNumber.default(0),
  valorTotal: optionalNumber.default(0),
  percentual: optionalNumber.default(0)
});

const vehicleHistorySchema = z.object({
  data: optionalDate,
  tipo: optionalString,
  descricao: optionalString,
  local: optionalString,
  createdBy: idString
});

export const resourceSchemas = {
  suppliers: z.object({
    razaoSocial: requiredString,
    cnpj: optionalString,
    email: optionalString,
    contato: optionalString,
    endereco: optionalString,
    cidade: optionalString,
    uf: optionalString,
    observacoes: optionalString
  }),
  commitments: z.object({
    ug: optionalString,
    numeroNE: requiredString,
    numeroNC: optionalString,
    pi: optionalString,
    dataEmissao: optionalDate,
    prazoEntrega: optionalDate,
    diasDesdeEmissao: optionalNumber.default(0),
    descricao: optionalString,
    valorOperacao: optionalNumber.default(0),
    supplierId: idString,
    empresaTexto: optionalString,
    material: optionalString,
    formalizacao: optionalString,
    notaFiscal: optionalString,
    liquidacao: optionalString,
    situacao: optionalString,
    motivo: optionalString,
    statusEntrega: z.enum(["entregue", "no_prazo", "atrasado"]).default("no_prazo")
  }),
  payables: z.object({
    ug: optionalString,
    cgcFex: optionalString,
    pi: optionalString,
    nd: optionalString,
    numeroNE: requiredString,
    dataEmissao: optionalDate,
    dias: optionalNumber.default(0),
    descricao: optionalString,
    valorALiquidar: optionalNumber.default(0),
    supplierId: idString,
    empresaTexto: optionalString,
    material: optionalString,
    formalizacao: optionalString,
    liquidacao: optionalString,
    situacao: optionalString,
    status: optionalString
  }),
  "credit-notes": z.object({
    ug: optionalString,
    numeroNC: requiredString,
    prazo: optionalDate,
    prazoTipo: z.enum(["date", "imediato"]).default("date"),
    pi: optionalString,
    nd: optionalString,
    valorNC: optionalNumber.default(0),
    saldoNC: optionalNumber.default(0),
    objeto: optionalString,
    sugestao: optionalString,
    observacoes: optionalString,
    solicitarRecolhimento: optionalBoolean.default(false),
    emTela: optionalBoolean.default(false),
    commitmentIds: z.array(z.string()).default([]),
    allocations: z.array(allocationSchema).optional()
  }),
  "maintenance-needs": z.object({
    tipo: z.enum(["instalacao", "aquisicao"]).default("instalacao"),
    instalacao: requiredString,
    ambiente: optionalString,
    servicoSolicitado: requiredString,
    prioridade: z.enum(["baixa", "media", "alta", "critica"]).default("media"),
    situacao: z.enum(["aberta", "em_andamento", "resolvida", "cancelada"]).default("aberta"),
    credito: optionalString,
    numeroOpus: optionalString,
    ordemServico: optionalString,
    numeroNE: optionalString,
    dataInicio: optionalDate,
    dataTermino: optionalDate,
    observacoes: optionalString,
    budgetItems: z.array(budgetItemSchema).default([]),
    totalOrcamento: optionalNumber.default(0)
  }),
  vehicles: z.object({
    categoria: z.enum(["viatura_administrativa", "viatura_operacional", "equipamento"]).optional(),
    marcaModelo: requiredString,
    placaOuIdentificacao: optionalString,
    disponibilidade: z.enum(["disponivel", "indisponivel"]).default("disponivel"),
    tipoPneu: optionalString,
    localAtual: optionalString,
    situacaoAtual: optionalString,
    observacoes: optionalString,
    history: z.array(vehicleHistorySchema).default([])
  }),
  personnel: z.object({
    postoGraduacao: requiredString,
    nome: requiredString,
    pelotao: optionalString,
    funcao: optionalString,
    escalaServico: optionalStringArray,
    situacao: z
      .enum([
        "pronto",
        "ferias",
        "dispensa_medica",
        "encostado",
        "adido",
        "missao_externa",
        "outros",
        "missao"
      ])
      .default("pronto"),
    destinoOuMissao: optionalString,
    observacoes: optionalString
  }),
  documents: z.object({
    numeroDiex: requiredString,
    prazo: optionalDate,
    responsavel: optionalString,
    numeroDiexResposta: optionalString,
    assunto: optionalString,
    situacao: z.enum(["pendente", "respondido", "atrasado"]).default("pendente"),
    observacoes: optionalString
  }),
  activities: z.object({
    nome: requiredString,
    data: optionalDate,
    responsavel: optionalString,
    descricao: optionalString,
    personnelIds: z.array(z.string()).default([]),
    vehicleIds: z.array(z.string()).default([]),
    observacoes: optionalString
  })
};

export type ResourceKey = keyof typeof resourceSchemas;

export function isResourceKey(value: string): value is ResourceKey {
  return value in resourceSchemas;
}
