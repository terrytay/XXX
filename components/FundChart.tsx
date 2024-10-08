"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Fund } from "@/app/funds/page";
import { useState } from "react";

function formatChart(fund: Fund) {
  let cleanedPrices: { date: string; amount: number }[] = [];
  let cleanedDividends: { date: string; amount: number }[] = [];
  let chartData: { date: string; price: number; dividend: number }[] = [];

  fund.prices.DataList.reverse().forEach((price) => {
    cleanedPrices.push({
      date: price.Price.PriceDate.split("T")[0],
      amount:
        price.Price.Bid?.Amount ||
        price.Price.Mid?.Amount ||
        price.Price.Yield?.Amount,
    });
  });
  fund.dividends?.DataList.forEach((dividend) => {
    cleanedDividends.push({
      date: dividend.Dividend.PayDate.split("T")[0],
      amount: dividend.Dividend.NetDividend,
    });
  });
  cleanedPrices.forEach((price) => {
    chartData.push({
      date: price.date,
      price: price.amount,
      dividend: 0,
    });
  });
  cleanedDividends.forEach((dividend) => {
    const isExist = chartData.findIndex((data) => data.date === dividend.date);
    if (isExist === -1) {
      chartData.push({
        date: dividend.date,
        price: 0,
        dividend: dividend.amount * 1200,
      });
    } else {
      chartData[isExist].dividend = dividend.amount * 1200;
    }
    for (let i = 1; i < chartData.length; i++) {
      if (chartData[i].dividend === 0) {
        chartData[i].dividend = chartData[i - 1].dividend;
      }
    }

    const startIndex = chartData.findIndex(
      (data) => data.date === "2023-05-17"
    );
    chartData = chartData.slice(startIndex);

    return chartData;
  });

  return chartData;
}

const FundChart = ({ fundString }: { fundString: string }) => {
  const funds: Fund[] = JSON.parse(fundString);
  const [selectedFund, setSelectedFund] =
    useState<{ date: string; price: number; dividend: number }[]>();

  const chartConfig = {
    price: {
      label: "Price per unit",
      color: "hsl(var(--chart-1))",
    },
    dividend: {
      label: "Dividend(%)",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>{selectedFund && selectedFund.name}</CardTitle> */}
        <CardDescription>
          <Select
            onValueChange={(fundName) =>
              setSelectedFund(
                formatChart(funds.find((fN) => fN.name === fundName)!)
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fund" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Funds</SelectLabel>
                {funds.map((fund, key) => (
                  <SelectItem value={fund.name} key={key}>
                    {fund.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedFund && (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={selectedFund}
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
                //   tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <YAxis
                yAxisId="left"
                tickCount={500}
                tickLine={false}
                axisLine={false}
                label="Price"
                domain={["dataMin", "dataMax"]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickCount={500}
                tickLine={false}
                axisLine={false}
                label="Dividend (%)"
                // domain={["dataMin", 10]}
              />
              <Line
                dataKey="dividend"
                type="monotone"
                strokeWidth={2}
                stroke="#FF0000"
                dot={false}
                yAxisId="right"
              />
              <Line
                dataKey="price"
                yAxisId="left"
                type="monotone"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      {/* <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing total visitors for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  );
};

export default FundChart;
