import { FundPrice } from "@/utils/types/ge";
import { updatePrices } from "./action";

export const revalidate = 0;
export async function GET(request: Request) {
  try {
    const result = await fetch(process.env.GE_PRICES!);
    let fundPrices: FundPrice = await result.json();
    fundPrices.fixedId = 1;
    fundPrices.lastUpdated = new Date(Date.now()).toUTCString();
    return await updatePrices(fundPrices);
  } catch (error) {
    return Response.json({ ok: false });
  }
}
