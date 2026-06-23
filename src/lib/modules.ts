import type { ResourceKey } from "@/src/lib/validation";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "checkbox"
  | "relation"
  | "multiRelation"
  | "multiSelect"
  | "combobox"
  | "items";

export type SortMode = "text" | "number" | "date" | "natural" | "militaryRank";
export type RelationDisplay = "default" | "commitment" | "personnel" | "vehicle";
export type RelationGroup = "ug" | "militaryRank" | "vehicleCategory";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  relation?: ResourceKey;
  relationLabel?: string;
  relationDisplay?: RelationDisplay;
  relationGroupBy?: RelationGroup;
  suggestionSource?: { resource: ResourceKey; field: string };
  fields?: FieldConfig[];
  readOnly?: boolean;
  placeholder?: string;
};

export type GroupConfig = {
  field: string;
  labels?: Record<string, string>;
  order?: string[];
  fallbackLabel?: string;
};

export type SortConfig = {
  field: string;
  direction?: "asc" | "desc";
  mode?: SortMode;
  tieBreakerField?: string;
};

export type ModuleConfig = {
  key: ResourceKey;
  title: string;
  navLabel: string;
  group: "Orçamento" | "Operacional" | "Administração";
  href: string;
  searchFields: string[];
  columns: Array<{ name: string; label: string; type?: FieldType; sortMode?: SortMode }>;
  fields: FieldConfig[];
  groupBy?: GroupConfig;
  defaultSort?: SortConfig;
};

export const APP_NAME = "Painel Logístico – Cia C/2º Gpt E";

export const YES_NO_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" }
];

export const UG_GROUP_LABELS: Record<string, string> = {
  "167015": "UG 167015",
  "160015": "UG 160015"
};

export const UG_GROUP_ORDER = ["167015", "160015", "__fallback"];

export const VEHICLE_CATEGORY_OPTIONS = [
  { value: "viatura_administrativa", label: "Viatura Administrativa" },
  { value: "viatura_operacional", label: "Viatura Operacional" },
  { value: "equipamento", label: "Equipamento" }
];

export const VEHICLE_CATEGORY_LABELS: Record<string, string> = {
  viatura_administrativa: "Viatura Administrativa",
  viatura_operacional: "Viatura Operacional",
  equipamento: "Equipamento"
};

export const VEHICLE_CATEGORY_ORDER = [
  "viatura_administrativa",
  "viatura_operacional",
  "equipamento",
  "__fallback"
];

export const MAINTENANCE_TYPE_OPTIONS = [
  { value: "instalacao", label: "Instalação" },
  { value: "aquisicao", label: "Aquisição" }
];

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  instalacao: "Instalação",
  aquisicao: "Aquisição"
};

export const MILITARY_RANK_OPTIONS = [
  { value: "Gen Ex", label: "Gen Ex" },
  { value: "Gen Div", label: "Gen Div" },
  { value: "Gen Bda", label: "Gen Bda" },
  { value: "Cel", label: "Cel" },
  { value: "TC", label: "TC" },
  { value: "Maj", label: "Maj" },
  { value: "Cap", label: "Cap" },
  { value: "2º Ten", label: "2º Ten" },
  { value: "1º Ten", label: "1º Ten" },
  { value: "Asp Of", label: "Asp Of" },
  { value: "ST", label: "ST" },
  { value: "1º Sgt", label: "1º Sgt" },
  { value: "2º Sgt", label: "2º Sgt" },
  { value: "3º Sgt", label: "3º Sgt" },
  { value: "Cb", label: "Cb" },
  { value: "Sd", label: "Sd" },
  { value: "Sd Rcr", label: "Sd Rcr" }
];

export const MILITARY_RANK_ORDER = MILITARY_RANK_OPTIONS.map((item) => item.value);

export const PERSONNEL_STATUS_OPTIONS = [
  { value: "pronto", label: "Pronto" },
  { value: "ferias", label: "Férias" },
  { value: "dispensa_medica", label: "Dispensa Médica" },
  { value: "encostado", label: "Encostado" },
  { value: "adido", label: "Adido" },
  { value: "missao_externa", label: "Missão Externa" },
  { value: "outros", label: "Outros" }
];

export const SERVICE_SCALE_OPTIONS = [
  { value: "", label: "Sem escala" },
  { value: "of_dia", label: "Oficial de dia" },
  { value: "adj_dia", label: "Adjunto de dia" },
  { value: "sgt_dia", label: "Sargento de dia" },
  { value: "cmt_guarda", label: "Comandante da guarda" },
  { value: "cmt_guarda_res", label: "Comandante da guarda reserva" },
  { value: "cmt_pa_harpia", label: "Comandante do PA Harpia" },
  { value: "cb_pa_harpia", label: "Cabo do PA Harpia" },
  { value: "cb_guarda", label: "Cabo da guarda" },
  { value: "cb_guarda_res", label: "Cabo da guarda reserva" },
  { value: "cb_dia", label: "Cabo de dia" },
  { value: "sentinela", label: "Sentinela" },
  { value: "plantao", label: "Plantão" },
  { value: "sentinela_res", label: "Sentinela reserva" },
  { value: "motorista_de_dia", label: "Motorista de dia" },
  { value: "motorista_sup_dia", label: "Motorista suplente de dia" }
];

export const SERVICE_SCALE_MULTI_OPTIONS = SERVICE_SCALE_OPTIONS.filter((item) => item.value);

const ugGroup: GroupConfig = {
  field: "ug",
  labels: UG_GROUP_LABELS,
  order: UG_GROUP_ORDER,
  fallbackLabel: "Outros"
};

export const moduleConfigs: Record<ResourceKey, ModuleConfig> = {
  commitments: {
    key: "commitments",
    title: "Empenhos",
    navLabel: "Empenhos",
    group: "Orçamento",
    href: "/app/commitments",
    searchFields: ["ug", "numeroNE", "numeroNC", "material", "descricao"],
    columns: [
      { name: "ug", label: "UG" },
      { name: "numeroNE", label: "NE", sortMode: "natural" },
      { name: "numeroNC", label: "NC", sortMode: "natural" },
      { name: "dataEmissao", label: "Emissão", type: "date", sortMode: "date" },
      { name: "prazoEntrega", label: "Prazo", type: "date", sortMode: "date" },
      { name: "valorOperacao", label: "Valor", type: "currency", sortMode: "number" },
      { name: "statusEntrega", label: "Status", type: "select" }
    ],
    fields: [
      { name: "ug", label: "UG", type: "text" },
      { name: "numeroNE", label: "NE", type: "text", required: true },
      { name: "numeroNC", label: "NC", type: "text" },
      { name: "pi", label: "PI", type: "text" },
      { name: "dataEmissao", label: "Data de emissão", type: "date" },
      { name: "valorOperacao", label: "Valor da operação", type: "currency" },
      { name: "supplierId", label: "Fornecedor cadastrado", type: "relation", relation: "suppliers", relationLabel: "razaoSocial" },
      { name: "material", label: "Material", type: "text" },
      { name: "formalizacao", label: "Formalização", type: "select", options: YES_NO_OPTIONS },
      { name: "notaFiscal", label: "Nota fiscal", type: "select", options: YES_NO_OPTIONS },
      { name: "liquidacao", label: "Liquidação", type: "select", options: YES_NO_OPTIONS },
      {
        name: "statusEntrega",
        label: "Status da entrega",
        type: "select",
        options: [
          { value: "no_prazo", label: "No prazo" },
          { value: "atrasado", label: "Atrasado" },
          { value: "entregue", label: "Entregue" }
        ]
      },
      { name: "descricao", label: "Descrição", type: "textarea" }
    ],
    groupBy: ugGroup,
    defaultSort: { field: "numeroNE", direction: "asc", mode: "natural" }
  },
  payables: {
    key: "payables",
    title: "RP",
    navLabel: "RP",
    group: "Orçamento",
    href: "/app/payables",
    searchFields: ["ug", "numeroNE", "material", "descricao", "status"],
    columns: [
      { name: "ug", label: "UG" },
      { name: "numeroNE", label: "NE", sortMode: "natural" },
      { name: "dataEmissao", label: "Emissão", type: "date", sortMode: "date" },
      { name: "valorALiquidar", label: "A liquidar", type: "currency", sortMode: "number" },
      { name: "material", label: "Material" },
      { name: "status", label: "Status", type: "select" }
    ],
    fields: [
      { name: "ug", label: "UG", type: "text" },
      { name: "pi", label: "PI", type: "text" },
      { name: "nd", label: "ND", type: "text" },
      { name: "numeroNE", label: "NE", type: "text", required: true },
      { name: "dataEmissao", label: "Data de emissão", type: "date" },
      { name: "dias", label: "Dias", type: "number" },
      { name: "valorALiquidar", label: "A liquidar", type: "currency" },
      { name: "supplierId", label: "Fornecedor cadastrado", type: "relation", relation: "suppliers", relationLabel: "razaoSocial" },
      { name: "material", label: "Material", type: "text" },
      { name: "formalizacao", label: "Formalização", type: "select", options: YES_NO_OPTIONS },
      { name: "liquidacao", label: "Liquidação", type: "select", options: YES_NO_OPTIONS },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "aguardando_fornecedor", label: "Aguardando Fornecedor" },
          { value: "cancelar_empenho", label: "Cancelar Empenho" }
        ]
      },
      { name: "descricao", label: "Descrição", type: "textarea" }
    ],
    groupBy: ugGroup,
    defaultSort: { field: "numeroNE", direction: "asc", mode: "natural" }
  },
  "credit-notes": {
    key: "credit-notes",
    title: "Notas de Crédito",
    navLabel: "Notas de Crédito",
    group: "Orçamento",
    href: "/app/credit-notes",
    searchFields: ["ug", "numeroNC", "objeto", "sugestao", "observacoes", "pi"],
    columns: [
      { name: "ug", label: "UG" },
      { name: "numeroNC", label: "NC", sortMode: "natural" },
      { name: "prazo", label: "Prazo", type: "date", sortMode: "date" },
      { name: "valorNC", label: "Valor NC", type: "currency", sortMode: "number" },
      { name: "saldoNC", label: "Saldo", type: "currency", sortMode: "number" },
      { name: "emTela", label: "Em tela", type: "checkbox" }
    ],
    fields: [
      { name: "ug", label: "UG", type: "text" },
      { name: "numeroNC", label: "NC", type: "text", required: true },
      {
        name: "prazoTipo",
        label: "Tipo de prazo",
        type: "select",
        options: [
          { value: "date", label: "Data" },
          { value: "imediato", label: "Imediato" }
        ]
      },
      { name: "prazo", label: "Prazo", type: "date" },
      { name: "pi", label: "PI", type: "text" },
      { name: "nd", label: "ND", type: "text" },
      { name: "valorNC", label: "Valor NC", type: "currency" },
      { name: "objeto", label: "Objeto", type: "text" },
      { name: "sugestao", label: "Sugestão", type: "textarea" },
      { name: "observacoes", label: "Observações", type: "textarea" },
      { name: "solicitarRecolhimento", label: "Solicitar recolhimento", type: "checkbox" },
      { name: "emTela", label: "Em tela", type: "checkbox" },
      {
        name: "commitmentIds",
        label: "Empenhos",
        type: "multiRelation",
        relation: "commitments",
        relationDisplay: "commitment",
        relationGroupBy: "ug"
      }
    ],
    groupBy: ugGroup,
    defaultSort: { field: "numeroNC", direction: "asc", mode: "natural" }
  },
  suppliers: {
    key: "suppliers",
    title: "Fornecedores",
    navLabel: "Fornecedores",
    group: "Orçamento",
    href: "/app/suppliers",
    searchFields: ["razaoSocial", "cnpj", "email", "cidade", "uf"],
    columns: [
      { name: "razaoSocial", label: "Razão social" },
      { name: "cnpj", label: "CNPJ" },
      { name: "email", label: "E-mail" },
      { name: "contato", label: "Contato" },
      { name: "cidade", label: "Cidade" },
      { name: "uf", label: "UF" }
    ],
    fields: [
      { name: "razaoSocial", label: "Razão social", type: "text", required: true },
      { name: "cnpj", label: "CNPJ", type: "text" },
      { name: "email", label: "E-mail", type: "text" },
      { name: "contato", label: "Contato", type: "text" },
      { name: "endereco", label: "Endereço", type: "textarea" },
      { name: "cidade", label: "Cidade", type: "text" },
      { name: "uf", label: "UF", type: "text" },
      { name: "observacoes", label: "Observações", type: "textarea" }
    ]
  },
  "maintenance-needs": {
    key: "maintenance-needs",
    title: "Necessidades e Reformas",
    navLabel: "Necessidades",
    group: "Operacional",
    href: "/app/maintenance-needs",
    searchFields: ["tipo", "instalacao", "ambiente", "servicoSolicitado", "numeroNE", "ordemServico"],
    columns: [
      { name: "tipo", label: "Tipo", type: "select" },
      { name: "instalacao", label: "Instalação" },
      { name: "servicoSolicitado", label: "Serviço" },
      { name: "prioridade", label: "Prioridade", type: "select" },
      { name: "situacao", label: "Situação", type: "select" },
      { name: "totalOrcamento", label: "Orçamento", type: "currency", sortMode: "number" }
    ],
    fields: [
      { name: "tipo", label: "Tipo", type: "select", options: MAINTENANCE_TYPE_OPTIONS },
      { name: "instalacao", label: "Instalação/setor", type: "text", required: true },
      { name: "ambiente", label: "Ambiente", type: "text" },
      { name: "servicoSolicitado", label: "Serviço solicitado", type: "textarea", required: true },
      {
        name: "prioridade",
        label: "Prioridade",
        type: "select",
        options: [
          { value: "baixa", label: "Baixa" },
          { value: "media", label: "Média" },
          { value: "alta", label: "Alta" },
          { value: "critica", label: "Crítica" }
        ]
      },
      {
        name: "situacao",
        label: "Situação",
        type: "select",
        options: [
          { value: "aberta", label: "Aberta" },
          { value: "em_andamento", label: "Em andamento" },
          { value: "resolvida", label: "Resolvida" },
          { value: "cancelada", label: "Cancelada" }
        ]
      },
      { name: "credito", label: "Crédito", type: "text" },
      { name: "numeroOpus", label: "Nº OPUS", type: "text" },
      { name: "ordemServico", label: "Ordem de serviço", type: "text" },
      { name: "numeroNE", label: "NE empenho", type: "text" },
      { name: "dataInicio", label: "Data início", type: "date" },
      { name: "dataTermino", label: "Data término", type: "date" },
      { name: "observacoes", label: "Observações", type: "textarea" },
      {
        name: "budgetItems",
        label: "Orçamento detalhado",
        type: "items",
        fields: [
          { name: "codigo", label: "Código", type: "text" },
          { name: "fonte", label: "Fonte", type: "text" },
          { name: "descricao", label: "Descrição", type: "textarea" },
          { name: "unidade", label: "Unidade", type: "text" },
          { name: "quantidade", label: "Qtd", type: "number" },
          { name: "valorUnitario", label: "Valor unit", type: "currency" },
          { name: "valorComBdi", label: "Valor BDI", type: "currency" },
          { name: "valorTotal", label: "Total", type: "currency" },
          { name: "percentual", label: "%", type: "number" }
        ]
      }
    ],
    groupBy: {
      field: "tipo",
      labels: MAINTENANCE_TYPE_LABELS,
      order: ["instalacao", "aquisicao", "__fallback"],
      fallbackLabel: "Sem tipo"
    }
  },
  vehicles: {
    key: "vehicles",
    title: "Viaturas e Equipamentos",
    navLabel: "Viaturas e Equipamentos",
    group: "Operacional",
    href: "/app/vehicles",
    searchFields: ["categoria", "marcaModelo", "placaOuIdentificacao", "localAtual", "situacaoAtual"],
    columns: [
      { name: "categoria", label: "Categoria", type: "select" },
      { name: "marcaModelo", label: "Viatura/Equipamento" },
      { name: "placaOuIdentificacao", label: "Identificação" },
      { name: "disponibilidade", label: "Disponibilidade", type: "select" },
      { name: "tipoPneu", label: "Pneu" },
      { name: "localAtual", label: "Local" }
    ],
    fields: [
      { name: "categoria", label: "Categoria", type: "select", options: VEHICLE_CATEGORY_OPTIONS },
      { name: "marcaModelo", label: "Viatura/Equipamento", type: "text", required: true },
      { name: "placaOuIdentificacao", label: "Placa/identificação", type: "text" },
      {
        name: "disponibilidade",
        label: "Disponibilidade",
        type: "select",
        options: [
          { value: "disponivel", label: "Disponível" },
          { value: "indisponivel", label: "Indisponível" }
        ]
      },
      { name: "tipoPneu", label: "Tipo de pneu", type: "text" },
      { name: "localAtual", label: "Local atual", type: "text" },
      { name: "situacaoAtual", label: "Situação atual", type: "textarea" },
      { name: "observacoes", label: "Observações", type: "textarea" },
      {
        name: "history",
        label: "Histórico",
        type: "items",
        fields: [
          { name: "data", label: "Data", type: "date" },
          { name: "tipo", label: "Tipo", type: "text" },
          { name: "descricao", label: "Descrição", type: "textarea" },
          { name: "local", label: "Local", type: "text" }
        ]
      }
    ],
    groupBy: {
      field: "categoria",
      labels: VEHICLE_CATEGORY_LABELS,
      order: VEHICLE_CATEGORY_ORDER,
      fallbackLabel: "Sem categoria"
    },
    defaultSort: { field: "marcaModelo", direction: "asc", mode: "natural" }
  },
  personnel: {
    key: "personnel",
    title: "Pessoal",
    navLabel: "Pessoal",
    group: "Operacional",
    href: "/app/personnel",
    searchFields: ["postoGraduacao", "nome", "pelotao", "funcao", "escalaServico"],
    columns: [
      { name: "postoGraduacao", label: "Posto/grad", sortMode: "militaryRank" },
      { name: "nome", label: "Nome" },
      { name: "pelotao", label: "Pelotão" },
      { name: "funcao", label: "Função" },
      { name: "escalaServico", label: "Escala de Serviço", type: "multiSelect" },
      { name: "situacao", label: "Situação", type: "select" }
    ],
    fields: [
      { name: "postoGraduacao", label: "Posto/grad", type: "select", required: true, options: MILITARY_RANK_OPTIONS },
      { name: "nome", label: "Nome", type: "text", required: true },
      {
        name: "pelotao",
        label: "Pelotão",
        type: "combobox",
        suggestionSource: { resource: "personnel", field: "pelotao" }
      },
      { name: "funcao", label: "Função", type: "text" },
      { name: "escalaServico", label: "Escala de Serviço", type: "multiSelect", options: SERVICE_SCALE_MULTI_OPTIONS },
      { name: "situacao", label: "Situação", type: "select", options: PERSONNEL_STATUS_OPTIONS },
      { name: "observacoes", label: "Observações", type: "textarea" }
    ],
    groupBy: {
      field: "pelotao",
      fallbackLabel: "Sem pelotão"
    },
    defaultSort: {
      field: "postoGraduacao",
      direction: "asc",
      mode: "militaryRank",
      tieBreakerField: "nome"
    }
  },
  documents: {
    key: "documents",
    title: "Documentação",
    navLabel: "Documentação",
    group: "Operacional",
    href: "/app/documents",
    searchFields: ["numeroDiex", "numeroDiexResposta", "responsavel", "assunto"],
    columns: [
      { name: "numeroDiex", label: "DIEx" },
      { name: "prazo", label: "Prazo", type: "date", sortMode: "date" },
      { name: "responsavel", label: "Responsável" },
      { name: "numeroDiexResposta", label: "Resposta" },
      { name: "situacao", label: "Situação", type: "select" }
    ],
    fields: [
      { name: "numeroDiex", label: "Nº DIEx", type: "text", required: true },
      { name: "prazo", label: "Prazo", type: "date" },
      { name: "responsavel", label: "Responsável", type: "text" },
      { name: "numeroDiexResposta", label: "Nº DIEx resposta", type: "text" },
      { name: "assunto", label: "Assunto", type: "textarea" },
      {
        name: "situacao",
        label: "Situação",
        type: "select",
        options: [
          { value: "pendente", label: "Pendente" },
          { value: "respondido", label: "Respondido" },
          { value: "atrasado", label: "Atrasado" }
        ]
      },
      { name: "observacoes", label: "Observações", type: "textarea" }
    ]
  },
  activities: {
    key: "activities",
    title: "Atividades",
    navLabel: "Atividades",
    group: "Operacional",
    href: "/app/activities",
    searchFields: ["nome", "responsavel", "descricao"],
    columns: [
      { name: "nome", label: "Atividade" },
      { name: "data", label: "Data", type: "date", sortMode: "date" },
      { name: "responsavel", label: "Responsável" },
      { name: "personnelIds", label: "Efetivo" },
      { name: "vehicleIds", label: "Viaturas/Equipamentos" }
    ],
    fields: [
      { name: "nome", label: "Nome da atividade", type: "text", required: true },
      { name: "data", label: "Data", type: "date" },
      { name: "responsavel", label: "Responsável", type: "text" },
      { name: "descricao", label: "Descrição", type: "textarea" },
      {
        name: "personnelIds",
        label: "Efetivo",
        type: "multiRelation",
        relation: "personnel",
        relationDisplay: "personnel",
        relationGroupBy: "militaryRank"
      },
      {
        name: "vehicleIds",
        label: "Viaturas/Equipamentos",
        type: "multiRelation",
        relation: "vehicles",
        relationDisplay: "vehicle",
        relationGroupBy: "vehicleCategory"
      },
      { name: "observacoes", label: "Observações", type: "textarea" }
    ]
  }
};

export const navGroups = [
  {
    title: "Orçamento",
    items: ["commitments", "payables", "credit-notes", "suppliers"] as ResourceKey[]
  },
  {
    title: "Operacional",
    items: ["vehicles", "personnel", "maintenance-needs", "documents", "activities"] as ResourceKey[]
  }
];
