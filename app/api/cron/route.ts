import { FundPrice } from "@/utils/types/ge";
import { updatePrices } from "./action";

export async function GET(request: Request) {
  try {
    const result = await fetch(process.env.GE_PRICES!);
    let fundPrices: FundPrice = await result.json();
    fundPrices.fixedId = 1;
    fundPrices.lastUpdated = new Date(Date.now()).toLocaleString();
    await updatePrices(fundPrices);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false });
  }
}
