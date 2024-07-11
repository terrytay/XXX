import { DBClient } from "@/utils/db";
import { FpmsData } from "@/utils/types/fpms";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data: FpmsData = await request.json();
  await updateClient(data);

  return NextResponse.json("OK");
}

const updateClient = async (data: FpmsData) => {
  const connection = await DBClient.connect();
  const db = connection.db(process.env.DB_NAME!);

  try {
    const policies = db.collection("policies");
    const result = await policies.replaceOne(
      {
        policyNumber: data.policyNumber,
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
  } finally {
    await DBClient.close();
  }
};
