import client from "@/utils/db";
import { AgentClientAllocation } from "@/utils/types/allocation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data: AgentClientAllocation = await request.json();
  await updateAllocations(data);

  return NextResponse.json("OK", {
    status: 200,
  });
}

const updateAllocations = async (data: AgentClientAllocation) => {
  const connection = client;
  const db = connection.db(process.env.DB_NAME);

  let toSend = data;
  delete toSend._id;

  try {
    const allocations = db.collection("allocations");
    const result = await allocations.replaceOne(
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
  }
};
