import { getAllocations, getClient, getDividends } from "../../action";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format2dp, formatPercent, formatUnits } from "@/utils/formatters";
import { createClient } from "@/utils/supabase/server";
import { UserResponse } from "@supabase/supabase-js";
import { bounceOut } from "@/app/auth/action";
import { redirect } from "next/navigation";
import {
  ApplicationType,
  getFundSwitches,
  getWelcomeBonus,
  parseTransactions,
} from "@/utils/transactionsParser";
import { getPrices } from "@/app/prices/action";
import PolicyChart from "@/components/FundHoldingChart";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { AllocationTimeline } from "@/components/AllocationTimeline";
import { AgentClientAllocation } from "@/utils/types/allocation";
import { Toaster } from "@/components/ui/sonner";
import SnapshotChart from "@/components/SnapshotChart";
import { dateDiff } from "@/utils/date";
import { Metadata, ResolvingMetadata } from "next";
import { AllocationTimelineBeta } from "@/components/AllocationTimelineBeta";

type Props = {
  params: { policy_number: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.policy_number;

  return {
    title: `Portfolio - ${id}`,
  };
}

export default async function Page({
  params,
}: {
  params: { policy_number: string };
}) {
  const supabase = createClient();
  const user: UserResponse = await supabase.auth.getUser();

  if (!user.data.user) {
    return await bounceOut();
  }
  // Get policy details
  const data = await getClient(params.policy_number);

  // Get welcome bonus
  let isWelcomeBonusPremium = false;
  const preferences = await supabase
    .from("agents")
    .select()
    .eq("agent_id", user?.data.user.id);
  isWelcomeBonusPremium = preferences.data!.at(0).include;
  let welcomeBonusToAdd = 0;
  const welcomeBonusToDisplay = getWelcomeBonus(data!);
  if (isWelcomeBonusPremium) {
    welcomeBonusToAdd = welcomeBonusToDisplay;
  }

  // Get dividends
  const dividends = await getDividends(params.policy_number);
  let totalDividendsPaidout = 0;
  dividends?.dividends.forEach((div) => {
    if (div.method !== "Reinvest") {
      totalDividendsPaidout += +div.amount.trim().split(",").join("");
    }
  });

  // Get allocation data
  const templateAllocationData: AgentClientAllocation = {
    agentId: user.data.user.id,
    policyNumber: params.policy_number,
  };
  const allocationData = await getAllocations(params.policy_number);

  // Admin
  if (
    data?.agentId != user.data.user.id &&
    user.data.user.id != "364c9a6d-ba68-49d7-a227-3692346722c1"
  ) {
    return redirect("/");
  }

  const dailyPrices = await getPrices();

  // Get allocation
  const allocatedFunds = parseTransactions(data!, dailyPrices);
  let cashFund = 0;
  let today = new Date().toISOString().slice(0, 10);
  let [day, month, year] = data!.profile.commencementDate.split("/");
  const startDate = year.concat("-").concat(month).concat("-").concat(day);
  let duration = dateDiff(startDate, today);
  duration = duration
    .replace("Y", " Years")
    .replace("1 Years", "1 Year")
    .replace("M", " Months")
    .replace("1 Months", "1 Month")
    .replace("D", " Days")
    .replace("1 Days", "1 Day");

  // START OF BETA
  const tiv = allocatedFunds.reduce((accum, fund) => {
    return (accum +=
      fund.totalUnitsAfterFees *
      +dailyPrices.funds
        .find((dpFund) => dpFund.fundCode === fund.code)
        ?.fundBidPrice.trim()
        .split(",")
        .join("")!);
  }, 0);

  let tia = data?.policyDetails.tia! + welcomeBonusToAdd;
  let withdrawedAmount = 0;
  data?.transactions.forEach((trx) => {
    if (trx.type.includes(ApplicationType.SurrenderWithdrawal)) {
      withdrawedAmount += +trx.transactionAmount.trim().split(",").join("");
    }
  });
  tia -= withdrawedAmount;

  const fundswitches = getFundSwitches(data!);

  return (
    <section className="grid grid-cols-3 gap-4 mx-2 print:mt-10">
      <Card className="flex flex-col col-span-3 md:col-span-1">
        <CardHeader className="items-center pb-0">
          <CardDescription className="text-md">Client Profile</CardDescription>
        </CardHeader>
        <Table>
          <TableBody>
            {data?.agentId === user.data.user.id && (
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{data?.profile.name}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>{data?.policyDetails.productName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Commencement Date</TableCell>
              <TableCell>{data?.profile.commencementDate}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Policy Duration</TableCell>
              <TableCell>{duration}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Policy Number</TableCell>
              <TableCell>{data?.policyNumber}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Premium</TableCell>
              <TableCell>{data?.profile.premium}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Premium Frequency</TableCell>
              <TableCell>{data?.profile.premiumFreq}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Welcome Bonus</TableCell>
              <TableCell>{format2dp(welcomeBonusToDisplay)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Last Updated</TableCell>
              <TableCell>{data?.lastUpdated}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <PolicyChart stringData={JSON.stringify(data)} />
      <SnapshotChart
        stringData={JSON.stringify(data)}
        welcomeBonusAsPremium={isWelcomeBonusPremium}
        stringDailyPrices={JSON.stringify(dailyPrices)}
      />
      <Card className="col-span-3 py-2">
        <Table>
          <TableCaption>
            <div className="pb-1">Portfolio Summary</div>
            <div className="flex justify-center text-xs print:hidden">
              Daily fund prices last updated by server on&nbsp;
              {new Date(dailyPrices.lastUpdated).toLocaleString("en-SG", {
                timeZone: "Asia/Singapore",
              })}
            </div>
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Fund Name</TableHead>
              <TableHead>Total Units</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Total Fund Value</TableHead>
              <TableHead>Average Price</TableHead>
              <TableHead>ROI</TableHead>

              <TableHead className="text-right">Apportionment Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.policyDetails.funds
              .filter(
                (fund: { totalFundUnits: string }) =>
                  +fund.totalFundUnits.trim().split(",").join("") > 0.1
              )
              .map((fund: any) => (
                <TableRow>
                  <TableCell className="font-medium">{fund.name}</TableCell>
                  <TableCell>{fund.totalFundUnits}</TableCell>
                  <TableCell>
                    {
                      +formatUnits(
                        +dailyPrices.funds
                          .find(
                            (dp: { fundCode: string }) =>
                              dp.fundCode === fund.name.split(":")[0]
                          )!
                          .fundBidPrice.trim()
                          .split(",")
                          .join("")
                      )
                    }
                  </TableCell>
                  <TableCell>{fund.totalFundValue}</TableCell>
                  <TableCell>
                    {formatUnits(
                      allocatedFunds.find(
                        (aF) => aF.code === fund.name.split(":")[0]
                      )?.averagePrice!
                    )}
                  </TableCell>
                  <TableCell>
                    {formatPercent(
                      (+formatUnits(
                        +dailyPrices.funds
                          .find(
                            (dp: { fundCode: string }) =>
                              dp.fundCode === fund.name.split(":")[0]
                          )!
                          .fundBidPrice.trim()
                          .split(",")
                          .join("")
                      ) -
                        +formatUnits(
                          allocatedFunds.find(
                            (aF) => aF.code === fund.name.split(":")[0]
                          )?.averagePrice!
                        )) /
                        +formatUnits(
                          allocatedFunds.find(
                            (aF) => aF.code === fund.name.split(":")[0]
                          )?.averagePrice!
                        )
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {fund.apportionmentRate}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-medium">
                Total Investment Value:
              </TableCell>
              <TableCell className="text-right" colSpan={6}>
                {format2dp(tiv)}
              </TableCell>
            </TableRow>
            {totalDividendsPaidout > 0 && (
              <TableRow>
                <TableCell className="font-medium">
                  Total Dividends Received:
                </TableCell>
                <TableCell className="text-right" colSpan={6}>
                  {format2dp(totalDividendsPaidout)}
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell className="font-medium">
                Total Investment Amount:
              </TableCell>
              <TableCell className="text-right" colSpan={6}>
                {format2dp(tia)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                Return on Investment (ROI):
              </TableCell>
              <TableCell className="text-right" colSpan={6}>
                {formatPercent((tiv + totalDividendsPaidout - tia) / tia)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
      <Card className="py-2 col-span-3">
        <AllocationTimelineBeta
          data={JSON.stringify(fundswitches)}
          commencementMonth={data!.profile.commencementDate.split("/")[1]}
          premiumFreq={data!.profile.premiumFreq}
          dailyPricesJSON={JSON.stringify(dailyPrices)}
        />
      </Card>
      {dividends && (
        <Card className="py-2 col-span-3">
          <Table>
            <TableCaption>Dividends</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Fund Name</TableHead>
                <TableHead>Payout Mode</TableHead>
                <TableHead>Dividend Rate</TableHead>
                <TableHead>Dividend Rate (Annualised)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dividends.dividends.map((dividend) => (
                <TableRow>
                  <TableCell>
                    {
                      dailyPrices?.funds.find(
                        (dp: { fundCode: any }) => dp.fundCode === dividend.code
                      )!.fundName
                    }
                  </TableCell>
                  <TableCell>{dividend.payout}</TableCell>
                  <TableCell>
                    {formatUnits(
                      +dividend.rate.split(",").join("").split("%").join("")
                    )}
                  </TableCell>
                  <TableCell>
                    {formatUnits(
                      +dividend.rate.split(",").join("").split("%").join("") *
                        12
                    )}
                  </TableCell>

                  <TableCell>{dividend.date}</TableCell>
                  <TableCell>{dividend.method}</TableCell>
                  <TableCell className="text-right">
                    {dividend.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total Dividend Amount:</TableCell>
                <TableCell className="text-right" colSpan={6}>
                  {format2dp(
                    dividends.dividends.reduce(function (acc, obj) {
                      return acc + +obj.amount.split(",").join("");
                    }, 0)
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Card>
      )}
      <Card className="py-2 col-span-3">
        <Table>
          <TableCaption>Transactions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Funds</TableHead>
              <TableHead colSpan={10}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead className="w-[150px] overflow-hidden">
                        Description
                      </TableHead>
                      <TableHead className="w-[150px]">Price</TableHead>
                      <TableHead className="w-[150px]">Bal Units</TableHead>
                      <TableHead className="w-[150px]">Units</TableHead>
                      <TableHead className="w-[150px]">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </TableHead>
              <TableHead>Avg Price After Policy Fee</TableHead>
              <TableHead>Current Fund Price</TableHead>
              <TableHead>% Return</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocatedFunds.map((fund) => (
              <TableRow>
                <TableCell className="font-medium" width={100}>
                  {
                    dailyPrices?.funds.find(
                      (dp: { fundCode: any }) => dp.fundCode === fund.code
                    )!.fundName
                  }
                </TableCell>
                <TableCell colSpan={10}>
                  <Table>
                    <TableBody>
                      {fund.transactions
                        .slice()
                        .reverse()
                        .map((trx) => (
                          <TableRow>
                            <TableCell className="w-[150px]">
                              {trx.date}
                            </TableCell>
                            <TableCell
                              className={`w-[150px] ${
                                trx.units < 0 ? "text-red-500" : ""
                              }`}
                            >
                              {trx.description.split("-")[1]}
                            </TableCell>
                            <TableCell className="w-[150px]">
                              {trx.price}
                            </TableCell>
                            <TableCell className={`w-[150px]`}>
                              {format2dp(trx.balanceUnits)}
                            </TableCell>
                            <TableCell
                              className={`w-[150px] ${
                                trx.units < 0 ? "text-red-500" : ""
                              }`}
                            >
                              {format2dp(trx.units)}
                            </TableCell>
                            <TableCell
                              className={`w-[150px] ${
                                trx.units < 0 ? "text-red-500" : ""
                              }`}
                            >
                              {format2dp(trx.value)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                      {fund.totalUnitsAfterFees > 0 && (
                        <TableRow>
                          <TableCell>Total (Before Fees):</TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>

                          <TableCell>
                            {format2dp(
                              fund.transactions.reduce(
                                (prev, cur) => prev + cur.units,
                                0
                              )
                            )}
                          </TableCell>
                          <TableCell>
                            {format2dp(
                              fund.transactions.reduce(
                                (prev, cur) => prev + cur.units,
                                0
                              ) *
                                +dailyPrices.funds.find(
                                  (dp: { fundCode: string }) =>
                                    dp.fundCode === fund.code
                                )!.fundBidPrice
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell>
                          Total
                          {fund.totalUnitsAfterFees > 0 && (
                            <span> (After Fees):</span>
                          )}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>

                        <TableCell>
                          {format2dp(fund.totalUnitsAfterFees)}
                        </TableCell>
                        <TableCell>
                          {format2dp(fund.totalValueAfterFees)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableCell>
                <TableCell>{formatUnits(fund.averagePrice!)}</TableCell>
                <TableCell>
                  {formatUnits(
                    +dailyPrices.funds.find(
                      (dp: { fundCode: string }) => dp.fundCode === fund.code
                    )!.fundBidPrice
                  )}
                </TableCell>
                <TableCell>
                  {fund.averagePrice! > 0
                    ? formatPercent(
                        (+formatUnits(
                          +dailyPrices.funds
                            .find(
                              (dp: { fundCode: string }) =>
                                dp.fundCode === fund.code
                            )!
                            .fundBidPrice.trim()
                            .split(",")
                            .join("")
                        ) -
                          +formatUnits(fund.averagePrice!)) /
                          +formatUnits(fund.averagePrice!)
                      )
                    : "NA"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* <TableFooter>
            <TableRow>
              <TableCell className="font-medium">Cash Fund:</TableCell>
              <TableCell className="text-right" colSpan={4}>
                {formatUnits(cashFund)}
              </TableCell>
            </TableRow> 
          </TableFooter> */}
        </Table>
      </Card>
    </section>
  );
}
