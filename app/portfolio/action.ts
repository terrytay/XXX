import { DBClient } from "@/utils/db";
import { FpmsData, PolicyRecord } from "@/utils/types/fpms";

export const getClient = async (policy_number: string) => {
  const connection = await DBClient.connect();
  const db = connection.db(process.env.DB_NAME);

  try {
    const policies = db.collection("policies");
    const result = await policies.findOne<FpmsData>({
      policyNumber: policy_number,
    });

    if (result != null) return result;
  } catch (error) {
    throw error;
  } finally {
    await DBClient.close();
  }
};

export const getRecord = async (policy_number: string) => {
  const connection = await DBClient.connect();
  const db = connection.db(process.env.DB_NAME);

  try {
    const records = db.collection("records");
    const result = await records.findOne<PolicyRecord>({
      policyNumber: policy_number,
    });

    if (result != null) return result;
  } catch (error) {
    throw error;
  } finally {
    await DBClient.close();
  }
};
