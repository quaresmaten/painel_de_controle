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
});
