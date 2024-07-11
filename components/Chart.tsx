"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function PolicyChart({ stringData }: { stringData: string }) {
  const data: FpmsData = JSON.parse(stringData);
  const tempFunds = data.policyDetails.funds;
  const funds = tempFunds
    .filter((fund) => +fund.totalFundUnits.trim().split(",").join("") > 0.1)
    .map((fund) => ({
      name: fund.name,
      totalFundValue: +fund.totalFundValue.trim().split(",").join(""),
    }));
  let chartConfig = {
    totalFundValue: {
      label: "Value",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardDescription className="text-md">Fund Holdings</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square max-h-[280px]"
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
              <Label
                fill={COLORS[Math.random() % COLORS.length]}
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-xl font-bold"
                        >
                          {data.policyDetails.tiv}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Value
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
