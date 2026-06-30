import { describe, expect, it } from "vitest";

import { resourceSchemas } from "@/src/lib/validation";

const basePersonnel = {
  postoGraduacao: "Sd",
  nome: "Militar Teste",
  situacao: "pronto" as const
};

describe("validacao de recursos", () => {
  it("normaliza escala antiga em string para array", () => {
    const result = resourceSchemas.personnel.parse({
      ...basePersonnel,
      escalaServico: "sentinela"
    });

    expect(result.escalaServico).toEqual(["sentinela"]);
  });

  it("mantem multiplas escalas em pessoal", () => {
    const result = resourceSchemas.personnel.parse({
      ...basePersonnel,
      escalaServico: ["sentinela", "plantao"]
    });

    expect(result.escalaServico).toEqual(["sentinela", "plantao"]);
  });

  it("valida avaliacao, punicoes e dispensas de pessoal", () => {
    const result = resourceSchemas.personnel.parse({
      ...basePersonnel,
      avaliacao: "MB",
      punicoes: [{ data: "2026-06-01", motivo: "Atraso" }],
      dispensas: [{ dataInicio: "2026-06-02", dataFim: "2026-06-03", motivo: "Dispensa concedida" }]
    });

    expect(result.avaliacao).toBe("MB");
    expect(result.punicoes).toHaveLength(1);
    expect(result.dispensas).toHaveLength(1);
  });
});
