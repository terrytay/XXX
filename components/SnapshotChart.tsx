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
import { CartesianGrid, Legend, Line, LineChart, XAxis } from "recharts";
import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function SnapshotChart({
  stringData,
  welcomeBonusAsPremium,
  stringDailyPrices,
}: {
  stringData: string;
  welcomeBonusAsPremium: boolean;
  stringDailyPrices: string
}) {
  const [enableBenchmark, setEnableBenchmark] = useState(false);

  const data: FpmsData = JSON.parse(stringData);
  const dailyPrices = JSON.parse(stringDailyPrices);
  
  const result = getTransactionsSnapshotByMonth(data, welcomeBonusAsPremium, dailyPrices);

  const [benchmark, editBenchmark] = useState(6.0);
  const [toggleEdit, setToggleEdit] = useState(false);

  let displayData: {
    date: string;
    tia: number;
    tiv: number;
    benchPrice: number;
  }[] = [];

  let isFirst = true;

  result.forEach((res) => {
    if (isFirst) {
      const date = res.date;
      const tiv = res.tiv;
      const tia = res.tia;
      const benchPrice = res.tia * (1 + benchmark / 1200);
      displayData.push({
        date: date,
        tiv: tiv,
        tia: tia,
        benchPrice: benchPrice,
      });
      isFirst = false;
    } else {
      const date = res.date;
      const tiv = res.tiv;
      const tia = res.tia;
      const benchPrice =
        (res.tia -
          displayData[displayData.length - 1].tia +
          displayData[displayData.length - 1].benchPrice) *
        (1 + benchmark / 1200);

      displayData.push({
        date: date,
        tiv: tiv,
        tia: tia,
        benchPrice: benchPrice,
      });
    }
  });

  return (
    <Card className="flex flex-col col-span-3 md:col-span-1">
      <CardHeader className="items-center pb-0">
        <CardDescription className="text-md">Investment Growth</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 pt-4">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square max-h-full"
        >
          <LineChart
            accessibilityLayer
            data={displayData}
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
              name="Total Investment Value"
              type="monotone"
              stroke="#008000"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="tia"
              name="Total Investment Amount"
              type="monotone"
              stroke="#FF0000"
              strokeWidth={2}
              dot={false}
            />
            {enableBenchmark && (
              <Line
                dataKey="benchPrice"
                name="Benchmark"
                type="monotone"
                stroke="#0000FF"
                strokeWidth={2}
                dot={false}
              />
            )}
            <Legend verticalAlign="bottom" height={5} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {enableBenchmark && (
            <span>
              Benchmark projected at&nbsp;
              {!toggleEdit && (
                <span onClick={() => setToggleEdit(true)}>{benchmark}</span>
              )}
              {toggleEdit && (
                <form
                  className="inline"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setToggleEdit(false);
                  }}
                >
                  <input
                    value={benchmark}
                    type="number"
                    step="0.01"
                    className="w-8"
                    onChange={(e) => editBenchmark(+e.target.value)}
                  />
                  <input type="submit" hidden />
                </form>
              )}
              % p.a. growth
            </span>
          )}
        </div>
        <div
          className="leading-none text-muted-foreground cursor-pointer"
          onClick={() => setEnableBenchmark(!enableBenchmark)}
        >
          Updated as of {data.lastUpdated}
        </div>
      </CardFooter>
    </Card>
  );
}
