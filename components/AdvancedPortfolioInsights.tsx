"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Target,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Clock,
  Zap,
  Shield,
  Award,
} from "lucide-react";
import { format2dp } from "@/utils/formatters";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from "recharts";

interface Client {
  id: string;
  policy_number: string;
  nickname: string;
  tiv: number;
  tia: number;
  cash: number;
  grossProfit: string;
  xirr: string;
  totalDividendsPaidout: number;
  commencementDate: string;
  premium: string;
  productName: string;
  isInsurance: boolean;
  fundAllocations: Array<{
    name: string;
    value: number;
    percentage: number;
    units: number;
    price: number;
  }>;
  riskScore: number;
  lastUpdated: string;
  duration: number;
}

interface Props {
  clients: Client[];
  showPrivateInfo: boolean;
}

export default function AdvancedPortfolioInsights({ clients, showPrivateInfo }: Props) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("performance");

  const insights = useMemo(() => {
    // Performance analytics
    const performanceData = clients.map(client => ({
      name: client.nickname,
      performance: parseFloat(client.grossProfit.replace('%', '')),
      aum: client.tiv,
      duration: client.duration,
      riskScore: client.riskScore * 100,
    }));

    // Cash flow analytics
    const cashFlowAnalysis = {
      totalCashFlow: clients.reduce((sum, client) => sum + client.tiv - client.tia, 0),
      totalInvested: clients.reduce((sum, client) => sum + client.tia, 0),
      totalValue: clients.reduce((sum, client) => sum + client.tiv, 0),
      cashReserves: clients.reduce((sum, client) => sum + client.cash, 0),
      dividendIncome: clients.reduce((sum, client) => sum + client.totalDividendsPaidout, 0),
    };

    // Risk analytics
    const riskAnalysis = {
      lowRisk: clients.filter(c => c.riskScore < 0.3).length,
      mediumRisk: clients.filter(c => c.riskScore >= 0.3 && c.riskScore <= 0.7).length,
      highRisk: clients.filter(c => c.riskScore > 0.7).length,
      averageRisk: clients.reduce((sum, c) => sum + c.riskScore, 0) / clients.length,
    };

    // Performance distribution
    const performanceDistribution = {
      excellent: clients.filter(c => parseFloat(c.grossProfit.replace('%', '')) > 20).length,
      good: clients.filter(c => {
        const perf = parseFloat(c.grossProfit.replace('%', ''));
        return perf > 10 && perf <= 20;
      }).length,
      average: clients.filter(c => {
        const perf = parseFloat(c.grossProfit.replace('%', ''));
        return perf > 0 && perf <= 10;
      }).length,
      poor: clients.filter(c => parseFloat(c.grossProfit.replace('%', '')) <= 0).length,
    };

    // Duration analytics
    const durationAnalysis = {
      newPolicies: clients.filter(c => c.duration < 1).length,
      youngPolicies: clients.filter(c => c.duration >= 1 && c.duration < 3).length,
      maturePolicies: clients.filter(c => c.duration >= 3 && c.duration < 10).length,
      veteranPolicies: clients.filter(c => c.duration >= 10).length,
    };

    // Top and bottom performers
    const sortedByPerformance = [...clients].sort((a, b) => 
      parseFloat(b.grossProfit.replace('%', '')) - parseFloat(a.grossProfit.replace('%', ''))
    );

    const topPerformers = sortedByPerformance.slice(0, 5);
    const bottomPerformers = sortedByPerformance.slice(-5).reverse();

    // Cash reserves analysis
    const cashAnalysis = {
      clientsWithCash: clients.filter(c => c.cash > 0),
      totalCashReserves: clients.reduce((sum, c) => sum + c.cash, 0),
      averageCashPercentage: clients.length > 0 
        ? clients.reduce((sum, c) => sum + (c.cash / c.tiv * 100), 0) / clients.length
        : 0,
    };

    // Fund allocation insights
    const fundTypeAnalysis: { [key: string]: number } = {};
    clients.forEach(client => {
      client.fundAllocations.forEach(fund => {
        const fundType = fund.name.split(':')[1]?.trim().split(' ')[0] || 'Other';
        fundTypeAnalysis[fundType] = (fundTypeAnalysis[fundType] || 0) + fund.value;
      });
    });

    // Efficiency metrics
    const efficiencyMetrics = {
      cashDragEffect: cashAnalysis.totalCashReserves / cashFlowAnalysis.totalValue * 100,
      averagePerformance: clients.length > 0 
        ? clients.reduce((sum, c) => sum + parseFloat(c.grossProfit.replace('%', '')), 0) / clients.length
        : 0,
      underperformingCount: clients.filter(c => parseFloat(c.grossProfit.replace('%', '')) < 5).length,
    };

    return {
      performanceData,
      cashFlowAnalysis,
      riskAnalysis,
      performanceDistribution,
      durationAnalysis,
      topPerformers,
      bottomPerformers,
      cashAnalysis,
      fundTypeAnalysis,
      efficiencyMetrics,
    };
  }, [clients]);

  const performanceVsRiskData = clients.map(client => ({
    x: client.riskScore * 100,
    y: parseFloat(client.grossProfit.replace('%', '')),
    name: client.nickname,
    aum: client.tiv,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Key Insight Cards */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-800">Cash Efficiency</CardTitle>
              <Zap className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {(100 - insights.efficiencyMetrics.cashDragEffect).toFixed(1)}%
            </div>
            <p className="text-xs text-green-700 mt-1">
              Portfolio efficiency score
            </p>
            <div className="mt-2">
              <Progress 
                value={100 - insights.efficiencyMetrics.cashDragEffect} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800">Performance Spread</CardTitle>
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {insights.efficiencyMetrics.averagePerformance.toFixed(1)}%
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Average portfolio performance
            </p>
            <div className="flex gap-1 mt-2">
              <div className="flex-1 h-2 bg-red-200 rounded"></div>
              <div className="flex-1 h-2 bg-yellow-200 rounded"></div>
              <div className="flex-1 h-2 bg-green-200 rounded"></div>
              <div className="flex-1 h-2 bg-green-400 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-800">Risk Balance</CardTitle>
              <Shield className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {(insights.riskAnalysis.averageRisk * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Average risk exposure
            </p>
            <div className="flex justify-between text-xs mt-2">
              <span>Low: {insights.riskAnalysis.lowRisk}</span>
              <span>Med: {insights.riskAnalysis.mediumRisk}</span>
              <span>High: {insights.riskAnalysis.highRisk}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-800">Action Required</CardTitle>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {insights.efficiencyMetrics.underperformingCount}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Policies need attention
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                Review Required
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance vs Risk Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Performance vs Risk Analysis
            </CardTitle>
            <CardDescription>
              Scatter plot showing risk-adjusted returns across portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={performanceVsRiskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Risk Score (%)"
                    domain={[0, 100]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Performance (%)"
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [
                      name === 'x' ? `${value}%` : name === 'y' ? `${value}%` : `$${format2dp(value)}`,
                      name === 'x' ? 'Risk Score' : name === 'y' ? 'Performance' : 'AUM'
                    ]}
                    labelFormatter={(label, payload) => 
                      payload?.[0] ? `Client: ${showPrivateInfo ? payload[0].payload.name : '***'}` : ''
                    }
                  />
                  <Scatter dataKey="y" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Low Risk → High Risk</span>
              <span>Lower Return ↑ Higher Return</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of policy performance across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Excellent (&gt;20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(insights.performanceDistribution.excellent / clients.length) * 100}
                    className="w-20"
                  />
                  <span className="text-sm font-medium min-w-[2rem]">
                    {insights.performanceDistribution.excellent}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Good (10-20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(insights.performanceDistribution.good / clients.length) * 100}
                    className="w-20"
                  />
                  <span className="text-sm font-medium min-w-[2rem]">
                    {insights.performanceDistribution.good}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Average (0-10%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(insights.performanceDistribution.average / clients.length) * 100}
                    className="w-20"
                  />
                  <span className="text-sm font-medium min-w-[2rem]">
                    {insights.performanceDistribution.average}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Poor (≤0%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(insights.performanceDistribution.poor / clients.length) * 100}
                    className="w-20"
                  />
                  <span className="text-sm font-medium min-w-[2rem]">
                    {insights.performanceDistribution.poor}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>{insights.performanceDistribution.excellent + insights.performanceDistribution.good}</strong> out of {clients.length} policies 
                are performing above 10% returns, representing strong portfolio health.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.topPerformers.slice(0, 5).map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-5 h-5 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {showPrivateInfo ? client.nickname : '***'}
                      </p>
                      <p className="text-xs text-muted-foreground">{client.policy_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {client.grossProfit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${format2dp(client.tiv)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cash Reserves Detailed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Cash Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${format2dp(insights.cashAnalysis.totalCashReserves)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total cash across {insights.cashAnalysis.clientsWithCash.length} policies
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average cash %:</span>
                  <span className="font-medium">
                    {insights.cashAnalysis.averageCashPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cash drag impact:</span>
                  <span className="font-medium text-orange-600">
                    -{insights.efficiencyMetrics.cashDragEffect.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Top cash positions:</p>
                {insights.cashAnalysis.clientsWithCash
                  .sort((a, b) => b.cash - a.cash)
                  .slice(0, 3)
                  .map((client) => (
                    <div key={client.id} className="flex justify-between text-xs py-1">
                      <span>{showPrivateInfo ? client.nickname : '***'}</span>
                      <span className="font-medium">${format2dp(client.cash)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.cashAnalysis.clientsWithCash.length > 0 && (
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Optimize Cash Reserves
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        {insights.cashAnalysis.clientsWithCash.length} policies holding 
                        ${format2dp(insights.cashAnalysis.totalCashReserves)} in cash
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {insights.efficiencyMetrics.underperformingCount > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Review Underperformers
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {insights.efficiencyMetrics.underperformingCount} policies 
                        below 5% performance threshold
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Schedule Reviews
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {insights.durationAnalysis.maturePolicies + insights.durationAnalysis.veteranPolicies} 
                      policies due for annual review
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Rebalance Opportunities
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Identify fund switches for better diversification
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}