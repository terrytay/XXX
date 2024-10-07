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

    return Response.json({ isSuccess: result.acknowledged });
  } catch (error) {
    throw error;
  }
};

export const updateFunds = async (data: any) => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME!);

  try {
    const funds = db.collection("funds");
    const result = await funds.replaceOne(
      {
        name: data.name,
      },
      data,
      {
        upsert: true,
      }
    );
    return Response.json({ isSuccess: result.acknowledged });
  } catch (error) {
    throw error;
  }
};
