import { describe, expect, it } from "vitest";

import {
  computeCommitmentFields,
  computeCreditNoteFields,
  computeDocumentStatus,
  computeMaintenanceTotal
} from "@/src/lib/calculations";

describe("calculos operacionais", () => {
  it("calcula prazo de entrega de empenho em 30 dias", () => {
    const result = computeCommitmentFields({
      dataEmissao: "2026-02-05T00:00:00.000Z",
      today: new Date("2026-02-20T00:00:00.000Z")
    });

    expect(result.prazoEntrega?.toISOString().slice(0, 10)).toBe("2026-03-07");
    expect(result.diasDesdeEmissao).toBe(15);
    expect(result.statusEntrega).toBe("no_prazo");
  });

  it("marca empenho nao entregue como atrasado apos o prazo", () => {
    const result = computeCommitmentFields({
      dataEmissao: "2026-02-05T00:00:00.000Z",
      today: new Date("2026-03-10T00:00:00.000Z")
    });

    expect(result.statusEntrega).toBe("atrasado");
  });

  it("mantem empenho entregue como entregue", () => {
    const result = computeCommitmentFields({
      dataEmissao: "2026-02-05T00:00:00.000Z",
      statusEntrega: "entregue",
      today: new Date("2026-03-10T00:00:00.000Z")
    });

    expect(result.statusEntrega).toBe("entregue");
  });

  it("calcula saldo de nota de credito e nao liquidado dos itens", () => {
    const result = computeCreditNoteFields({
      valorNC: 7200,
      allocations: [
        { valorNE: 5994.4, valorLiquidado: 0 },
        { valorNE: 0, valorLiquidado: 0 }
      ]
    });

    expect(result.saldoNC).toBeCloseTo(1205.6);
    expect(result.allocations[0].valorNaoLiquidado).toBeCloseTo(5994.4);
  });

  it("soma o orcamento detalhado de necessidades", () => {
    expect(
      computeMaintenanceTotal({
        budgetItems: [{ valorTotal: 970.18 }, { valorTotal: 921.5 }]
      })
    ).toBeCloseTo(1891.68);
  });

  it("marca documento com resposta como respondido", () => {
    expect(
      computeDocumentStatus({
        prazo: "2026-01-01T00:00:00.000Z",
        numeroDiexResposta: "123"
      })
    ).toBe("respondido");
  });

  it("marca documento vencido sem resposta como atrasado", () => {
    expect(
      computeDocumentStatus({
        prazo: "2026-01-01T00:00:00.000Z",
        today: new Date("2026-01-02T00:00:00.000Z")
      })
    ).toBe("atrasado");
  });
});
