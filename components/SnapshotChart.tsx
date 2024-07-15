"use client";
import { getTransactionsSnapshotByMonth } from "@/utils/transactionsParser";
import { FpmsData } from "@/utils/types/fpms";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { TrendingUp } from "lucide-react";

export default function SnapshotChart({ stringData }: { stringData: string }) {
  const data: FpmsData = JSON.parse(stringData);
  const result = getTransactionsSnapshotByMonth(data);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardDescription className="text-md">Investment Growth</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 pt-4">
        <ChartContainer config={{}} className="mx-auto max-h-[280px]">
          <LineChart
            accessibilityLayer
            data={result}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              //   tickFormatter={(value) => value.slice(0, 4)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="tiv"
              type="monotone"
              stroke="#000000"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="tia"
              type="monotone"
              stroke="#FF0000"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <span>TIV/TIA growth by month</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Updated as of {data.lastUpdated}
        </div>
      </CardFooter>
    </Card>
  );
}
