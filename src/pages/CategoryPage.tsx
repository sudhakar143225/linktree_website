import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pin, Share2, Search, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLinks } from "@/hooks/useLinks";
import { useCategories } from "@/hooks/useCategories";
import LinkCard from "@/components/LinkCard";
import SubcategoryNav from "@/components/SubcategoryNav";
import { supabase } from "@/integrations/supabase/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: links, isLoading } = useLinks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const category = categories?.find((c) => c.slug === slug);
  const isTimeBased = slug === "this-week" || slug === "this-month";

  // Get subcategories from category if available
  const availableSubcategories = useMemo(() => {
    if (!category?.subcategories) return [];
    return category.subcategories.split(',').map(s => s.trim()).filter(Boolean);
  }, [category]);

  // Show subcategory navigation if category has subcategories (especially for time-based categories)
  const showSubcategoryNav = availableSubcategories.length > 0;

  let categoryLinks = links?.filter((link) => link.category?.slug === slug) || [];

  // Filter by selected subcategory
  if (selectedSubcategory) {
    categoryLinks = categoryLinks.filter((link) => link.subcategory === selectedSubcategory);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    categoryLinks = categoryLinks.filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        link.description?.toLowerCase().includes(query) ||
        link.subcategory?.toLowerCase().includes(query)
    );
  }

  // Separate pinned and regular links (after all filters are applied)
  const pinnedLinks = categoryLinks.filter((link) => link.is_pinned);
  const regularLinks = categoryLinks.filter((link) => !link.is_pinned);

  const handleLinkClick = async (linkId: string) => {
    const { error } = await supabase.rpc("increment_click_count" as any, {
      link_id: linkId,
    });
    if (error) console.error("Failed to track click:", error);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${category?.name} - Updates Loop`,
        text: `Check out ${category?.name} resources!`,
        url: url,
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      // You could show a toast here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Category not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div 
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          background: category?.color 
            ? `radial-gradient(ellipse at top, ${category.color}40, transparent 70%)`
            : "radial-gradient(ellipse at top, hsl(var(--primary) / 0.2), transparent 70%)",
        }}
      />
      
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
                <Home className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="-ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              {(navigator.share || navigator.clipboard) && (
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>

          <div className="mb-4 p-6 rounded-2xl border" style={{
            background: category.color ? `${category.color}10` : "hsl(var(--card))",
            borderColor: category.color || "hsl(var(--border))",
          }}>
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                style={{ backgroundColor: category.color || "hsl(var(--primary))" }}
              >
                {category.icon_name || "📁"}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{category.name}</h1>
                <p className="text-muted-foreground">
                  {links?.filter((link) => link.category?.slug === slug).length || 0} {links?.filter((link) => link.category?.slug === slug).length === 1 ? "link" : "links"}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search links in this category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Subcategory Navigation - Show for time-based categories or any category with subcategories */}
          {showSubcategoryNav && (
            <SubcategoryNav
              subcategories={availableSubcategories}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={setSelectedSubcategory}
              categoryColor={category.color}
            />
          )}
        </div>

        {/* Pinned Links */}
        {pinnedLinks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Pin className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold">Pinned</h2>
            </div>
                <div className="space-y-2">
                  {pinnedLinks
                    .sort((a, b) => b.click_count - a.click_count)
                    .map((link, index) => (
                      <div 
                        key={link.id} 
                        onClick={() => handleLinkClick(link.id)}
                        style={{
                          animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                        }}
                      >
                        <LinkCard
                          title={link.title}
                          description={link.description || ""}
                          url={link.url}
                          icon={link.icon_name ? <span className="text-xl">{link.icon_name}</span> : undefined}
                          link={link}
                          categoryColor={category.color}
                        />
                      </div>
                    ))}
                </div>
          </div>
        )}

        {/* Content - Exclude pinned links (they're shown in Pinned section above) */}
        <div className="space-y-2">
          {regularLinks
            .sort((a, b) => {
              // Sort by popular links first, then by order
              if (a.click_count !== b.click_count) return b.click_count - a.click_count;
              return a.order_position - b.order_position;
            })
            .map((link, index) => (
              <div 
                key={link.id} 
                onClick={() => handleLinkClick(link.id)}
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                }}
              >
                <LinkCard
                  title={link.title}
                  description={link.description || ""}
                  url={link.url}
                  icon={link.icon_name ? <span className="text-xl">{link.icon_name}</span> : undefined}
                  link={link}
                  categoryColor={category.color}
                />
              </div>
            ))}
          {regularLinks.length === 0 && pinnedLinks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">
                {searchQuery 
                  ? `No links found matching "${searchQuery}"`
                  : selectedSubcategory
                  ? `No links in "${selectedSubcategory}" subcategory yet`
                  : "No links available yet"}
              </p>
              {(searchQuery || selectedSubcategory) && (
                <div className="flex gap-2 justify-center">
                  {searchQuery && (
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  )}
                  {selectedSubcategory && (
                    <Button variant="outline" size="sm" onClick={() => setSelectedSubcategory(null)}>
                      Show All
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;
