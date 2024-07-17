import client from "@/utils/db";
import { FpmsData } from "@/utils/types/fpms";
import { NextResponse } from "next/server";

const allowedOrigins = ["https://fpms.greateasternlife.com"];

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = allowedOrigins.includes(origin);

  const isPreflight = request.method === "OPTIONS";
  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }
  return NextResponse.error();
}

export async function POST(request: Request) {
  const data: FpmsData = await request.json();
  await updateClient(data);

  return NextResponse.json("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://fpms.greateasternlife.com",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

const updateClient = async (data: FpmsData) => {
  const connection = client;
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
  }
};
