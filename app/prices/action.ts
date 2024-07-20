import client from "@/utils/db";
import { FundPrice } from "@/utils/types/ge";

export const getPrices = async () => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);

  let result: FundPrice = {
    fixedId: 1,
    lastUpdated: "-1",
    funds: [
      {
        fundName: "-1",
        fundCode: "-1",
        fundBidPrice: "-1",
      },
    ],
  };
  try {
    const prices = db.collection("prices");
    const temp = await prices.findOne<FundPrice>({
      fixedId: 1,
    });

    if (temp != null) result = temp;
  } catch (error) {
    return result;
  }
  return result;
};
