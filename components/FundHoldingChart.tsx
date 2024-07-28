"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Cell, Label, LabelList, Legend, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FpmsData } from "@/utils/types/fpms";

const COLORS = [
  "#B084CC",
  "#665687",
  "#FFA62B",
  "#5DD9C1",
  "#190933",
  "#5FDD9D",
  "#664C43",
  "#DC758F",
  "#FF0000",
  "#314CB6",
  "#ACFCD9",
];

export default function PolicyChart({ stringData }: { stringData: string }) {
  const data: FpmsData = JSON.parse(stringData);
  const tempFunds = data.policyDetails.funds;
  const funds = tempFunds
    .filter((fund) => +fund.totalFundUnits.trim().split(",").join("") > 0.1)
    .map((fund) => ({
      name: fund.name,
      totalFundValue:
        (100 * +fund.totalFundValue.trim().split(",").join("")) /
        +data.policyDetails.tiv.trim().split(",").join(""),
    }));

  let chartConfig = {
    totalFundValue: {
      label: "Value",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col col-span-3 md:col-span-1">
      <CardHeader className="items-center pb-0">
        <CardDescription className="text-md">Fund Holdings</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Pie
              data={funds}
              dataKey="totalFundValue"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {funds.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" className="" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <span>Allocation of current portfolio (%)</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Updated as of {data.lastUpdated}
        </div>
      </CardFooter>
    </Card>
  );
}
