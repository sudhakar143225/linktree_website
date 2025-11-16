import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Search, X, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks/useTags";
import { useAllLinks } from "@/hooks/useLinks";
import { useCategories } from "@/hooks/useCategories";
import LinkCard from "@/components/LinkCard";
import { supabase } from "@/integrations/supabase/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: allTags } = useTags();
  const { data: links, isLoading } = useAllLinks();
  const { data: categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [tagLinks, setTagLinks] = useState<any[]>([]);
  const [loadingTagLinks, setLoadingTagLinks] = useState(true);

  const tag = allTags?.find((t) => t.slug === slug);

  // Fetch links for this tag
  useEffect(() => {
    const fetchTagLinks = async () => {
      if (!tag?.id || !links) {
        setTagLinks([]);
        setLoadingTagLinks(false);
        return;
      }

      setLoadingTagLinks(true);
      try {
        // Fetch link_tags for this tag
        const { data: linkTags, error } = await supabase
          .from("link_tags")
          .select("link_id")
          .eq("tag_id", tag.id);

        if (error) {
          console.error("Error fetching tag links:", error);
          setTagLinks([]);
          return;
        }

        const linkIds = (linkTags || []).map((lt: { link_id: string }) => lt.link_id);
        const filteredLinks = links.filter((link) => linkIds.includes(link.id));
        setTagLinks(filteredLinks);
      } catch (error) {
        console.error("Error fetching tag links:", error);
        setTagLinks([]);
      } finally {
        setLoadingTagLinks(false);
      }
    };

    fetchTagLinks();
  }, [tag?.id, links]);

  // Filter by search query
  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return tagLinks;
    const query = searchQuery.toLowerCase();
    return tagLinks.filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        link.description?.toLowerCase().includes(query) ||
        link.category?.name.toLowerCase().includes(query)
    );
  }, [tagLinks, searchQuery]);

  const handleLinkClick = async (linkId: string) => {
    const { error } = await supabase.rpc("increment_click_count" as any, {
      link_id: linkId,
    });
    if (error) console.error("Failed to track click:", error);
  };

  if (isLoading || loadingTagLinks) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Tag not found</p>
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
          background: tag.color
            ? `radial-gradient(ellipse at top, ${tag.color}40, transparent 70%)`
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
              <BreadcrumbPage>{tag.name}</BreadcrumbPage>
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
          </div>

          <div
            className="mb-4 p-6 rounded-2xl border"
            style={{
              background: tag.color ? `${tag.color}10` : "hsl(var(--card))",
              borderColor: tag.color || "hsl(var(--border))",
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                style={{
                  backgroundColor: tag.color || "hsl(var(--primary))",
                }}
              >
                <TagIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{tag.name}</h1>
                <p className="text-muted-foreground">
                  {tagLinks.length}{" "}
                  {tagLinks.length === 1 ? "link" : "links"}
                  {tag.usage_count > 0 && (
                    <span className="ml-2">
                      • {tag.usage_count} total uses
                    </span>
                  )}
                </p>
                {tag.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {tag.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search links in this tag..."
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
        </div>

        {/* Content */}
        <div className="space-y-2">
          {filteredLinks.length > 0 ? (
            filteredLinks
              .sort((a, b) => {
                // Sort by pinned first, then click count, then created date
                if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                if (a.click_count !== b.click_count)
                  return b.click_count - a.click_count;
                return (
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
                );
              })
              .map((link, index) => {
                const linkCategory = categories?.find((c) => c.id === link.category_id);
                return (
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
                      icon={
                        link.icon_name ? (
                          <span className="text-xl">{link.icon_name}</span>
                        ) : undefined
                      }
                      link={link}
                      categoryColor={linkCategory?.color}
                    />
                  </div>
                );
              })
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">
                {searchQuery
                  ? `No links found matching "${searchQuery}"`
                  : "No links available for this tag yet"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
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

export default TagPage;

