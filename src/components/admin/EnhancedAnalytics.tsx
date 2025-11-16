import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link as LinkIcon, Eye, Pin, Folder, Download, Calendar, Globe, TrendingUp } from "lucide-react";
import { Link } from "@/hooks/useLinks";
import { Category } from "@/hooks/useCategories";
import { useAllAnalytics, useGeographicAnalytics, useDeviceAnalytics, useTimeBasedAnalytics } from "@/hooks/useAnalytics";
import { exportAnalyticsToCSV, exportLinksToCSV } from "@/lib/reportGenerator";
import { toast } from "sonner";

interface EnhancedAnalyticsProps {
  links: Link[];
  categories: Category[];
}

const EnhancedAnalytics = ({ links, categories }: EnhancedAnalyticsProps) => {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  
  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.is_active).length;
  const pinnedLinks = links.filter((l) => l.is_pinned).length;
  const totalClicks = links.reduce((sum, link) => sum + link.click_count, 0);
  const totalUpvotes = links.reduce((sum, link) => sum + (link.upvote_count || 0), 0);
  const totalDownvotes = links.reduce((sum, link) => sum + (link.downvote_count || 0), 0);

  const dateRangeMap = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "all": 365 * 10, // All time
  };

  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - dateRangeMap[dateRange]);
    return date;
  }, [dateRange]);

  const endDate = useMemo(() => new Date(), []);

  const selectedLink = selectedLinkId ? links.find(l => l.id === selectedLinkId) : null;
  
  const { data: allAnalytics } = useAllAnalytics(startDate, endDate);
  const { data: geographicAnalytics } = useGeographicAnalytics(
    selectedLinkId || links[0]?.id || "",
    startDate,
    endDate
  );
  const { data: deviceAnalytics } = useDeviceAnalytics(
    selectedLinkId || links[0]?.id || "",
    startDate,
    endDate
  );
  const { data: timeBasedAnalytics } = useTimeBasedAnalytics(
    selectedLinkId || links[0]?.id || "",
    startDate,
    endDate,
    "hour"
  );

  const topLinks = [...links]
    .sort((a, b) => b.click_count - a.click_count)
    .slice(0, 10);

  const linksByCategory = categories.map((cat) => ({
    category: cat,
    count: links.filter((l) => l.category_id === cat.id).length,
    clicks: links.filter((l) => l.category_id === cat.id).reduce((sum, l) => sum + l.click_count, 0),
  })).sort((a, b) => b.clicks - a.clicks);

  const handleExportCSV = () => {
    if (allAnalytics && links) {
      exportAnalyticsToCSV(allAnalytics, `analytics-${dateRange}-${Date.now()}.csv`);
      toast.success("Analytics exported as CSV");
    }
  };

  const handleExportLinksCSV = () => {
    exportLinksToCSV(links, categories, `links-export-${Date.now()}.csv`);
    toast.success("Links exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Date Range:</span>
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportLinksCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export Links
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <LinkIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLinks}</div>
            <p className="text-xs text-muted-foreground">{activeLinks} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {allAnalytics?.length || 0} tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUpvotes > 0 ? `+${totalUpvotes}` : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalUpvotes} upvotes, {totalDownvotes} downvotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Folder className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Links */}
        <Card>
          <CardHeader>
            <CardTitle>Top Links by Clicks</CardTitle>
            <CardDescription>Most clicked links in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {topLinks.map((link, index) => (
                <div 
                  key={link.id} 
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                    selectedLinkId === link.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedLinkId(link.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className="truncate">{link.title}</span>
                  </div>
                  <span className="font-semibold">{link.click_count.toLocaleString()}</span>
                </div>
              ))}
              {topLinks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No clicks yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Links by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Clicks by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {linksByCategory.map(({ category, count, clicks }) => (
                <div key={category.id} className="flex items-center justify-between p-2 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: category.color || "hsl(var(--primary))" }}
                    >
                      {category.icon_name || "📁"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{category.name}</span>
                      <p className="text-xs text-muted-foreground">{count} links</p>
                    </div>
                  </div>
                  <span className="font-semibold">{clicks.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Analytics */}
        {geographicAnalytics && geographicAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Top countries by clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {geographicAnalytics.slice(0, 10).map((geo, index) => (
                  <div key={`${geo.country}-${geo.region}`} className="flex items-center justify-between p-2 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">
                          {geo.country || "Unknown"}
                        </span>
                        {geo.region && (
                          <p className="text-xs text-muted-foreground">{geo.region}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold">{geo.clicks.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Device Analytics */}
        {deviceAnalytics && deviceAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Devices, browsers, and OS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="text-sm font-medium mb-2">Devices</h4>
                  <div className="space-y-2">
                    {deviceAnalytics
                      .reduce((acc: any[], item) => {
                        const existing = acc.find(a => a.device_type === item.device_type);
                        if (existing) {
                          existing.clicks += item.clicks;
                        } else {
                          acc.push({ device_type: item.device_type, clicks: item.clicks });
                        }
                        return acc;
                      }, [])
                      .sort((a, b) => b.clicks - a.clicks)
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.device_type} className="flex items-center justify-between">
                          <span className="text-sm">{item.device_type || "Unknown"}</span>
                          <span className="font-semibold">{item.clicks.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Browsers</h4>
                  <div className="space-y-2">
                    {deviceAnalytics
                      .reduce((acc: any[], item) => {
                        const existing = acc.find(a => a.browser === item.browser);
                        if (existing) {
                          existing.clicks += item.clicks;
                        } else {
                          acc.push({ browser: item.browser, clicks: item.clicks });
                        }
                        return acc;
                      }, [])
                      .sort((a, b) => b.clicks - a.clicks)
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.browser} className="flex items-center justify-between">
                          <span className="text-sm">{item.browser || "Unknown"}</span>
                          <span className="font-semibold">{item.clicks.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time-based Analytics */}
        {timeBasedAnalytics && timeBasedAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Best Time to Post</CardTitle>
              <CardDescription>Peak hours by clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {timeBasedAnalytics
                  .sort((a, b) => b.clicks - a.clicks)
                  .slice(0, 10)
                  .map((item) => (
                    <div key={item.time_period} className="flex items-center justify-between p-2 rounded-lg">
                      <span className="text-sm font-medium">{item.time_period}</span>
                      <span className="font-semibold">{item.clicks.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedAnalytics;

