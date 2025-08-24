"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { format2dp, formatPercent } from "@/utils/formatters";
import Link from "next/link";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

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
  aggregatedData: {
    totalPremium: number;
    totalAum: number;
    totalCash: number;
    totalDividends: number;
    totalRoi: string;
    averageRiskScore: number;
    clientCount: number;
  };
}

export default function InteractivePortfolioAnalytics({ clients, showPrivateInfo, aggregatedData }: Props) {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Performance-optimized analytics calculations with memoization
  const analytics = useMemo(() => {
    const now = new Date();
    
    // Cash Management Intelligence
    const highCashClients = clients.filter(c => c.cash > c.tiv * 0.15);
    const excessiveCashClients = clients.filter(c => c.cash > c.tiv * 0.25);
    const totalExcessCash = excessiveCashClients.reduce((sum, c) => sum + (c.cash - c.tiv * 0.05), 0);
    
    // Performance Analysis
    const underperformingClients = clients.filter(c => {
      const perf = parseFloat(c.grossProfit.replace('%', ''));
      return perf < 2 && c.duration > 1; // Less than 2% and policy > 1 year old
    });
    
    const topPerformers = clients
      .filter(c => parseFloat(c.grossProfit.replace('%', '')) > 10)
      .sort((a, b) => parseFloat(b.grossProfit.replace('%', '')) - parseFloat(a.grossProfit.replace('%', '')))
      .slice(0, 5);

    // Fund Switch Opportunities
    const switchOpportunities = clients.filter(c => {
      const perf = parseFloat(c.grossProfit.replace('%', ''));
      const hasHighCash = c.cash > c.tiv * 0.1;
      const isUnderperforming = perf < 5 && c.duration > 0.5;
      return hasHighCash || isUnderperforming;
    });

    // Risk Analysis
    const highRiskHighCash = clients.filter(c => c.riskScore > 0.7 && c.cash > c.tiv * 0.1);
    const conservativeUnderperformers = clients.filter(c => 
      c.riskScore < 0.3 && parseFloat(c.grossProfit.replace('%', '')) < 1 && c.duration > 1
    );

    // Action Priority Matrix
    const actionMatrix = {
      critical: clients.filter(c => {
        const perf = parseFloat(c.grossProfit.replace('%', ''));
        return (c.cash > c.tiv * 0.2 && perf < 0) || (perf < -10);
      }),
      urgent: clients.filter(c => {
        const perf = parseFloat(c.grossProfit.replace('%', ''));
        return c.cash > c.tiv * 0.15 || (perf < 2 && c.duration > 2);
      }),
      monitor: clients.filter(c => {
        const perf = parseFloat(c.grossProfit.replace('%', ''));
        return c.cash > c.tiv * 0.05 && c.cash <= c.tiv * 0.15 && perf > 2;
      })
    };

    // Performance Distribution for chart
    const performanceDistribution = [
      { range: 'Below -5%', count: clients.filter(c => parseFloat(c.grossProfit.replace('%', '')) < -5).length, color: '#ef4444' },
      { range: '-5% to 0%', count: clients.filter(c => { const p = parseFloat(c.grossProfit.replace('%', '')); return p >= -5 && p < 0; }).length, color: '#f97316' },
      { range: '0% to 5%', count: clients.filter(c => { const p = parseFloat(c.grossProfit.replace('%', '')); return p >= 0 && p < 5; }).length, color: '#eab308' },
      { range: '5% to 10%', count: clients.filter(c => { const p = parseFloat(c.grossProfit.replace('%', '')); return p >= 5 && p < 10; }).length, color: '#22c55e' },
      { range: 'Above 10%', count: clients.filter(c => parseFloat(c.grossProfit.replace('%', '')) >= 10).length, color: '#16a34a' },
    ];

    // Cash Flow Efficiency
    const totalCashDrag = clients.reduce((sum, c) => sum + Math.max(0, c.cash - c.tiv * 0.05), 0);
    const potentialGains = totalCashDrag * 0.06; // Assuming 6% potential return if deployed

    return {
      highCashClients,
      excessiveCashClients,
      totalExcessCash,
      underperformingClients,
      topPerformers,
      switchOpportunities,
      highRiskHighCash,
      conservativeUnderperformers,
      actionMatrix,
      performanceDistribution,
      totalCashDrag,
      potentialGains,
    };
  }, [clients]);

  // Interactive handlers
  const handleInsightClick = useCallback((insightType: string) => {
    setSelectedInsight(insightType);
    setDetailDialogOpen(true);
  }, []);

  const getInsightData = () => {
    switch (selectedInsight) {
      case 'excess-cash':
        return {
          title: 'Clients with Excess Cash Reserves',
          description: `${analytics.excessiveCashClients.length} clients have excessive cash (>25% of portfolio) that should be redeployed.`,
          clients: analytics.excessiveCashClients,
          action: 'Recommend fund switches to optimize returns',
        };
      case 'underperforming':
        return {
          title: 'Underperforming Policies',
          description: `${analytics.underperformingClients.length} policies are underperforming (<2% returns) and may need portfolio rebalancing.`,
          clients: analytics.underperformingClients,
          action: 'Review fund allocation and consider switching to higher-performing funds',
        };
      case 'switch-opportunities':
        return {
          title: 'Fund Switch Opportunities',
          description: `${analytics.switchOpportunities.length} clients have opportunities for fund optimization.`,
          clients: analytics.switchOpportunities,
          action: 'Analyze current fund performance vs alternatives',
        };
      case 'critical-action':
        return {
          title: 'Critical Action Required',
          description: `${analytics.actionMatrix.critical.length} clients need immediate attention due to poor performance or excessive cash.`,
          clients: analytics.actionMatrix.critical,
          action: 'Schedule client meetings to discuss portfolio restructuring',
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100 border-red-200"
          onClick={() => handleInsightClick('excess-cash')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-800">Excess Cash</CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{analytics.excessiveCashClients.length}</div>
            <p className="text-xs text-red-700 mt-1">
              ${format2dp(analytics.totalExcessCash)} deployable
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                Click for details
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
          onClick={() => handleInsightClick('underperforming')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-800">Underperforming</CardTitle>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{analytics.underperformingClients.length}</div>
            <p className="text-xs text-orange-700 mt-1">
              Policies below 2% returns
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                Review needed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          onClick={() => handleInsightClick('switch-opportunities')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800">Switch Opportunities</CardTitle>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{analytics.switchOpportunities.length}</div>
            <p className="text-xs text-blue-700 mt-1">
              Fund rebalancing potential
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                Optimization ready
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          onClick={() => handleInsightClick('critical-action')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-800">Critical Action</CardTitle>
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analytics.actionMatrix.critical.length}</div>
            <p className="text-xs text-purple-700 mt-1">
              Immediate attention required
            </p>
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution & Cash Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Performance Distribution
            </CardTitle>
            <CardDescription>
              Client performance breakdown across return ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.performanceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} clients`, 'Count']}
                    labelFormatter={(label) => `Performance Range: ${label}`}
                  />
                  <Bar dataKey="count" fill={(entry: any) => entry.color || '#8884d8'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Underperforming:</span>
                <span className="font-bold ml-2">
                  {analytics.performanceDistribution.slice(0, 2).reduce((sum, item) => sum + item.count, 0)} clients
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Outperforming:</span>
                <span className="font-bold ml-2 text-green-600">
                  {analytics.performanceDistribution.slice(-2).reduce((sum, item) => sum + item.count, 0)} clients
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cash Deployment Impact
            </CardTitle>
            <CardDescription>
              Potential gains from optimizing cash positions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Cash Drag</span>
                <span className="font-bold text-red-600">${format2dp(analytics.totalCashDrag)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Potential Annual Gains (6%)</span>
                <span className="font-bold text-green-600">${format2dp(analytics.potentialGains)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Clients with High Cash</span>
                <span className="font-bold">{analytics.highCashClients.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Cash Efficiency by Client Type:</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Conservative (Low Risk)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={75} className="w-16" />
                    <span className="text-xs text-green-600">Good</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Balanced (Med Risk)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={45} className="w-16" />
                    <span className="text-xs text-orange-600">Fair</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Aggressive (High Risk)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={25} className="w-16" />
                    <span className="text-xs text-red-600">Poor</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={() => handleInsightClick('excess-cash')}
            >
              View Cash Optimization Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Action Priority Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Action Priority Matrix
          </CardTitle>
          <CardDescription>
            Prioritized client actions based on urgency and impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h4 className="font-medium text-red-800">Critical ({analytics.actionMatrix.critical.length})</h4>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {analytics.actionMatrix.critical.slice(0, 3).map(client => (
                  <div key={client.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-xs font-medium">
                      {showPrivateInfo ? client.nickname : '***'}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {client.grossProfit}
                    </Badge>
                  </div>
                ))}
                {analytics.actionMatrix.critical.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{analytics.actionMatrix.critical.length - 3} more
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <h4 className="font-medium text-orange-800">Urgent ({analytics.actionMatrix.urgent.length})</h4>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {analytics.actionMatrix.urgent.slice(0, 3).map(client => (
                  <div key={client.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="text-xs font-medium">
                      {showPrivateInfo ? client.nickname : '***'}
                    </span>
                    <Badge variant="default" className="text-xs">
                      ${format2dp(client.cash)}
                    </Badge>
                  </div>
                ))}
                {analytics.actionMatrix.urgent.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{analytics.actionMatrix.urgent.length - 3} more
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <h4 className="font-medium text-green-800">Monitor ({analytics.actionMatrix.monitor.length})</h4>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {analytics.actionMatrix.monitor.slice(0, 3).map(client => (
                  <div key={client.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-xs font-medium">
                      {showPrivateInfo ? client.nickname : '***'}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {client.grossProfit}
                    </Badge>
                  </div>
                ))}
                {analytics.actionMatrix.monitor.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{analytics.actionMatrix.monitor.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getInsightData()?.title}</DialogTitle>
            <DialogDescription>
              {getInsightData()?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Recommended Action:</p>
              <p className="text-sm text-blue-700 mt-1">{getInsightData()?.action}</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Cash Position</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getInsightData()?.clients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link 
                        href={`/portfolio/v2/${client.policy_number}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {client.policy_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {showPrivateInfo ? client.nickname : '***'}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        parseFloat(client.grossProfit.replace('%', '')) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {client.grossProfit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span>${format2dp(client.cash)}</span>
                        <div className="text-xs text-muted-foreground">
                          {((client.cash / client.tiv) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        client.riskScore < 0.3 ? "secondary" :
                        client.riskScore <= 0.7 ? "default" : "destructive"
                      }>
                        {client.riskScore < 0.3 ? "Low" :
                         client.riskScore <= 0.7 ? "Medium" : "High"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/portfolio/v2/${client.policy_number}`}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}