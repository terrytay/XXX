"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Shield,
  Target,
  SlidersHorizontal,
} from "lucide-react";

interface FilterState {
  search: string;
  riskLevel: string;
  performance: string;
  cashReserve: string;
  duration: string;
  productType: string;
  aumRange: [number, number];
  performanceRange: [number, number];
  showAdvanced: boolean;
}

interface Props {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  clients: any[];
  activeFiltersCount: number;
}

export default function EnhancedFilters({ filters, onFiltersChange, clients, activeFiltersCount }: Props) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      riskLevel: "all",
      performance: "all",
      cashReserve: "all",
      duration: "all",
      productType: "all",
      aumRange: [0, 1000000],
      performanceRange: [-50, 100],
      showAdvanced: false,
    });
  };

  const activeFiltersList = [
    filters.search && { key: 'search', label: `Search: "${filters.search}"`, value: filters.search },
    filters.riskLevel !== 'all' && { key: 'riskLevel', label: `Risk: ${filters.riskLevel}`, value: filters.riskLevel },
    filters.performance !== 'all' && { key: 'performance', label: `Performance: ${filters.performance}`, value: filters.performance },
    filters.cashReserve !== 'all' && { key: 'cashReserve', label: `Cash: ${filters.cashReserve}`, value: filters.cashReserve },
    filters.duration !== 'all' && { key: 'duration', label: `Duration: ${filters.duration}`, value: filters.duration },
    filters.productType !== 'all' && { key: 'productType', label: `Product: ${filters.productType}`, value: filters.productType },
  ].filter(Boolean);

  // Quick filter buttons
  const quickFilters = [
    {
      label: "High Performers",
      icon: TrendingUp,
      action: () => onFiltersChange({ performance: "positive", performanceRange: [10, 100] }),
      active: filters.performance === "positive",
    },
    {
      label: "Needs Review",
      icon: TrendingDown,
      action: () => onFiltersChange({ performance: "negative", performanceRange: [-50, 5] }),
      active: filters.performance === "negative",
    },
    {
      label: "Has Cash",
      icon: DollarSign,
      action: () => onFiltersChange({ cashReserve: "with-cash" }),
      active: filters.cashReserve === "with-cash",
    },
    {
      label: "High Risk",
      icon: Shield,
      action: () => onFiltersChange({ riskLevel: "high" }),
      active: filters.riskLevel === "high",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by client name, policy number, or product..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="pl-10 pr-4 h-10"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ search: "" })}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.label}
            variant={filter.active ? "default" : "outline"}
            size="sm"
            onClick={filter.action}
            className="h-8 text-xs"
          >
            <filter.icon className="w-3 h-3 mr-1" />
            {filter.label}
          </Button>
        ))}
        
        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <SlidersHorizontal className="w-3 h-3 mr-1" />
              Advanced
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Risk Level</Label>
                <Select value={filters.riskLevel} onValueChange={(value) => onFiltersChange({ riskLevel: value })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk (&lt;30%)</SelectItem>
                    <SelectItem value="medium">Medium Risk (30-70%)</SelectItem>
                    <SelectItem value="high">High Risk (&gt;70%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Performance</Label>
                <Select value={filters.performance} onValueChange={(value) => onFiltersChange({ performance: value })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Performance</SelectItem>
                    <SelectItem value="positive">Positive Returns</SelectItem>
                    <SelectItem value="negative">Negative Returns</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Cash Reserve Status</Label>
                <Select value={filters.cashReserve} onValueChange={(value) => onFiltersChange({ cashReserve: value })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="with-cash">With Cash Reserves</SelectItem>
                    <SelectItem value="no-cash">No Cash Reserves</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Policy Duration</Label>
                <Select value={filters.duration} onValueChange={(value) => onFiltersChange({ duration: value })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Duration</SelectItem>
                    <SelectItem value="new">New (&lt;1 year)</SelectItem>
                    <SelectItem value="young">Young (1-3 years)</SelectItem>
                    <SelectItem value="mature">Mature (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Product Type</Label>
                <Select value={filters.productType} onValueChange={(value) => onFiltersChange({ productType: value })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="Invest">Investment Plans</SelectItem>
                    <SelectItem value="Advantage">Advantage Plans</SelectItem>
                    <SelectItem value="Life">Life Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  AUM Range: ${filters.aumRange[0].toLocaleString()} - ${filters.aumRange[1].toLocaleString()}
                </Label>
                <Slider
                  value={filters.aumRange}
                  onValueChange={(value) => onFiltersChange({ aumRange: value as [number, number] })}
                  max={1000000}
                  min={0}
                  step={10000}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Performance Range: {filters.performanceRange[0]}% - {filters.performanceRange[1]}%
                </Label>
                <Slider
                  value={filters.performanceRange}
                  onValueChange={(value) => onFiltersChange({ performanceRange: value as [number, number] })}
                  max={100}
                  min={-50}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFiltersList.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="text-xs">
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({ [filter.key]: filter.key === 'search' ? '' : 'all' })}
                className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {clients.length} results
        {activeFiltersCount > 0 && (
          <span> • {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active</span>
        )}
      </div>
    </div>
  );
}