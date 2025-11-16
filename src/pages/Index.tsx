import { useState, useMemo } from "react";
import { Youtube, Linkedin, Twitter, Instagram, Search, X, Share2, Tag as TagIcon } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import AccessibilityControls from "@/components/AccessibilityControls";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLinks } from "@/hooks/useLinks";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import CategoryNav from "@/components/CategoryNav";
import LinkCard from "@/components/LinkCard";
import LinkCardSkeleton from "@/components/LinkCardSkeleton";
import { trackLinkClick } from "@/hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const socialLinks = [
  { icon: <Instagram className="w-5 h-5" />, url: "https://instagram.com/yourhandle", label: "Instagram" },
  { icon: <Twitter className="w-5 h-5" />, url: "https://twitter.com/yourhandle", label: "Twitter" },
  { icon: <Youtube className="w-5 h-5" />, url: "https://youtube.com/yourchannel", label: "YouTube" },
  { icon: <Linkedin className="w-5 h-5" />, url: "https://linkedin.com/in/yourprofile", label: "LinkedIn" },
];

const Index = () => {
  const navigate = useNavigate();
  const { data: links, isLoading: linksLoading } = useLinks();
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const [searchQuery, setSearchQuery] = useState("");
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);

  const handleLinkClick = async (linkId: string) => {
    // Track click in database and analytics
    await trackLinkClick(linkId);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Updates Loop",
        text: "Check out these amazing tech and AI resources!",
        url: window.location.href,
      }).catch(() => {});
    }
  };

  // Filter links by search query and include tag matches
  const filteredLinks = useMemo(() => {
    if (!links) return [];
    if (!searchQuery.trim()) return links;
    const query = searchQuery.toLowerCase();
    
    // Get matching tags
    const matchingTags = tags?.filter(
      (tag) =>
        tag.name.toLowerCase().includes(query) ||
        tag.description?.toLowerCase().includes(query)
    ) || [];
    
    // Get link IDs from matching tags
    const tagMatchedLinkIds = new Set<string>();
    if (matchingTags.length > 0 && links) {
      // We'll need to check which links have these tags
      // For now, filter links normally and we'll show tags separately
    }
    
    return links.filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        link.description?.toLowerCase().includes(query) ||
        link.category?.name.toLowerCase().includes(query)
    );
  }, [links, searchQuery, tags]);

  // Get matching tags for search query
  const matchingTags = useMemo(() => {
    if (!tags || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(query) ||
        tag.description?.toLowerCase().includes(query)
    ).slice(0, 5); // Show top 5 matching tags
  }, [tags, searchQuery]);

  // Group links by category - Show all categories even with 0 links
  const linksByCategory = useMemo(() => {
    if (!categories) return [];
    
    return categories
      .map((category) => {
        const categoryLinks = filteredLinks?.filter(
          (link) => link.category_id === category.id
        ) || [];
        return {
          category,
          links: categoryLinks,
        };
      });
      // Removed filter - show all categories even with 0 links
  }, [filteredLinks, categories]);

  // Only show featured links on home page
  const featuredLinks = useMemo(() => {
    return filteredLinks?.filter((link) => link.is_featured) || [];
  }, [filteredLinks]);

  const handleTagClick = (tagSlug: string) => {
    navigate(`/tag/${tagSlug}`);
    setTagsDropdownOpen(false);
  };

  return (
    <>
      <SEOHead 
        title="Updates Loop - Your Linktree"
        description="Your daily dose of tech news, AI breakthroughs, and innovation"
        image="/logo_instagram_page.png"
        siteName="Updates Loop"
      />
      <AccessibilityControls />
      <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -z-10" />
      
      <div className="container max-w-2xl mx-auto px-4 py-6 md:py-12">
        {/* Profile Section */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <Avatar className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-4 md:mb-6 ring-4 ring-primary/30 animate-glow">
            <AvatarImage src="/logo_instagram_page.png" alt="Updates Loop Logo" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-xl md:text-2xl text-primary-foreground">
              UL
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Updates Loop
          </h1>
          
          <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto leading-relaxed px-4">
            Your daily dose of tech news, AI breakthroughs, and innovation 🚀
          </p>
        </div>

        {/* Header Actions */}
        <div className="mb-4 md:mb-6 flex items-center justify-between gap-2">
          <div className="flex-1 max-w-md relative">
            <Popover 
              open={searchQuery.trim().length > 0 && (matchingTags.length > 0 || filteredLinks.length > 0)}
              onOpenChange={() => {}}
            >
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Search links..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSearchQuery("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </PopoverTrigger>
              {searchQuery.trim() && (matchingTags.length > 0 || filteredLinks.length > 0) && (
                <PopoverContent 
                  className="w-[var(--radix-popover-trigger-width)] p-0" 
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <ScrollArea className="max-h-[400px]">
                    {/* Matching Tags */}
                    {matchingTags.length > 0 && (
                      <div className="p-2 border-b">
                        <div className="flex items-center gap-2 mb-2 px-2">
                          <TagIcon className="w-4 h-4 text-primary" />
                          <h3 className="text-xs font-semibold text-muted-foreground">Matching Tags</h3>
                        </div>
                        <div className="space-y-1">
                          {matchingTags.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => {
                                handleTagClick(tag.slug);
                                setSearchQuery("");
                              }}
                              className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <TagIcon className="w-3 h-3 text-primary flex-shrink-0" />
                                {tag.color && (
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                )}
                                <span className="text-sm truncate">{tag.name}</span>
                              </div>
                              {tag.usage_count > 0 && (
                                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                  {tag.usage_count}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Links */}
                    {filteredLinks.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center gap-2 mb-2 px-2">
                          <Search className="w-4 h-4 text-primary" />
                          <h3 className="text-xs font-semibold text-muted-foreground">Matching Links ({filteredLinks.length})</h3>
                        </div>
                        <div className="space-y-1">
                          {filteredLinks.slice(0, 5).map((link) => {
                            const linkCategory = categories?.find((c) => c.id === link.category_id);
                            return (
                              <button
                                key={link.id}
                                onClick={() => {
                                  handleLinkClick(link.id);
                                  window.open(link.url, '_blank');
                                }}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {linkCategory?.color && (
                                    <div
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: linkCategory.color }}
                                    />
                                  )}
                                  <span className="text-sm font-medium truncate">{link.title}</span>
                                </div>
                                {link.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 truncate">
                                    {link.description}
                                  </p>
                                )}
                              </button>
                            );
                          })}
                          {filteredLinks.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center py-2 px-2">
                              + {filteredLinks.length - 5} more links below
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              )}
            </Popover>
          </div>
          <div className="flex gap-2">
            {/* Tags Button */}
            {tags && tags.length > 0 && (
              <Popover open={tagsDropdownOpen} onOpenChange={setTagsDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <TagIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden md:inline">Tags</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="end">
                  <div className="p-3 border-b">
                    <h3 className="font-semibold text-sm">All Tags</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click a tag to view related links
                    </p>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="p-3 space-y-1">
                      {tags.slice(0, 50).map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagClick(tag.slug)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {tag.color && (
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: tag.color }}
                              />
                            )}
                            <span className="text-sm truncate">{tag.name}</span>
                          </div>
                          {tag.usage_count > 0 && (
                            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                              {tag.usage_count}
                            </span>
                          )}
                        </button>
                      ))}
                      {tags.length > 50 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Showing top 50 tags...
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}
            {navigator.share && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="hidden sm:flex"
              >
                <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Share</span>
              </Button>
            )}
          </div>
        </div>

        {/* Category Navigation - Always show if categories exist, regardless of links */}
        {categories && categories.length > 0 && (
          <div className="mb-6 md:mb-8">
            <CategoryNav categories={categories} />
          </div>
        )}


        {/* Search Results or All Links */}
        {linksLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <LinkCardSkeleton key={i} />
            ))}
          </div>
        ) : searchQuery ? (
          // Search Results
          <div className="space-y-6">
            {/* Matching Links */}
            {linksByCategory.length > 0 ? (
              linksByCategory.map(({ category, links: categoryLinks }) => (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: category.color || "hsl(var(--primary))" }}
                    >
                      {category.icon_name || "📁"}
                    </div>
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                    <span className="text-xs text-muted-foreground">({categoryLinks.length})</span>
                  </div>
                  <div className="space-y-2">
                    {categoryLinks
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
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground">No links found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          // All Links Grouped by Category
          <div className="space-y-8">
            {/* Pinned Links Section - Always first, before Featured */}
            {(() => {
              const pinnedLinks = filteredLinks?.filter((link) => link.is_pinned) || [];
              return pinnedLinks.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">📌 Pinned</h2>
                  </div>
                  <div className="space-y-2">
                    {pinnedLinks
                      .sort((a, b) => {
                        // Pinned links: Sort by created_at DESC (latest first)
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      })
                      .map((link, index) => {
                        const linkCategory = categories?.find(c => c.id === link.category_id);
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
                              icon={link.icon_name ? <span className="text-xl">{link.icon_name}</span> : undefined}
                              link={link}
                              categoryColor={linkCategory?.color}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Featured Links Section - Vertical */}
            {featuredLinks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">⭐ Featured</h2>
                </div>
                <div className="space-y-2">
                  {featuredLinks
                    .filter(link => !link.is_pinned) // Exclude pinned links from featured
                    .sort((a, b) => {
                      // Featured links: Sort by created_at DESC (latest first)
                      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    })
                    .map((link, index) => {
                      const linkCategory = categories?.find(c => c.id === link.category_id);
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
                            icon={link.icon_name ? <span className="text-xl">{link.icon_name}</span> : undefined}
                            link={link}
                            categoryColor={linkCategory?.color}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* New This Week Section - Vertical */}
            {(() => {
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              const newThisWeek = filteredLinks?.filter(
                link => new Date(link.created_at) >= oneWeekAgo
              ) || [];
              
              return newThisWeek.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">🆕 New This Week</h2>
                  </div>
                  <div className="space-y-2">
                    {newThisWeek
                      .filter(link => !link.is_pinned) // Exclude pinned links from "New This Week"
                      .sort((a, b) => {
                        // Latest first (created_at DESC)
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      })
                      .slice(0, 8)
                      .map((link, index) => {
                        const linkCategory = categories?.find(c => c.id === link.category_id);
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
                              icon={link.icon_name ? <span className="text-xl">{link.icon_name}</span> : undefined}
                              link={link}
                              categoryColor={linkCategory?.color}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Links by Category - Vertical - Show all categories even with 0 links */}
            {linksByCategory.map(({ category, links: categoryLinks }) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shadow-sm"
                    style={{ backgroundColor: category.color || "hsl(var(--primary))" }}
                  >
                    {category.icon_name || "📁"}
                  </div>
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                  <span className="text-xs text-muted-foreground">({categoryLinks.length} {categoryLinks.length === 1 ? 'link' : 'links'})</span>
                </div>
                {categoryLinks.length > 0 ? (
                  <div className="space-y-2">
                    {categoryLinks
                    .filter(link => !link.is_pinned) // Exclude pinned links from category sections (they're in Pinned section)
                    .sort((a, b) => {
                      // Latest first (created_at DESC), then by click_count, then order_position
                      const dateDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      if (dateDiff !== 0) return dateDiff;
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
                          showClickCount={false}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 text-sm text-muted-foreground">
                    No links in this category yet
                  </div>
                )}
              </div>
            ))}

            {categories && categories.length === 0 && (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground">
                  No categories available yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Social Links */}
        <div className="flex justify-center gap-3 md:gap-4 pt-6 border-t border-border/50 animate-fade-in">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border border-border hover:border-primary flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs md:text-sm text-muted-foreground mt-6 md:mt-8 animate-fade-in">
          © 2024 Updates Loop. All rights reserved.
        </p>
      </div>
    </div>
    </>
  );
};

export default Index;
