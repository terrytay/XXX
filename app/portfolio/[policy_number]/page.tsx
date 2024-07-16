import { getAllocations, getClient, getDividends } from "../action";
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
import {
  format2dp,
  formatAmount,
  formatPercent,
  formatUnits,
} from "@/utils/formatters";
import { createClient } from "@/utils/supabase/server";
import { UserResponse } from "@supabase/supabase-js";
import { bounceOut } from "@/app/auth/action";
import { redirect } from "next/navigation";
import { parseTransactions } from "@/utils/transactionsParser";
import { getPrices } from "@/app/prices/action";
import PolicyChart from "@/components/FundHoldingChart";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { AllocationTimeline } from "@/components/AllocationTimeline";
import { AgentClientAllocation } from "@/utils/types/allocation";
import { Toaster } from "@/components/ui/sonner";
import SnapshotChart from "@/components/SnapshotChart";
import moment from "moment";
import { dateDiff } from "@/utils/date";

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
  const data = await getClient(params.policy_number);
  const dividends = await getDividends(params.policy_number);

  const templateAllocationData: AgentClientAllocation = {
    agentId: user.data.user.id,
    policyNumber: params.policy_number,
  };

  const allocationData = await getAllocations(params.policy_number);

  if (data?.agentId != user.data.user.id) {
    return redirect("/");
  }

  const allocatedFunds = parseTransactions(data);
  let cashFund = 0;

  const dailyPrices = await getPrices();

  let today = new Date().toISOString().slice(0, 10);

  let [day, month, year] = data.profile.commencementDate.split("/");
  const startDate = year.concat("-").concat(month).concat("-").concat(day);

  let duration = dateDiff(startDate, today);
  duration = duration
    .replace("Y", " Years")
    .replace("1 Years", "1 Year")
    .replace("M", " Months")
    .replace("1 Months", "1 Month")
    .replace("D", " Days")
    .replace("1 Days", "1 Day");
  return (
    <section className="grid grid-cols-3 gap-4 mx-10">
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardDescription className="text-md">Client Profile</CardDescription>
        </CardHeader>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>{data?.profile.name}</TableCell>
            </TableRow>
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
              <TableCell>Last Updated</TableCell>
              <TableCell>{data?.lastUpdated}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <PolicyChart stringData={JSON.stringify(data)} />
      <SnapshotChart stringData={JSON.stringify(data)} />
      <div className="border border-gray-300 rounded-lg p-4 col-span-3">
        <Table>
          <TableCaption>Portfolio Summary</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Fund Name</TableHead>
              <TableHead>Total Units</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Total Fund Value</TableHead>
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
                  <TableCell>{fund.unitPrice}</TableCell>
                  <TableCell>{fund.totalFundValue}</TableCell>
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
              <TableCell className="text-right" colSpan={4}>
                {data?.policyDetails.tiv}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                Total Investment Amount:
              </TableCell>
              <TableCell className="text-right" colSpan={4}>
                {format2dp(data?.policyDetails.tia!)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Gross Profit:</TableCell>
              <TableCell className="text-right" colSpan={4}>
                {formatPercent(+data?.policyDetails.grossProfit!)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div className="border border-gray-300 rounded-lg p-4 col-span-3">
        <AllocationTimeline
          data={JSON.stringify(allocationData || templateAllocationData)}
          commencementMonth={data.profile.commencementDate.split("/")[1]}
          premiumFreq={data.profile.premiumFreq}
        />
      </div>
      {dividends && (
        <div className="border border-gray-300 rounded-lg p-4 col-span-3">
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
                      dailyPrices.funds.find(
                        (dp: { fundCode: any }) => dp.fundCode === dividend.code
                      ).fundName
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
        </div>
      )}
      <div className="border border-gray-300 rounded-lg p-4 col-span-3">
        <Table>
          <TableCaption>Transactions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Funds</TableHead>
              <TableHead colSpan={8}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead className="w-[150px]">Price</TableHead>
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
                    dailyPrices.funds.find(
                      (dp: { fundCode: any }) => dp.fundCode === fund.code
                    ).fundName
                  }
                </TableCell>
                <TableCell colSpan={8}>
                  <Table>
                    <TableBody>
                      {fund.transactions.map((trx) => (
                        <TableRow
                          className={`${
                            trx.units < 0 ? "text-red-500" : "text-greem-500"
                          }`}
                        >
                          <TableCell className="w-[150px]">
                            {trx.date}
                          </TableCell>
                          <TableCell className="w-[150px]">
                            {trx.price}
                          </TableCell>
                          <TableCell className="w-[150px]">
                            {format2dp(trx.units)}
                          </TableCell>
                          <TableCell className="w-[150px]">
                            {format2dp(trx.value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell>Total (After Fees):</TableCell>
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
                    dailyPrices.funds.find(
                      (dp: { fundCode: string }) => dp.fundCode === fund.code
                    ).fundBidPrice
                  )}
                </TableCell>
                <TableCell>
                  {formatPercent(
                    (+formatUnits(
                      +dailyPrices.funds
                        .find(
                          (dp: { fundCode: string }) =>
                            dp.fundCode === fund.code
                        )
                        .fundBidPrice.trim()
                        .split(",")
                        .join("")
                    ) -
                      +formatUnits(fund.averagePrice!)) /
                      +formatUnits(fund.averagePrice!)
                  )}
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
      </div>
      <Toaster />
    </section>
  );
}
