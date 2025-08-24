"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  AlertTriangle,
  Eye,
  EyeOff,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  Target,
  Calendar,
  Banknote,
  Wallet,
  Shield,
  ChevronDown,
  ArrowUpDown,
  Search,
  Settings,
} from "lucide-react";
import { format2dp } from "@/utils/formatters";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Pie,
} from "recharts";
import AdvancedPortfolioInsights from "./AdvancedPortfolioInsights";
import EnhancedFilters from "./EnhancedFilters";
import PortfolioSettings from "./PortfolioSettings";
import ClientManagement from "./ClientManagement";
import InteractivePortfolioAnalytics from "./InteractivePortfolioAnalytics";

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

interface AggregatedData {
  totalPremium: number;
  totalAum: number;
  totalCash: number;
  totalDividends: number;
  totalRoi: string;
  averageRiskScore: number;
  clientCount: number;
}

interface Props {
  clients: Client[];
  aggregatedData: AggregatedData;
  preferences: any;
  dailyPrices: any;
  onRefresh?: () => void;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

export default function PortfolioDashboard({
  clients,
  aggregatedData,
  preferences,
  dailyPrices,
  onRefresh = () => {},
}: Props) {
  const [filters, setFilters] = useState({
    search: "",
    riskLevel: "all",
    performance: "all",
    cashReserve: "all",
    duration: "all",
    productType: "all",
    aumRange: [0, 1000000] as [number, number],
    performanceRange: [-50, 100] as [number, number],
    showAdvanced: false,
  });

  const [sortField, setSortField] = useState<keyof Client>("tiv");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showPrivateInfo, setShowPrivateInfo] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Filtered and sorted clients
  const filteredClients = useMemo(() => {
    return clients
      .filter((client) => {
        const matchesSearch =
          client.nickname
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          client.policy_number.includes(filters.search) ||
          client.productName
            .toLowerCase()
            .includes(filters.search.toLowerCase());

        const matchesRisk =
          filters.riskLevel === "all" ||
          (filters.riskLevel === "low" && client.riskScore < 0.3) ||
          (filters.riskLevel === "medium" &&
            client.riskScore >= 0.3 &&
            client.riskScore <= 0.7) ||
          (filters.riskLevel === "high" && client.riskScore > 0.7);

        const matchesProduct =
          filters.productType === "all" ||
          client.productName.includes(filters.productType);

        const matchesCash =
          filters.cashReserve === "all" ||
          (filters.cashReserve === "with-cash" && client.cash > 0) ||
          (filters.cashReserve === "no-cash" && client.cash === 0);

        const clientPerformance = parseFloat(
          client.grossProfit.replace("%", "")
        );
        const matchesPerformance =
          filters.performance === "all" ||
          (filters.performance === "positive" && clientPerformance > 0) ||
          (filters.performance === "negative" && clientPerformance <= 0);

        const matchesDuration =
          filters.duration === "all" ||
          (filters.duration === "new" && client.duration < 1) ||
          (filters.duration === "young" &&
            client.duration >= 1 &&
            client.duration < 3) ||
          (filters.duration === "mature" && client.duration >= 3);

        const matchesAUM =
          client.tiv >= filters.aumRange[0] &&
          client.tiv <= filters.aumRange[1];
        const matchesPerformanceRange =
          clientPerformance >= filters.performanceRange[0] &&
          clientPerformance <= filters.performanceRange[1];

        return (
          matchesSearch &&
          matchesRisk &&
          matchesProduct &&
          matchesCash &&
          matchesPerformance &&
          matchesDuration &&
          matchesAUM &&
          matchesPerformanceRange
        );
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortOrder === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
  }, [clients, filters, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalValue = filteredClients.reduce(
      (sum, client) => sum + client.tiv,
      0
    );
    const totalInvested = filteredClients.reduce(
      (sum, client) => sum + client.tia,
      0
    );
    const totalCashReserve = filteredClients.reduce(
      (sum, client) => sum + client.cash,
      0
    );

    const topPerformers = [...filteredClients]
      .sort(
        (a, b) =>
          parseFloat(b.grossProfit.replace("%", "")) -
          parseFloat(a.grossProfit.replace("%", ""))
      )
      .slice(0, 5);

    const cashReserveClients = filteredClients.filter(
      (client) => client.cash > 0
    );

    const riskDistribution = {
      low: filteredClients.filter((c) => c.riskScore < 0.3).length,
      medium: filteredClients.filter(
        (c) => c.riskScore >= 0.3 && c.riskScore <= 0.7
      ).length,
      high: filteredClients.filter((c) => c.riskScore > 0.7).length,
    };

    // Fund allocation across all clients
    const fundAllocation: { [key: string]: number } = {};
    filteredClients.forEach((client) => {
      client.fundAllocations.forEach((fund) => {
        const fundType =
          fund.name.split(":")[1]?.trim().split(" ")[0] || "Other";
        fundAllocation[fundType] = (fundAllocation[fundType] || 0) + fund.value;
      });
    });

    const fundAllocationData = Object.entries(fundAllocation)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return {
      totalValue,
      totalInvested,
      totalCashReserve,
      topPerformers,
      cashReserveClients,
      riskDistribution,
      fundAllocationData,
      averagePerformance:
        totalInvested > 0
          ? ((totalValue - totalInvested) / totalInvested) * 100
          : 0,
    };
  }, [filteredClients]);

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive view of {aggregatedData.clientCount} investment
            policies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="privacy-mode"
              checked={showPrivateInfo}
              onCheckedChange={setShowPrivateInfo}
            />
            <Label htmlFor="privacy-mode" className="text-sm">
              {showPrivateInfo ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Label>
          </div>
          <PortfolioSettings
            showPrivateInfo={showPrivateInfo}
            onPrivacyToggle={setShowPrivateInfo}
            preferences={preferences}
          />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
            <DollarSign className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${format2dp(aggregatedData.totalAum)}
            </div>
            <p className="text-xs opacity-70">
              +{aggregatedData.totalRoi} overall return
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Reserves</CardTitle>
            <Wallet className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${format2dp(aggregatedData.totalCash)}
            </div>
            <p className="text-xs opacity-70">
              {analytics.cashReserveClients.length} policies with cash
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Risk Score
            </CardTitle>
            <Target className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(aggregatedData.averageRiskScore * 100)}%
            </div>
            <p className="text-xs opacity-70">Portfolio risk level</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Dividends
            </CardTitle>
            <Banknote className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${format2dp(aggregatedData.totalDividends)}
            </div>
            <p className="text-xs opacity-70">Lifetime dividend income</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full lg:w-fit grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="clients">Management</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.topPerformers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="nickname"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [
                          `$${format2dp(value)}`,
                          "Value",
                        ]}
                        labelFormatter={(label) => `Client: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="tiv"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="tia"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={
                          (analytics.riskDistribution.low /
                            filteredClients.length) *
                          100
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {analytics.riskDistribution.low}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={
                          (analytics.riskDistribution.medium /
                            filteredClients.length) *
                          100
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {analytics.riskDistribution.medium}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={
                          (analytics.riskDistribution.high /
                            filteredClients.length) *
                          100
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {analytics.riskDistribution.high}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Reserves Alert */}
          {analytics.cashReserveClients.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  Cash Reserves Alert
                </CardTitle>
                <CardDescription className="text-orange-600">
                  {analytics.cashReserveClients.length} clients have cash
                  reserves totaling ${format2dp(analytics.totalCashReserve)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.cashReserveClients.slice(0, 10).map((client) => (
                    <Badge
                      key={client.id}
                      variant="outline"
                      className="text-orange-800 border-orange-300"
                    >
                      {showPrivateInfo ? client.nickname : "***"}: $
                      {format2dp(client.cash)}
                    </Badge>
                  ))}
                  {analytics.cashReserveClients.length > 10 && (
                    <Badge variant="secondary">
                      +{analytics.cashReserveClients.length - 10} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <InteractivePortfolioAnalytics
            clients={filteredClients}
            showPrivateInfo={showPrivateInfo}
            aggregatedData={aggregatedData}
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <ClientManagement 
            clients={clients}
            showPrivateInfo={showPrivateInfo}
            onRefresh={onRefresh}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AdvancedPortfolioInsights
            clients={filteredClients}
            showPrivateInfo={showPrivateInfo}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
