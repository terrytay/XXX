import client from "@/utils/db";
import { FundPrice } from "@/utils/types/ge";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await fetch(process.env.GE_PRICES!);
    let fundPrices: FundPrice = await result.json();
    fundPrices.fixedId = 1;
    await updateClient(fundPrices);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false });
  }
}

const updateClient = async (data: FundPrice) => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME!);

  try {
    const prices = db.collection("prices");
    const result = await prices.replaceOne(
      {
        fixedId: data.fixedId,
      },
      data,
      {
        upsert: true,
      }
    );
    console.log(result.matchedCount);

    return Response.json({ isSuccess: result.acknowledged });
  } catch (error) {
    throw error;
  }
};
