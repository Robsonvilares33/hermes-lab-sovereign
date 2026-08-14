import axios, { type AxiosInstance } from "axios";
import { z } from "zod";

const API_ROOT = "https://loteriascaixa-api.herokuapp.com/api";

const prizeSchema = z.object({
  descricao: z.string(),
  faixa: z.number(),
  ganhadores: z.number(),
  valorPremio: z.number(),
});

const rawDrawSchema = z.object({
  loteria: z.string(),
  concurso: z.number().int().positive(),
  data: z.string(),
  dezenas: z.array(z.string()),
  premiacoes: z.array(prizeSchema).optional().default([]),
  valorArrecadado: z.number().optional().nullable(),
  valorEstimadoProximoConcurso: z.number().optional().nullable(),
  acumulou: z.boolean().optional().default(false),
});

export interface LotteryDraw {
  lottery: "megasena";
  drawNumber: number;
  date: Date;
  numbers: number[];
  prizes: Array<{
    description: string;
    winners: number;
    amount: number;
  }>;
  accumulated: boolean;
  collection: number | null;
  estimatedNextPrize: number | null;
}

function parseBrazilianDate(value: string): Date {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) throw new Error(`Data de concurso inválida: ${value}`);
  const [, day, month, year] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function normalizeDraw(payload: unknown): LotteryDraw {
  const raw = rawDrawSchema.parse(payload);
  const numbers = raw.dezenas.map(Number);
  if (numbers.length !== 6 || new Set(numbers).size !== 6 || numbers.some((n) => n < 1 || n > 60)) {
    throw new Error(`Dezenas inválidas no concurso ${raw.concurso}`);
  }

  return {
    lottery: "megasena",
    drawNumber: raw.concurso,
    date: parseBrazilianDate(raw.data),
    numbers: numbers.sort((a, b) => a - b),
    prizes: raw.premiacoes.map((prize) => ({
      description: prize.descricao,
      winners: prize.ganhadores,
      amount: prize.valorPremio,
    })),
    accumulated: raw.acumulou,
    collection: raw.valorArrecadado ?? null,
    estimatedNextPrize: raw.valorEstimadoProximoConcurso ?? null,
  };
}

export class CaixaAPIClient {
  private readonly client: AxiosInstance;

  constructor(baseURL = API_ROOT) {
    this.client = axios.create({
      baseURL,
      timeout: 20_000,
      headers: { Accept: "application/json", "User-Agent": "Hermes-Lab/2.0" },
    });
  }

  async fetchLatestDraw(): Promise<LotteryDraw> {
    const response = await this.client.get("/megasena/latest");
    return normalizeDraw(response.data);
  }

  async fetchDrawByNumber(drawNumber: number): Promise<LotteryDraw> {
    if (!Number.isInteger(drawNumber) || drawNumber < 1) {
      throw new Error("Número de concurso inválido");
    }
    const response = await this.client.get(`/megasena/${drawNumber}`);
    return normalizeDraw(response.data);
  }

  async fetchDrawHistory(): Promise<LotteryDraw[]> {
    const response = await this.client.get("/megasena");
    if (!Array.isArray(response.data)) throw new Error("Histórico inválido retornado pela API");
    return response.data.map(normalizeDraw).sort((a, b) => a.drawNumber - b.drawNumber);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchLatestDraw();
      return true;
    } catch {
      return false;
    }
  }
}

export const caixaAPI = new CaixaAPIClient();
export { normalizeDraw, parseBrazilianDate };
