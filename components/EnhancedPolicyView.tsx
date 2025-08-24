// @ts-nocheck

"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Target,
  ArrowRightLeft,
  Activity,
  BarChart3,
  PieChart,
  Zap,
} from "lucide-react";
import { format2dp, formatPercent, formatUnits } from "@/utils/formatters";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Legend,
  ReferenceLine,
  Brush,
  ScatterChart,
  Scatter,
} from "recharts";
import moment from "moment";
import { FundSwitch, ApplicationType } from "@/utils/transactionsParser";

interface PolicyData {
  policyNumber: string;
  profile: {
    name: string;
    commencementDate: string;
    premium: string;
    premiumFreq: string;
  };
  policyDetails: {
    productName: string;
    tiv: string;
    tia: number;
    funds: Array<{
      name: string;
      totalFundValue: string;
      totalFundUnits: string;
      unitPrice: string;
      apportionmentRate: string;
    }>;
  };
  transactions: Array<{
    runDate: string;
    effectiveDate: string;
    type: string;
    code: string;
    transactionAmount: string;
    transactionUnits: string;
    transactionPrice: string;
    balanceUnits: string;
  }>;
  lastUpdated: string;
}

interface Props {
  data: PolicyData;
  dailyPrices: any;
  dividends: any;
  allocatedFunds: any[];
  fundSwitches: FundSwitch[];
  isWelcomeBonusPremium: boolean;
  showPrivateInfo: boolean;
}

export default function EnhancedPolicyView({
  data,
  dailyPrices,
  dividends,
  allocatedFunds,
  fundSwitches,
  isWelcomeBonusPremium,
  showPrivateInfo,
}: Props) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [chartType, setChartType] = useState("performance");

  // Enhanced transaction analysis
  const transactionAnalysis = useMemo(() => {
    const transactions = [...data.transactions].reverse();

    // Performance timeline with fund switches
    const performanceTimeline = [];
    let cumulativeTiv = 0;
    let cumulativeTia = 0;

    const monthlyData: { [key: string]: any } = {};

    transactions.forEach((trx, index) => {
      const date = moment(trx.runDate, "DD/MM/YYYY");
      const monthKey = date.format("YYYY-MM");

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          date: monthKey,
          dateObj: date.toDate(),
          tiv: 0,
          tia: 0,
          switches: [],
          inflows: 0,
          outflows: 0,
          fees: 0,
        };
      }

      const amount = parseFloat(trx.transactionAmount.replace(/,/g, ""));
      const transactionType = trx.type.split("-")[1];

      switch (transactionType) {
        case ApplicationType.Inflow:
        case ApplicationType.WelcomeBonus:
        case ApplicationType.CampaignBonus:
        case ApplicationType.SPTopUp:
          monthlyData[monthKey].inflows += amount;
          monthlyData[monthKey].tia += amount;
          break;
        case ApplicationType.SurrenderWithdrawal:
          monthlyData[monthKey].outflows += amount;
          break;
        case ApplicationType.SwitchOut:
          monthlyData[monthKey].switches.push({
            type: "out",
            fund: trx.code,
            amount: amount,
            price: parseFloat(trx.transactionPrice.replace(/,/g, "")),
          });
          break;
        case ApplicationType.SwitchIn:
          monthlyData[monthKey].switches.push({
            type: "in",
            fund: trx.code,
            amount: amount,
            price: parseFloat(trx.transactionPrice.replace(/,/g, "")),
          });
          break;
        case ApplicationType.Fee:
        case ApplicationType.RiskCharge:
        case ApplicationType.RiderPremium:
          monthlyData[monthKey].fees += amount;
          break;
      }
    });

    // Convert to array and calculate running totals
    const timelineData = Object.values(monthlyData)
      .sort((a: any, b: any) => a.dateObj - b.dateObj)
      .map((month: any, index) => {
        cumulativeTia += month.tia;
        // Estimate TIV growth (would need actual historical prices for accuracy)
        const performanceGrowth = index > 0 ? 1.005 : 1; // Simplified growth estimate
        cumulativeTiv = cumulativeTia * performanceGrowth;

        return {
          ...month,
          cumulativeTiv,
          cumulativeTia,
          performance:
            cumulativeTia > 0
              ? ((cumulativeTiv - cumulativeTia) / cumulativeTia) * 100
              : 0,
          netFlow: month.inflows - month.outflows - month.fees,
          switchCount: month.switches.length,
        };
      });

    // Fund switch analysis
    const switchAnalysis = fundSwitches
      .map((fs) => {
        const switchDate = moment(fs.date, "DD/MM/YYYY");
        return {
          ...fs,
          dateObj: switchDate.toDate(),
          monthKey: switchDate.format("YYYY-MM"),
          priceAtSwitch: parseFloat(fs.price.replace(/,/g, "")),
        };
      })
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    // Calculate fund performance
    const fundPerformanceMap = new Map();
    allocatedFunds.forEach((fund) => {
      const currentPrice = dailyPrices?.funds?.find(
        (dp: any) => dp.fundCode === fund.code
      )?.fundBidPrice;
      if (currentPrice && fund.averagePrice) {
        const performance =
          ((parseFloat(currentPrice.replace(/,/g, "")) - fund.averagePrice) /
            fund.averagePrice) *
          100;
        fundPerformanceMap.set(fund.code, {
          performance,
          currentPrice: parseFloat(currentPrice.replace(/,/g, "")),
          averagePrice: fund.averagePrice,
          totalValue: fund.totalValueAfterFees,
          fundName:
            dailyPrices?.funds?.find((dp: any) => dp.fundCode === fund.code)
              ?.fundName || fund.code,
        });
      }
    });

    return {
      timelineData,
      switchAnalysis,
      fundPerformanceMap,
      totalSwitches: switchAnalysis.length / 2, // Each switch has in/out pair
      switchFrequency:
        switchAnalysis.length > 0
          ? moment().diff(moment(switchAnalysis[0]?.dateObj), "months") /
            (switchAnalysis.length / 2)
          : 0,
    };
  }, [data.transactions, allocatedFunds, dailyPrices, fundSwitches]);

  // Current portfolio health
  const portfolioHealth = useMemo(() => {
    const currentTiv = parseFloat(data.policyDetails.tiv.replace(/,/g, ""));
    const totalInvested = data.policyDetails.tia;
    const overallPerformance =
      ((currentTiv - totalInvested) / totalInvested) * 100;

    // Calculate cash position
    const cashFunds = data.policyDetails.funds.filter(
      (f) =>
        f.name.toLowerCase().includes("cash") ||
        f.name.toLowerCase().includes("money market")
    );
    const totalCash = cashFunds.reduce(
      (sum, f) => sum + parseFloat(f.totalFundValue.replace(/,/g, "")),
      0
    );
    const cashPercentage = (totalCash / currentTiv) * 100;

    // Risk assessment based on fund allocation
    let riskScore = 0;
    data.policyDetails.funds.forEach((fund) => {
      const value = parseFloat(fund.totalFundValue.replace(/,/g, ""));
      const percentage = value / currentTiv;

      if (
        fund.name.toLowerCase().includes("equity") ||
        fund.name.toLowerCase().includes("growth")
      ) {
        riskScore += percentage * 0.8;
      } else if (fund.name.toLowerCase().includes("balanced")) {
        riskScore += percentage * 0.5;
      } else if (
        fund.name.toLowerCase().includes("bond") ||
        fund.name.toLowerCase().includes("cash")
      ) {
        riskScore += percentage * 0.2;
      }
    });

    // Action recommendations
    const recommendations = [];
    if (cashPercentage > 15) {
      recommendations.push({
        type: "warning",
        title: "High Cash Allocation",
        description: `${cashPercentage.toFixed(
          1
        )}% in cash is reducing returns. Consider rebalancing.`,
        priority: "high",
      });
    }
    if (
      overallPerformance < 2 &&
      moment().diff(
        moment(data.profile.commencementDate, "DD/MM/YYYY"),
        "years"
      ) > 1
    ) {
      recommendations.push({
        type: "critical",
        title: "Underperformance Alert",
        description: `${overallPerformance.toFixed(
          1
        )}% return is below market expectations.`,
        priority: "critical",
      });
    }
    if (
      transactionAnalysis.switchFrequency > 0 &&
      transactionAnalysis.switchFrequency < 6
    ) {
      recommendations.push({
        type: "info",
        title: "High Switch Frequency",
        description: `Switching every ${transactionAnalysis.switchFrequency.toFixed(
          1
        )} months may increase costs.`,
        priority: "medium",
      });
    }

    return {
      overallPerformance,
      cashPercentage,
      riskScore,
      recommendations,
      totalCash,
      portfolioAge: moment().diff(
        moment(data.profile.commencementDate, "DD/MM/YYYY"),
        "months"
      ),
    };
  }, [data, transactionAnalysis]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: $${format2dp(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Policy Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {data.policyDetails.productName}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Policy: {data.policyNumber} •{" "}
                {showPrivateInfo ? data.profile.name : "***"}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                $
                {format2dp(
                  parseFloat(data.policyDetails.tiv.replace(/,/g, ""))
                )}
              </div>
              <div
                className={`text-sm flex items-center gap-1 ${
                  portfolioHealth.overallPerformance > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {portfolioHealth.overallPerformance > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatPercent(portfolioHealth.overallPerformance / 100)} Total
                Return
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 uppercase tracking-wide">
                  Total Invested
                </p>
                <p className="text-lg font-bold text-blue-900">
                  ${format2dp(data.policyDetails.tia)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Percent className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide">
                  Performance
                </p>
                <p className="text-lg font-bold text-green-900">
                  {formatPercent(portfolioHealth.overallPerformance / 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-xs text-orange-600 uppercase tracking-wide">
                  Risk Level
                </p>
                <p className="text-lg font-bold text-orange-900">
                  {Math.round(portfolioHealth.riskScore * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600 uppercase tracking-wide">
                  Switches
                </p>
                <p className="text-lg font-bold text-purple-900">
                  {transactionAnalysis.totalSwitches}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Alert */}
      {portfolioHealth.recommendations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Portfolio Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolioHealth.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      rec.priority === "critical"
                        ? "destructive"
                        : rec.priority === "high"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {rec.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TradingView-Style Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="performance">Performance Chart</TabsTrigger>
            <TabsTrigger value="switches">Fund Switches</TabsTrigger>
            <TabsTrigger value="allocation">Portfolio Composition</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Flow</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTimeframe("1y")}
            >
              1Y
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTimeframe("3y")}
            >
              3Y
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTimeframe("all")}
            >
              All
            </Button>
          </div>
        </div>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance vs Investment Timeline
              </CardTitle>
              <CardDescription>
                Track portfolio value growth against cumulative investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={transactionAnalysis.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => moment(value).format("MMM YY")}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {/* Portfolio Value Area */}
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="cumulativeTiv"
                      fill="rgba(34, 197, 94, 0.2)"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth={2}
                      name="Portfolio Value"
                    />

                    {/* Investment Amount Line */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="cumulativeTia"
                      stroke="rgb(239, 68, 68)"
                      strokeWidth={2}
                      dot={false}
                      name="Total Invested"
                    />

                    {/* Performance Line */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="performance"
                      stroke="rgb(168, 85, 247)"
                      strokeWidth={2}
                      dot={{ fill: "rgb(168, 85, 247)", strokeWidth: 0, r: 3 }}
                      name="Performance %"
                    />

                    {/* Cash Inflow/Outflow Bars */}
                    <Bar
                      yAxisId="left"
                      dataKey="netFlow"
                      fill="rgba(59, 130, 246, 0.5)"
                      name="Net Cash Flow"
                    />

                    <ReferenceLine
                      yAxisId="right"
                      y={0}
                      stroke="gray"
                      strokeDasharray="2 2"
                    />
                    <Brush dataKey="date" height={30} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="switches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                Fund Switch Analysis
              </CardTitle>
              <CardDescription>
                Detailed view of fund switching patterns and timing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Switch Timeline */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={transactionAnalysis.switchAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="dateObj"
                        domain={["dataMin", "dataMax"]}
                        scale="time"
                        tickFormatter={(value) =>
                          moment(value).format("MMM YY")
                        }
                      />
                      <YAxis
                        dataKey="priceAtSwitch"
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip
                        formatter={(value: any, name: any, props: any) => [
                          `$${format2dp(props.payload.amount)}`,
                          `${props.payload.direction}`,
                        ]}
                        labelFormatter={(value) =>
                          moment(value).format("DD MMM YYYY")
                        }
                      />
                      <Scatter
                        dataKey="amount"
                        fill={(entry: any) =>
                          entry.direction.includes("To") ? "#ef4444" : "#22c55e"
                        }
                        name="Switch Amount"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                {/* Switch Summary Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>From Fund</TableHead>
                      <TableHead>To Fund</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionAnalysis.switchAnalysis
                      .filter((s) => s.direction.includes("To"))
                      .slice(-5)
                      .map((switchOut, index) => {
                        const switchIn =
                          transactionAnalysis.switchAnalysis.find(
                            (s) =>
                              s.date === switchOut.date &&
                              s.direction.includes("From")
                          );
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {moment(switchOut.date, "DD/MM/YYYY").format(
                                "DD MMM YYYY"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{switchOut.code}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">
                                {switchIn?.code || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              ${format2dp(switchOut.amount)}
                            </TableCell>
                            <TableCell>${switchOut.price}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">Rebalanced</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Current Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.policyDetails.funds
                    .filter(
                      (f) => parseFloat(f.totalFundUnits.replace(/,/g, "")) > 0
                    )
                    .map((fund, index) => {
                      const value = parseFloat(
                        fund.totalFundValue.replace(/,/g, "")
                      );
                      const totalValue = parseFloat(
                        data.policyDetails.tiv.replace(/,/g, "")
                      );
                      const percentage = (value / totalValue) * 100;
                      const fundInfo =
                        transactionAnalysis.fundPerformanceMap.get(
                          fund.name.split(":")[0]
                        );

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">
                              {fund.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {percentage.toFixed(1)}%
                              </Badge>
                              <span className="text-sm font-medium">
                                ${format2dp(value)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                }}
                              />
                            </div>
                            {fundInfo && (
                              <span
                                className={`text-xs ${
                                  fundInfo.performance > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {fundInfo.performance > 0 ? "+" : ""}
                                {fundInfo.performance.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Fund Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Fund Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(
                    transactionAnalysis.fundPerformanceMap.entries()
                  ).map(([code, info]) => (
                    <div key={code} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          {info.fundName}
                        </span>
                        <Badge
                          variant={
                            info.performance > 0 ? "default" : "destructive"
                          }
                        >
                          {info.performance > 0 ? "+" : ""}
                          {info.performance.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Current: ${info.currentPrice.toFixed(2)}</div>
                        <div>Avg Cost: ${info.averagePrice.toFixed(2)}</div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${
                              info.performance > 0
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                Math.abs(info.performance) * 2,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Transaction Flow Analysis
              </CardTitle>
              <CardDescription>
                Monthly breakdown of cash flows and transaction patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={transactionAnalysis.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => moment(value).format("MMM YY")}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `$${format2dp(value)}`,
                        name,
                      ]}
                      labelFormatter={(label) =>
                        moment(label).format("MMM YYYY")
                      }
                    />
                    <Legend />

                    <Bar
                      dataKey="inflows"
                      fill="rgba(34, 197, 94, 0.7)"
                      name="Inflows"
                    />
                    <Bar
                      dataKey="outflows"
                      fill="rgba(239, 68, 68, 0.7)"
                      name="Outflows"
                    />
                    <Bar
                      dataKey="fees"
                      fill="rgba(107, 114, 128, 0.7)"
                      name="Fees"
                    />
                    <Line
                      type="monotone"
                      dataKey="switchCount"
                      stroke="rgb(168, 85, 247)"
                      strokeWidth={2}
                      name="Switches"
                      dot={{ fill: "rgb(168, 85, 247)", strokeWidth: 0, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
