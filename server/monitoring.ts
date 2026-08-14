/**
 * Coleta pontual de saúde do Hermes Lab.
 * Jobs recorrentes devem chamar este serviço por um endpoint Heartbeat.
 */

import { lotteryGames, lotteryResults } from "../drizzle/schema";
import { getDb } from "./db";

export interface MetricSnapshot {
  timestamp: Date;
  totalGames: number;
  totalResults: number;
  averageConfidence: number | null;
  systemHealth: "healthy" | "warning" | "critical";
  note: string;
}

export class HermesMonitor {
  async collectMetrics(): Promise<MetricSnapshot> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [games, results] = await Promise.all([
      db.select({ confidence: lotteryGames.confidence }).from(lotteryGames).limit(1000),
      db.select({ id: lotteryResults.id }).from(lotteryResults).limit(1000),
    ]);

    const values = games
      .map((game) => game.confidence)
      .filter((confidence): confidence is number => confidence !== null);
    const averageConfidence = values.length
      ? values.reduce((sum, confidence) => sum + confidence, 0) / values.length
      : null;

    const snapshot: MetricSnapshot = {
      timestamp: new Date(),
      totalGames: games.length,
      totalResults: results.length,
      averageConfidence,
      systemHealth: averageConfidence === null || averageConfidence >= 70 ? "healthy" : "warning",
      note: "ROI e acurácia exigem vincular previsões a concursos futuros; não são inferidos da confiança declarada.",
    };

    console.log(JSON.stringify(snapshot));
    return snapshot;
  }
}

export async function runMonitoringSnapshot(): Promise<MetricSnapshot> {
  return new HermesMonitor().collectMetrics();
}

if (process.env.RUN_HERMES_MONITOR === "true") {
  runMonitoringSnapshot().catch((error) => {
    console.error("[Hermes Monitor] Falha na coleta:", error);
    process.exitCode = 1;
  });
}

export const MONITORING_CRON = "0 0 * * * *";
export default HermesMonitor;
