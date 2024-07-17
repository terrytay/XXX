import client from "@/utils/db";
import { AgentClientAllocation } from "@/utils/types/allocation";
import { DividendData, FpmsData, PolicyRecord } from "@/utils/types/fpms";

export const getAllocations = async (policy_number: string) => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);

  try {
    const allocations = db.collection("allocations");
    const result = await allocations.findOne<AgentClientAllocation>({
      policyNumber: policy_number,
    });

    if (result != null) return result;
  } catch (error) {
    throw error;
  }
};

export const getDividends = async (policy_number: string) => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);

  try {
    const policies = db.collection("dividends");
    const result = await policies.findOne<DividendData>({
      policyNumber: policy_number,
    });

    if (result != null) return result;
  } catch (error) {
    throw error;
  }
};

export const getAllDividends = async (policy_numbers: string[]) => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);
  try {
    const dividends = db.collection("dividends");

    const res = await dividends.find<DividendData>({
      policyNumber: { $in: policy_numbers },
    });

    let result: DividendData[] = [];

    while (await res.hasNext()) {
      const data = await res.next();
      if (data != null) result.push(data);
    }
    if (result != null) return result;
  } catch (error) {
    throw error;
  }
};

export const getClient = async (policy_number: string) => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);

  try {
    const policies = db.collection("policies");
    const result = await policies.findOne<FpmsData>({
      policyNumber: policy_number,
    });

    if (result != null) return result;
  } catch (error) {
    throw error;
  }
};

export const getClients = async (policy_numbers: string[]) => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);
  try {
    const policies = db.collection("policies");

    const res = await policies.find<FpmsData>({
      policyNumber: { $in: policy_numbers },
    });

    let result: FpmsData[] = [];

    while (await res.hasNext()) {
      const data = await res.next();
      if (data != null) result.push(data);
    }
    if (result != null) return result;
  } catch (error) {
    throw error;
  }
};

export const getRecord = async (policy_number: string) => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);

  try {
    const records = db.collection("records");
    const result = await records.findOne<PolicyRecord>({
      policyNumber: policy_number,
    });

    if (result != null) return result;
  } catch (error) {
    throw error;
  }
};
