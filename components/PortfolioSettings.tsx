"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Settings,
  Eye,
  EyeOff,
  Palette,
  Monitor,
  Sun,
  Moon,
  Bell,
  Shield,
  Download,
  RefreshCw,
  HelpCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";

interface SettingsProps {
  showPrivateInfo: boolean;
  onPrivacyToggle: (show: boolean) => void;
  preferences?: any;
}

export default function PortfolioSettings({ 
  showPrivateInfo, 
  onPrivacyToggle,
  preferences 
}: SettingsProps) {
  const [localSettings, setLocalSettings] = useState({
    theme: "light",
    autoRefresh: true,
    refreshInterval: 5,
    notifications: true,
    compactView: false,
    showTooltips: true,
    defaultTab: "overview",
    rowsPerPage: 10,
    currency: "SGD",
    decimalPlaces: 2,
    showPercentages: true,
    highlightChanges: true,
    exportFormat: "excel",
    chartType: "line",
    animationsEnabled: true,
  });

  const updateSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Portfolio Settings
          </SheetTitle>
          <SheetDescription>
            Customize your dashboard experience and privacy preferences
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Privacy & Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Privacy & Security</h3>
            </div>
            
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showPrivateInfo ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <Label htmlFor="privacy-toggle" className="font-medium">
                        Show Private Information
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Display client names and sensitive data
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="privacy-toggle"
                    checked={showPrivateInfo}
                    onCheckedChange={onPrivacyToggle}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto-lock Timer</Label>
                    <p className="text-xs text-muted-foreground">
                      Auto-hide private info after inactivity
                    </p>
                  </div>
                  <Select defaultValue="15">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 min</SelectItem>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Audit Trail</Label>
                    <p className="text-xs text-muted-foreground">
                      Log access to sensitive data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Display Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Display</h3>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Theme</Label>
                    <p className="text-xs text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                  <Select value={localSettings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          Auto
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Compact View</Label>
                    <p className="text-xs text-muted-foreground">
                      Reduce spacing and padding
                    </p>
                  </div>
                  <Switch 
                    checked={localSettings.compactView}
                    onCheckedChange={(checked) => updateSetting('compactView', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Show Tooltips</Label>
                    <p className="text-xs text-muted-foreground">
                      Display helpful explanations
                    </p>
                  </div>
                  <Switch 
                    checked={localSettings.showTooltips}
                    onCheckedChange={(checked) => updateSetting('showTooltips', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Animations</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable smooth transitions
                    </p>
                  </div>
                  <Switch 
                    checked={localSettings.animationsEnabled}
                    onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data & Formatting */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Data & Formatting</h3>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Currency Display</Label>
                    <p className="text-xs text-muted-foreground">
                      Default currency for values
                    </p>
                  </div>
                  <Select value={localSettings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SGD">SGD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Decimal Places</Label>
                    <Badge variant="outline">{localSettings.decimalPlaces}</Badge>
                  </div>
                  <Slider
                    value={[localSettings.decimalPlaces]}
                    onValueChange={([value]) => updateSetting('decimalPlaces', value)}
                    max={4}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Show Percentages</Label>
                    <p className="text-xs text-muted-foreground">
                      Display performance as %
                    </p>
                  </div>
                  <Switch 
                    checked={localSettings.showPercentages}
                    onCheckedChange={(checked) => updateSetting('showPercentages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Highlight Changes</Label>
                    <p className="text-xs text-muted-foreground">
                      Color-code value changes
                    </p>
                  </div>
                  <Switch 
                    checked={localSettings.highlightChanges}
                    onCheckedChange={(checked) => updateSetting('highlightChanges', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications & Updates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto Refresh</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically update data
                    </p>
                  </div>
                  <Switch 
                    checked={localSettings.autoRefresh}
                    onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
                  />
                </div>

                {localSettings.autoRefresh && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Refresh Interval</Label>
                      <Badge variant="outline">{localSettings.refreshInterval} min</Badge>
                    </div>
                    <Slider
                      value={[localSettings.refreshInterval]}
                      onValueChange={([value]) => updateSetting('refreshInterval', value)}
                      max={60}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Alert for significant changes
                    </p>
                  </div>
                  <Switch 
                    checked={localSettings.notifications}
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Performance</h3>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Default Tab</Label>
                    <p className="text-xs text-muted-foreground">
                      Starting view on load
                    </p>
                  </div>
                  <Select value={localSettings.defaultTab} onValueChange={(value) => updateSetting('defaultTab', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="clients">Clients</SelectItem>
                      <SelectItem value="insights">Insights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Rows per Page</Label>
                    <p className="text-xs text-muted-foreground">
                      Table pagination size
                    </p>
                  </div>
                  <Select value={localSettings.rowsPerPage.toString()} onValueChange={(value) => updateSetting('rowsPerPage', parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Chart Type</Label>
                    <p className="text-xs text-muted-foreground">
                      Preferred chart display
                    </p>
                  </div>
                  <Select value={localSettings.chartType} onValueChange={(value) => updateSetting('chartType', value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export & Backup */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold">Export & Backup</h3>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Export Format</Label>
                    <p className="text-xs text-muted-foreground">
                      Default export file type
                    </p>
                  </div>
                  <Select value={localSettings.exportFormat} onValueChange={(value) => updateSetting('exportFormat', value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Current View
                  </Button>
                  <Button className="w-full" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Backup Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <Filter className="w-4 h-4 mr-2" />
                Reset Filters
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <PieChart className="w-4 h-4 mr-2" />
                Reset Layout
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <HelpCircle className="w-4 h-4 mr-2" />
                Show Help
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}