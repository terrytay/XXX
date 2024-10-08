import client from "@/utils/db";
import { Fund } from "./page";

export const getFunds = async () => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);
  try {
    const funds = db.collection("funds");

    const res = await funds.find<Fund>({});

    let result: Fund[] = [];

    while (await res.hasNext()) {
      const data = await res.next();
      if (data != null) result.push(data);
    }
    if (result != null) return result;
  } catch (error) {
    throw error;
  }
};
