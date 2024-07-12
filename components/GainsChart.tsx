"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts";

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
import { FpmsData, PolicyRecord } from "@/utils/types/fpms";
import { Button } from "./ui/button";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function GainsChart({
  stringData,
  lastUpdated,
}: {
  stringData: string;
  lastUpdated: string;
}) {
  const data: PolicyRecord = JSON.parse(stringData);

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardDescription className="text-md">
          Growth Illustration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}}>
          <LineChart
            accessibilityLayer
            data={data.data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="mobile"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <Button variant="link">
            Click here to add data of {lastUpdated}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
