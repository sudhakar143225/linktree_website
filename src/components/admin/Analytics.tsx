import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon, Eye, Pin, Folder } from "lucide-react";
import { Link } from "@/hooks/useLinks";
import { Category } from "@/hooks/useCategories";

interface AnalyticsProps {
  links: Link[];
  categories: Category[];
}

const Analytics = ({ links, categories }: AnalyticsProps) => {
  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.is_active).length;
  const pinnedLinks = links.filter((l) => l.is_pinned).length;
  const totalClicks = links.reduce((sum, link) => sum + link.click_count, 0);

  const topLinks = [...links]
    .sort((a, b) => b.click_count - a.click_count)
    .slice(0, 5);

  const linksByCategory = categories.map((cat) => ({
    category: cat,
    count: links.filter((l) => l.category_id === cat.id).length,
  }));

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pinned Links</CardTitle>
            <Pin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pinnedLinks}</div>
            <p className="text-xs text-muted-foreground">Featured</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Top Links by Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLinks.map((link, index) => (
                <div key={link.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className="truncate">{link.title}</span>
                  </div>
                  <span className="font-semibold">{link.click_count}</span>
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

        <Card>
          <CardHeader>
            <CardTitle>Links by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {linksByCategory.map(({ category, count }) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: category.color || "hsl(var(--primary))" }}
                    >
                      {category.icon_name || "📁"}
                    </div>
                    <span>{category.name}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
