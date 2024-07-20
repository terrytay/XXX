import client from "@/utils/db";
import { FundPrice } from "@/utils/types/ge";

export const getPrices = async () => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);

  try {
    const prices = db.collection("prices");
    const result = await prices.findOne<FundPrice>({
      fixedId: 1,
    });

    if (result != null) return result;
  } catch (error) {
    return {
      funds: [{
        fundName: "-1",
        fundCode: "-1",
        fundBidPrice: "-1",
      }],
    };
  }
};
