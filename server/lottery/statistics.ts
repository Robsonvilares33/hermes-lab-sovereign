export interface HistoricalDraw {
  drawNumber: number;
  numbers: number[];
}

export interface LotteryStatistics {
  frequency: Map<number, number>;
  delay: Map<number, number>;
  drawCount: number;
}

export function calculateMegaSenaStatistics(draws: HistoricalDraw[]): LotteryStatistics {
  const frequency = new Map<number, number>();
  const delay = new Map<number, number>();
  for (let number = 1; number <= 60; number += 1) {
    frequency.set(number, 0);
    delay.set(number, draws.length);
  }

  const ordered = [...draws].sort((a, b) => a.drawNumber - b.drawNumber);
  ordered.forEach((draw, index) => {
    const uniqueNumbers = new Set(draw.numbers);
    uniqueNumbers.forEach((number) => {
      if (number < 1 || number > 60) return;
      frequency.set(number, (frequency.get(number) ?? 0) + 1);
      delay.set(number, ordered.length - 1 - index);
    });
  });

  return { frequency, delay, drawCount: ordered.length };
}

export function parseNumbersJson(value: string): number[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((number) => !Number.isInteger(number))) {
    throw new Error("Formato de números armazenado inválido");
  }
  return parsed as number[];
}
