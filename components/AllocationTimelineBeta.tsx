"use client";

import {
  AgentClientAllocation,
  NewAgentClientAllocation,
} from "@/utils/types/allocation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  Check,
  CirclePlus,
  Ellipsis,
  EllipsisVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
import { FundSwitch } from "@/utils/transactionsParser";
import { format2dp } from "../utils/formatters";
const dayjs = require("dayjs");

export type FundSwitchDisplayItem = {
  direction: string;
  date: string;
  month: string;
  year: string;
  amount: number;
  price: string;
};
export type FundSwitchDisplay = {
  items: FundSwitchDisplayItem[];
};

export type GroupedFunds = {
  [x: string]: FundSwitchDisplay[];
};

export function AllocationTimelineBeta({
  data,
  commencementMonth,
  premiumFreq,
  dailyPricesJSON,
}: {
  data: string;
  commencementMonth: string;
  premiumFreq: string;
  dailyPricesJSON: string;
}) {
  const currentYear = +dayjs().year();

  const [displayedYear, setDisplayedYear] = useState(currentYear);

  const funds: FundSwitch[] = JSON.parse(data);
  const dailyPrices = JSON.parse(dailyPricesJSON);
  let allocation: GroupedFunds = {};

  funds
    .filter((newFund) => +newFund.date.split("/")[2] === displayedYear)
    .forEach((newFund) => {
      if (!allocation[newFund.code])
        allocation[newFund.code] = [
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
          {
            items: [],
          },
        ];

      allocation[newFund.code][+newFund.date.split("/")[1] - 1].items.push({
        direction: newFund.direction,
        date: newFund.date,
        month: newFund.date.split("/")[1],
        year: newFund.date.split("/")[2],
        amount: newFund.amount,
        price: newFund.price,
      });
    });

  return (
    <>
      <Table className="text-center text-wrap table-fixed border-collapse">
        <TableCaption>Allocation History</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={1}>
              <ArrowBigLeft
                className="inline hover:cursor-pointer h-5 w-5"
                onClick={() => setDisplayedYear((prev) => prev - 1)}
              />
              <ArrowBigRight
                className="inline hover:cursor-pointer h-5 w-5"
                onClick={() => setDisplayedYear((prev) => prev + 1)}
              />
            </TableHead>
            <TableHead className="text-center" colSpan={12}>
              Year {displayedYear}
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="text-center">Fund</TableHead>
            <TableHead
              className={`${
                commencementMonth === "01" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Jan
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "02" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Feb
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "03" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Mar
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "04" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Apr
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "05" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              May
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "06" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Jun
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "07" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Jul
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "08" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Aug
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "09" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Sep
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "10" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Oct
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "11" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Nov
            </TableHead>
            <TableHead
              className={`${
                commencementMonth === "12" && premiumFreq === "Yearly"
                  ? "bg-yellow-300"
                  : ""
              } text-center`}
            >
              Dec
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.keys(allocation).map((key, index) => (
            <TableRow key={index}>
              <TableCell className="p-0 m-0 text-xs font-medium">
                {
                  dailyPrices?.funds.find(
                    (dp: { fundCode: any }) => dp.fundCode === key
                  )!.fundName
                }
              </TableCell>

              {allocation[key].map((record, indexTwo) => (
                <TableCell
                  className="p-0 m-0 text-wrap align-baseline"
                  key={indexTwo}
                >
                  {record.items.length != 0 && (
                    <Table className="text-wrap">
                      <TableBody className="m-0 p-0 text-center">
                        {record.items.map((item, kkey) => (
                          <TableRow key={kkey}>
                            <TableCell className="text-xs m-0 px-0 text-wrap">
                              {item.direction.includes("From") ? (
                                <ArrowBigDown className="inline-flex items-baseline text-green-500" />
                              ) : (
                                <ArrowBigUp className="inline-flex items-baseline text-red-500" />
                              )}
                              &nbsp;
                              {item.date.split("/")[0]}th
                            </TableCell>
                            <TableCell className="text-start text-xs text-wrap m-0 pr-0 pl-1">
                              {
                                dailyPrices?.funds
                                  .find(
                                    (dp: { fundCode: any }) =>
                                      dp.fundCode ===
                                      item.direction.split(" ")[1]
                                  )!
                                  .fundName.split("GreatLink")[1]
                              }
                              : ${format2dp(item.amount)} ({item.price})
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
