import client from "@/utils/db";
import { FundPrice } from "@/utils/types/ge";

export const updatePrices = async (data: FundPrice) => {
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
