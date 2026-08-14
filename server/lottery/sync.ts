import { addLotteryResult, getLotteryResults } from "../db";
import { caixaAPI } from "../integrations/caixa-api";

export async function syncLatestMegaSenaResult() {
  const latest = await caixaAPI.fetchLatestDraw();
  const stored = await getLotteryResults("mega_sena");
  const alreadyStored = stored.some((result) => result.drawNumber === latest.drawNumber);
  if (!alreadyStored) {
    await addLotteryResult("mega_sena", latest.drawNumber, latest.numbers, latest.date);
  }
  return { ...latest, stored: alreadyStored };
}

export async function syncMegaSenaHistory() {
  const history = await caixaAPI.fetchDrawHistory();
  const stored = await getLotteryResults("mega_sena");
  const existing = new Set(stored.map((result) => result.drawNumber));
  let inserted = 0;

  for (const draw of history) {
    if (existing.has(draw.drawNumber)) continue;
    await addLotteryResult("mega_sena", draw.drawNumber, draw.numbers, draw.date);
    existing.add(draw.drawNumber);
    inserted += 1;
  }

  return { fetched: history.length, inserted };
}
