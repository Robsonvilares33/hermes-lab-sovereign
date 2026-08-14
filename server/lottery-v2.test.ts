import { describe, expect, it } from "vitest";
import { normalizeDraw } from "./integrations/caixa-api";
import { GameGenerator30 } from "./lottery/game-generator-30";
import { calculateMegaSenaStatistics } from "./lottery/statistics";

describe("Integração de resultados da Caixa", () => {
  it("normaliza dezenas e data no formato brasileiro", () => {
    const draw = normalizeDraw({
      loteria: "megasena",
      concurso: 3044,
      data: "13/08/2026",
      dezenas: ["04", "15", "17", "40", "55", "58"],
      premiacoes: [],
      acumulou: true,
    });

    expect(draw.drawNumber).toBe(3044);
    expect(draw.numbers).toEqual([4, 15, 17, 40, 55, 58]);
    expect(draw.date.toISOString()).toBe("2026-08-13T00:00:00.000Z");
  });

  it("rejeita um payload com quantidade de dezenas inválida", () => {
    expect(() =>
      normalizeDraw({
        loteria: "megasena",
        concurso: 3044,
        data: "13/08/2026",
        dezenas: ["04", "15"],
      })
    ).toThrow();
  });
});

describe("Estatísticas históricas", () => {
  it("calcula frequência e atraso sem olhar para o futuro", () => {
    const statistics = calculateMegaSenaStatistics([
      { drawNumber: 1, numbers: [1, 2, 3, 4, 5, 6] },
      { drawNumber: 2, numbers: [1, 2, 7, 8, 9, 10] },
      { drawNumber: 3, numbers: [2, 3, 7, 8, 11, 12] },
    ]);

    expect(statistics.drawCount).toBe(3);
    expect(statistics.frequency.get(2)).toBe(3);
    expect(statistics.delay.get(2)).toBe(0);
    expect(statistics.delay.get(1)).toBe(1);
    expect(statistics.delay.get(60)).toBe(3);
  });
});

describe("Gerador de 30 jogos", () => {
  it("gera 10 jogos por categoria, com seis dezenas e sem duplicatas", () => {
    const frequency = new Map<number, number>();
    const delay = new Map<number, number>();
    for (let number = 1; number <= 60; number += 1) {
      frequency.set(number, 61 - number);
      delay.set(number, number);
    }

    const games = new GameGenerator30(frequency, delay).generate30Games();
    const keys = new Set(games.map((game) => game.numbers.join("-")));

    expect(games).toHaveLength(30);
    expect(keys.size).toBe(30);
    expect(games.filter((game) => game.category === "A")).toHaveLength(10);
    expect(games.filter((game) => game.category === "B")).toHaveLength(10);
    expect(games.filter((game) => game.category === "C")).toHaveLength(10);
    expect(games.every((game) => game.numbers.length === 6)).toBe(true);
    expect(games.every((game) => game.confidence >= 50 && game.confidence <= 100)).toBe(true);
  });
});
