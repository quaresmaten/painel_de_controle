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
  | "items";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  relation?: ResourceKey;
  relationLabel?: string;
  fields?: FieldConfig[];
  readOnly?: boolean;
  placeholder?: string;
};

export type ModuleConfig = {
  key: ResourceKey;
  title: string;
  navLabel: string;
  group: "Orçamento" | "Operacional" | "Administração";
  href: string;
  searchFields: string[];
  columns: Array<{ name: string; label: string; type?: FieldType }>;
  fields: FieldConfig[];
};

export const moduleConfigs: Record<ResourceKey, ModuleConfig> = {
  commitments: {
    key: "commitments",
    title: "Empenhos",
    navLabel: "Empenhos",
    group: "Orçamento",
    href: "/app/commitments",
    searchFields: ["numeroNE", "numeroNC", "empresaTexto", "material", "descricao"],
    columns: [
      { name: "numeroNE", label: "NE" },
      { name: "numeroNC", label: "NC" },
      { name: "dataEmissao", label: "Emissão", type: "date" },
      { name: "prazoEntrega", label: "Prazo", type: "date" },
      { name: "valorOperacao", label: "Valor", type: "currency" },
      { name: "statusEntrega", label: "Status", type: "select" }
    ],
    fields: [
      { name: "ug", label: "UG", type: "text" },
      { name: "numeroNE", label: "NE", type: "text", required: true },
      { name: "numeroNC", label: "NC", type: "text" },
      { name: "pi", label: "PI", type: "text" },
      { name: "dataEmissao", label: "Data de emissão", type: "date" },
      { name: "valorOperacao", label: "Valor operação", type: "currency" },
      { name: "supplierId", label: "Fornecedor cadastrado", type: "relation", relation: "suppliers", relationLabel: "razaoSocial" },
      { name: "empresaTexto", label: "Empresa texto", type: "text" },
      { name: "material", label: "Material", type: "text" },
      { name: "formalizacao", label: "Formalização", type: "text" },
      { name: "notaFiscal", label: "Nota fiscal", type: "text" },
      { name: "liquidacao", label: "Liquidação", type: "text" },
      { name: "situacao", label: "Situação", type: "text" },
      { name: "motivo", label: "Motivo", type: "text" },
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
    ]
  },
  payables: {
    key: "payables",
    title: "RP",
    navLabel: "RP",
    group: "Orçamento",
    href: "/app/payables",
    searchFields: ["numeroNE", "empresaTexto", "material", "descricao", "status"],
    columns: [
      { name: "numeroNE", label: "NE" },
      { name: "dataEmissao", label: "Emissão", type: "date" },
      { name: "valorALiquidar", label: "A liquidar", type: "currency" },
      { name: "empresaTexto", label: "Empresa" },
      { name: "material", label: "Material" },
      { name: "status", label: "Status" }
    ],
    fields: [
      { name: "ug", label: "UG", type: "text" },
      { name: "cgcFex", label: "CGCFEx", type: "text" },
      { name: "pi", label: "PI", type: "text" },
      { name: "nd", label: "ND", type: "text" },
      { name: "numeroNE", label: "NE", type: "text", required: true },
      { name: "dataEmissao", label: "Data de emissão", type: "date" },
      { name: "dias", label: "Dias", type: "number" },
      { name: "valorALiquidar", label: "A liquidar", type: "currency" },
      { name: "supplierId", label: "Fornecedor cadastrado", type: "relation", relation: "suppliers", relationLabel: "razaoSocial" },
      { name: "empresaTexto", label: "Empresa texto", type: "text" },
      { name: "material", label: "Material", type: "text" },
      { name: "formalizacao", label: "Formalização", type: "text" },
      { name: "liquidacao", label: "Liquidação", type: "text" },
      { name: "situacao", label: "Situação", type: "text" },
      { name: "status", label: "Status", type: "text" },
      { name: "descricao", label: "Descrição", type: "textarea" }
    ]
  },
  "credit-notes": {
    key: "credit-notes",
    title: "Notas de Crédito",
    navLabel: "Notas de Crédito",
    group: "Orçamento",
    href: "/app/credit-notes",
    searchFields: ["numeroNC", "objeto", "sugestao", "observacoes", "pi"],
    columns: [
      { name: "numeroNC", label: "NC" },
      { name: "prazo", label: "Prazo", type: "date" },
      { name: "valorNC", label: "Valor NC", type: "currency" },
      { name: "saldoNC", label: "Saldo", type: "currency" },
      { name: "objeto", label: "Objeto" },
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
        name: "allocations",
        label: "Requisições e empenhos",
        type: "items",
        fields: [
          { name: "requisicao", label: "Requisição", type: "text" },
          { name: "valorRequisicao", label: "Valor req", type: "currency" },
          { name: "numeroNEGerada", label: "NE gerada", type: "text" },
          { name: "valorNE", label: "Valor NE", type: "currency" },
          { name: "valorLiquidado", label: "Liquidado", type: "currency" }
        ]
      }
    ]
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
    searchFields: ["instalacao", "ambiente", "servicoSolicitado", "numeroNE", "ordemServico"],
    columns: [
      { name: "instalacao", label: "Instalação" },
      { name: "servicoSolicitado", label: "Serviço" },
      { name: "prioridade", label: "Prioridade" },
      { name: "situacao", label: "Situação" },
      { name: "totalOrcamento", label: "Orçamento", type: "currency" }
    ],
    fields: [
      { name: "instalacao", label: "Instalação", type: "text", required: true },
      { name: "ambiente", label: "Ambiente", type: "text" },
      { name: "servicoSolicitado", label: "Serviço solicitado", type: "textarea", required: true },
      {
        name: "prioridade",
        label: "Prioridade",
        type: "select",
        options: [
          { value: "baixa", label: "Baixa" },
          { value: "media", label: "Media" },
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
    ]
  },
  vehicles: {
    key: "vehicles",
    title: "Viaturas",
    navLabel: "Viaturas",
    group: "Operacional",
    href: "/app/vehicles",
    searchFields: ["marcaModelo", "placaOuIdentificacao", "localAtual", "situacaoAtual"],
    columns: [
      { name: "marcaModelo", label: "Marca/modelo" },
      { name: "placaOuIdentificacao", label: "Identificação" },
      { name: "disponibilidade", label: "Disponibilidade" },
      { name: "tipoPneu", label: "Pneu" },
      { name: "localAtual", label: "Local" }
    ],
    fields: [
      { name: "marcaModelo", label: "Marca/modelo", type: "text", required: true },
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
    ]
  },
  personnel: {
    key: "personnel",
    title: "Pessoal",
    navLabel: "Pessoal",
    group: "Operacional",
    href: "/app/personnel",
    searchFields: ["postoGraduacao", "nome", "pelotao", "funcao", "destinoOuMissao"],
    columns: [
      { name: "postoGraduacao", label: "Posto/grad" },
      { name: "nome", label: "Nome" },
      { name: "pelotao", label: "Pelotão" },
      { name: "funcao", label: "Função" },
      { name: "situacao", label: "Situação" }
    ],
    fields: [
      { name: "postoGraduacao", label: "Posto/grad", type: "text", required: true },
      { name: "nome", label: "Nome", type: "text", required: true },
      { name: "pelotao", label: "Pelotão", type: "text" },
      { name: "funcao", label: "Função", type: "text" },
      {
        name: "situacao",
        label: "Situação",
        type: "select",
        options: [
          { value: "pronto", label: "Pronto" },
          { value: "ferias", label: "Férias" },
          { value: "missao", label: "Missão" },
          { value: "outros", label: "Outros" }
        ]
      },
      { name: "destinoOuMissao", label: "Destino/missão", type: "text" },
      { name: "observacoes", label: "Observações", type: "textarea" }
    ]
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
      { name: "prazo", label: "Prazo", type: "date" },
      { name: "responsavel", label: "Responsável" },
      { name: "numeroDiexResposta", label: "Resposta" },
      { name: "situacao", label: "Situação" }
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
      { name: "data", label: "Data", type: "date" },
      { name: "responsavel", label: "Responsável" },
      { name: "personnelIds", label: "Efetivo" },
      { name: "vehicleIds", label: "Viaturas" }
    ],
    fields: [
      { name: "nome", label: "Nome da atividade", type: "text", required: true },
      { name: "data", label: "Data", type: "date" },
      { name: "responsavel", label: "Responsável", type: "text" },
      { name: "descricao", label: "Descrição", type: "textarea" },
      { name: "personnelIds", label: "Efetivo", type: "multiRelation", relation: "personnel", relationLabel: "nome" },
      { name: "vehicleIds", label: "Viaturas", type: "multiRelation", relation: "vehicles", relationLabel: "marcaModelo" },
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
