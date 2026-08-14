export type GameCategory = "A" | "B" | "C";
export type GameProfile = "aggressive" | "balanced" | "conservative";

export interface Game {
  id: string;
  numbers: number[];
  category: GameCategory;
  profile: GameProfile;
  /** Score de análise de 0–100; não representa probabilidade de prêmio. */
  confidence: number;
  scoreMeaning: "heuristic-analysis-score";
  timestamp: Date;
}

interface CategoryConfig {
  category: GameCategory;
  profile: GameProfile;
  frequentCount: number;
  delayedCount: number;
  diversifiedCount: number;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  { category: "A", profile: "aggressive", frequentCount: 4, delayedCount: 2, diversifiedCount: 0 },
  { category: "B", profile: "balanced", frequentCount: 3, delayedCount: 1, diversifiedCount: 2 },
  { category: "C", profile: "conservative", frequentCount: 5, delayedCount: 0, diversifiedCount: 1 },
];

function completePool(source: Map<number, number>, descending: boolean): number[] {
  const ranked = Array.from(source.entries())
    .filter(([number]) => Number.isInteger(number) && number >= 1 && number <= 60)
    .sort((a, b) => (descending ? b[1] - a[1] : a[1] - b[1]))
    .map(([number]) => number);
  const missing = Array.from({ length: 60 }, (_, index) => index + 1).filter((number) => !ranked.includes(number));
  return [...ranked, ...missing];
}

function selectFromPool(pool: number[], count: number, offset: number, selected: Set<number>): void {
  if (count <= 0) return;
  for (let step = 0; step < pool.length && selected.size < 6 && count > 0; step += 1) {
    const candidate = pool[(offset + step) % pool.length];
    if (!selected.has(candidate)) {
      selected.add(candidate);
      count -= 1;
    }
  }
}

function scoreGame(numbers: number[], frequentSet: Set<number>, delayedSet: Set<number>): number {
  const frequentRatio = numbers.filter((number) => frequentSet.has(number)).length / 6;
  const delayedRatio = numbers.filter((number) => delayedSet.has(number)).length / 6;
  const evenCount = numbers.filter((number) => number % 2 === 0).length;
  const lowCount = numbers.filter((number) => number <= 30).length;
  const parityBonus = evenCount >= 2 && evenCount <= 4 ? 8 : 0;
  const rangeBonus = lowCount >= 2 && lowCount <= 4 ? 8 : 0;
  return Math.round(Math.min(100, 50 + frequentRatio * 25 + delayedRatio * 10 + parityBonus + rangeBonus));
}

export class GameGenerator30 {
  private readonly frequentPool: number[];
  private readonly delayedPool: number[];
  private readonly diversifiedPool: number[];
  private readonly frequentSet: Set<number>;
  private readonly delayedSet: Set<number>;

  constructor(frequencyData: Map<number, number>, delayData: Map<number, number>) {
    this.frequentPool = completePool(frequencyData, true);
    this.delayedPool = completePool(delayData, true);
    this.diversifiedPool = Array.from({ length: 60 }, (_, index) => index + 1).sort(
      (a, b) => Math.abs(a - 30.5) - Math.abs(b - 30.5)
    );
    this.frequentSet = new Set(this.frequentPool.slice(0, Math.max(10, frequencyData.size)));
    this.delayedSet = new Set(this.delayedPool.slice(0, Math.max(6, delayData.size)));
  }

  generate30Games(timestamp = new Date()): Game[] {
    const games: Game[] = [];
    const used = new Set<string>();

    for (const config of CATEGORY_CONFIGS) {
      for (let index = 0; index < 10; index += 1) {
        let numbers: number[] = [];
        let attempt = 0;
        do {
          const selected = new Set<number>();
          const offset = index * 3 + attempt * 7;
          selectFromPool(this.frequentPool, config.frequentCount, offset, selected);
          selectFromPool(this.delayedPool, config.delayedCount, offset + 11, selected);
          selectFromPool(this.diversifiedPool, config.diversifiedCount, offset + 17, selected);
          selectFromPool(this.diversifiedPool, 6 - selected.size, offset + 23, selected);
          numbers = Array.from(selected).sort((a, b) => a - b);
          attempt += 1;
        } while (used.has(numbers.join("-")) && attempt < 1000);

        const key = numbers.join("-");
        if (numbers.length !== 6 || used.has(key)) {
          throw new Error(`Não foi possível gerar um jogo único para ${config.category}${index + 1}`);
        }
        used.add(key);

        games.push({
          id: `${config.category}${index + 1}`,
          numbers,
          category: config.category,
          profile: config.profile,
          confidence: scoreGame(numbers, this.frequentSet, this.delayedSet),
          scoreMeaning: "heuristic-analysis-score",
          timestamp,
        });
      }
    }

    return games;
  }
}

export function createDefaultGenerator(): GameGenerator30 {
  const frequency = new Map<number, number>();
  const delay = new Map<number, number>();
  for (let number = 1; number <= 60; number += 1) {
    frequency.set(number, 60 - number);
    delay.set(number, number);
  }
  return new GameGenerator30(frequency, delay);
}
