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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  ExternalLink,
  Calendar,
  DollarSign,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  CreditCard,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { format2dp } from "@/utils/formatters";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import moment from "moment";
import { newClient, updateClient, deleteClient } from "@/app/clients/action";
import { useRouter } from "next/navigation";

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
  policy_link?: string;
}

interface Props {
  clients: Client[];
  showPrivateInfo: boolean;
  onRefresh: () => void;
}

const formSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters"),
  policy_number: z
    .string()
    .min(5, "Policy number must be at least 5 characters"),
  policy_link: z.string().url("Must be a valid URL").or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export default function ClientManagement({
  clients,
  showPrivateInfo,
  onRefresh,
}: Props) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Client>("tiv");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "action-required" | "healthy"
  >("all");
  const [showRenewalAlerts, setShowRenewalAlerts] = useState(true);

  const router = useRouter();

  // Forms
  const addForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      policy_number: "",
      policy_link: "",
    },
  });

  const editForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      policy_number: "",
      policy_link: "",
    },
  });

  // Enhanced client analysis
  const clientAnalysis = useMemo(() => {
    const now = moment();

    const analysisData = clients.map((client) => {
      const commencementMoment = moment(client.commencementDate);
      const monthsSinceCommencement = now.diff(commencementMoment, "months");
      const nextRenewalMonth = Math.ceil(monthsSinceCommencement / 12) * 12;
      const nextRenewalDate = commencementMoment
        .clone()
        .add(nextRenewalMonth, "months");
      const monthsToRenewal = nextRenewalDate.diff(now, "months");

      // Determine if cash reserves will be needed soon
      const willNeedCashSoon = monthsToRenewal <= 3 && monthsToRenewal >= 0;
      const performance = parseFloat(client.grossProfit.replace("%", ""));

      // Status calculation
      let status: "healthy" | "warning" | "critical" = "healthy";
      const issues: string[] = [];

      if (client.cash > client.tiv * 0.1) {
        status = "warning";
        issues.push("High cash allocation");
      }

      if (performance < -5) {
        status = "critical";
        issues.push("Poor performance");
      } else if (performance < 2) {
        status = "warning";
        issues.push("Below average performance");
      }

      if (willNeedCashSoon && client.cash < 5000) {
        status = "warning";
        issues.push("May need cash reserves soon");
      }

      if (client.duration > 5 && client.xirr === "N/A") {
        status = "warning";
        issues.push("Missing performance data");
      }

      return {
        ...client,
        monthsToRenewal,
        nextRenewalDate: nextRenewalDate.format("YYYY-MM-DD"),
        willNeedCashSoon,
        status,
        issues,
        performance,
        urgencyScore:
          (status === "critical" ? 3 : status === "warning" ? 2 : 1) +
          (willNeedCashSoon ? 2 : 0) +
          (client.cash > client.tiv * 0.15 ? 1 : 0),
      };
    });

    // Sort by urgency by default, then by selected field
    return analysisData.sort((a, b) => {
      // @ts-ignore
      if (sortField === "urgencyScore") {
        return sortOrder === "desc"
          ? b.urgencyScore - a.urgencyScore
          : a.urgencyScore - b.urgencyScore;
      }

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
  }, [clients, sortField, sortOrder]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clientAnalysis.filter((client) => {
      const matchesSearch =
        client.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.policy_number.includes(searchTerm) ||
        client.productName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "action-required" &&
          (client.status === "warning" || client.status === "critical")) ||
        (statusFilter === "healthy" && client.status === "healthy");

      return matchesSearch && matchesStatus;
    });
  }, [clientAnalysis, searchTerm, statusFilter]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalClients = clientAnalysis.length;
    const criticalClients = clientAnalysis.filter(
      (c) => c.status === "critical"
    ).length;
    const warningClients = clientAnalysis.filter(
      (c) => c.status === "warning"
    ).length;
    const cashReserveClients = clientAnalysis.filter((c) => c.cash > 0).length;
    const renewalSoonClients = clientAnalysis.filter(
      (c) => c.willNeedCashSoon
    ).length;
    const totalCashReserves = clientAnalysis.reduce(
      (sum, c) => sum + c.cash,
      0
    );
    const averagePerformance =
      clientAnalysis.reduce((sum, c) => sum + c.performance, 0) / totalClients;

    return {
      totalClients,
      criticalClients,
      warningClients,
      cashReserveClients,
      renewalSoonClients,
      totalCashReserves,
      averagePerformance: isNaN(averagePerformance) ? 0 : averagePerformance,
    };
  }, [clientAnalysis]);

  const handleSort = (field: keyof Client | "urgencyScore") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field as keyof Client);
      setSortOrder("desc");
    }
  };

  const handleAddClient = async (data: FormData) => {
    try {
      await newClient(data);
      addForm.reset();
      setIsAddDialogOpen(false);
      onRefresh();
      router.refresh();
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const handleEditClient = async (data: FormData) => {
    if (!selectedClient) return;

    try {
      await updateClient({
        id: selectedClient.id,
        ...data,
      });
      editForm.reset();
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      onRefresh();
      router.refresh();
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      await deleteClient(selectedClient.policy_number);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      onRefresh();
      router.refresh();
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    editForm.reset({
      nickname: client.nickname,
      policy_number: client.policy_number,
      policy_link: client.policy_link || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Management Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {summaryStats.totalClients}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {summaryStats.averagePerformance.toFixed(1)}% avg performance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-800">
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {summaryStats.criticalClients + summaryStats.warningClients}
            </div>
            <p className="text-xs text-red-700 mt-1">
              {summaryStats.criticalClients} critical,{" "}
              {summaryStats.warningClients} warning
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800">
              Renewal Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {summaryStats.renewalSoonClients}
            </div>
            <p className="text-xs text-orange-700 mt-1">Next 3 months</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800">
              Cash Reserves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ${format2dp(summaryStats.totalCashReserves)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              {summaryStats.cashReserveClients} policies with cash
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                Comprehensive policy management with renewal tracking and
                performance monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onRefresh();
                  router.refresh();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <Form {...addForm}>
                    <form
                      onSubmit={addForm.handleSubmit(handleAddClient)}
                      className="space-y-4"
                    >
                      <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>
                          Add a new policy to track and manage
                        </DialogDescription>
                      </DialogHeader>

                      <FormField
                        control={addForm.control}
                        name="policy_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Policy Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addForm.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Nickname</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addForm.control}
                        name="policy_link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Policy Link (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://fpms.greateasternlife.com/..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit">Add Client</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search clients by name, policy number, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm">
                Status:
              </Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Clients</option>
                <option value="action-required">Action Required</option>
                <option value="healthy">Healthy</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="renewal-alerts"
                checked={showRenewalAlerts}
                onCheckedChange={setShowRenewalAlerts}
              />
              <Label htmlFor="renewal-alerts" className="text-sm">
                Renewal Alerts
              </Label>
            </div>
          </div>

          {/* Client Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("urgencyScore")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("policy_number")}
                  >
                    Policy Details
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("tiv")}
                  >
                    Portfolio Value
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("cash")}
                  >
                    Cash Position
                  </TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Renewal Info</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {client.status === "critical" && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          {client.status === "warning" && (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          )}
                          {client.status === "healthy" && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <Badge
                            variant={
                              client.status === "critical"
                                ? "destructive"
                                : client.status === "warning"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {client.status}
                          </Badge>
                        </div>
                        {client.issues.length > 0 && (
                          <div className="text-xs text-muted-foreground max-w-32">
                            {client.issues.join(", ")}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/portfolio/v2/${client.policy_number}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {client.policy_number}
                          </Link>
                          {client.policy_link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => window.open(client.policy_link)}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <div className="text-sm">
                          {showPrivateInfo ? client.nickname : "***"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-40">
                          {client.productName}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          ${format2dp(client.tiv)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Invested: ${format2dp(client.tia)}
                        </div>
                        {client.totalDividendsPaidout > 0 && (
                          <div className="text-xs text-green-600">
                            Dividends: $
                            {format2dp(client.totalDividendsPaidout)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            ${format2dp(client.cash)}
                          </span>
                          {client.cash > client.tiv * 0.1 && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        {client.cash > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {((client.cash / client.tiv) * 100).toFixed(1)}% of
                            portfolio
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              client.performance > 0
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {client.grossProfit}
                          </span>
                          {client.performance > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {client.xirr !== "N/A" && (
                          <div className="text-xs text-muted-foreground">
                            XIRR: {client.xirr}
                          </div>
                        )}
                        <Badge
                          variant={
                            client.riskScore < 0.3
                              ? "secondary"
                              : client.riskScore <= 0.7
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {client.riskScore < 0.3
                            ? "Low Risk"
                            : client.riskScore <= 0.7
                            ? "Med Risk"
                            : "High Risk"}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {moment(client.nextRenewalDate).format("MMM YYYY")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {client.monthsToRenewal > 0
                            ? `${client.monthsToRenewal} months`
                            : "Overdue"}
                        </div>
                        {client.willNeedCashSoon && (
                          <Badge variant="default" className="text-xs">
                            Cash Soon
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/portfolio/v2/${client.policy_number}`}
                            >
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(client)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(client)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No clients found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditClient)}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
                <DialogDescription>Update client information</DialogDescription>
              </DialogHeader>

              <FormField
                control={editForm.control}
                name="policy_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Nickname</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="policy_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Link</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Update Client</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedClient?.nickname}? This
              action cannot be undone and will remove all tracking for policy{" "}
              {selectedClient?.policy_number}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
