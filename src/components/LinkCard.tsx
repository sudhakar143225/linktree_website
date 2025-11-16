import { ExternalLink, ArrowRight, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlatformEmoji } from "@/lib/socialDetector";
import { Link } from "@/hooks/useLinks";
import VoteButton from "@/components/VoteButton";
import { useState } from "react";
import { useLinkTags } from "@/hooks/useTags";
import { useNavigate } from "react-router-dom";
import { Tag } from "@/hooks/useTags";

interface PreviewImageWithFallbackProps {
  imageUrl: string;
  title: string;
  fallbackIcon?: React.ReactNode;
  categoryColor?: string | null;
}

const PreviewImageWithFallback = ({ 
  imageUrl, 
  title, 
  fallbackIcon, 
  categoryColor 
}: PreviewImageWithFallbackProps) => {
  const [imageError, setImageError] = useState(false);

  if (imageError && fallbackIcon) {
    return (
      <div 
        className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-primary/90 to-secondary/90 flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 text-base"
        style={{
          backgroundColor: categoryColor || undefined,
        }}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-border bg-muted">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

interface LinkCardProps {
  title: string;
  description?: string;
  url: string;
  icon?: React.ReactNode;
  link?: Link; // Full link object for additional data
  categoryColor?: string | null;
  showClickCount?: boolean;
  tags?: Tag[]; // Optional tags to display
}

const LinkCard = ({ 
  title, 
  description, 
  url, 
  icon, 
  link,
  categoryColor,
  showClickCount = false,
  tags: propsTags
}: LinkCardProps) => {
  const navigate = useNavigate();
  const { data: linkTags } = useLinkTags(link?.id || null);
  const isPopular = link && link.click_count > 100;
  const isVerified = false; // Could add verification field later
  const platformIcon = getPlatformEmoji(url);
  const displayIcon = icon || (platformIcon ? <span className="text-xl">{platformIcon}</span> : undefined);
  
  // Use propsTags if provided, otherwise fetch from linkTags
  const tags = propsTags || linkTags?.map(lt => lt.tag).filter(Boolean) as Tag[] || [];
  
  // Use category color for border if available
  const borderColor = categoryColor || "hsl(var(--border))";
  const hoverBorderColor = categoryColor || "hsl(var(--primary))";

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open link if click is not on vote buttons, tags, or other interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('[data-vote-button]') || target.closest('button') || target.closest('[data-tag-link]')) {
      e.preventDefault();
      return;
    }
  };

  const handleTagClick = (e: React.MouseEvent, tagSlug: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/tag/${tagSlug}`);
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full group"
      onClick={handleCardClick}
    >
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-pointer group border-2"
        style={{
          borderColor: borderColor,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = hoverBorderColor;
          e.currentTarget.style.boxShadow = `0 20px 25px -5px ${categoryColor ? `${categoryColor}25` : "hsl(var(--primary) / 0.25)"}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = borderColor;
          e.currentTarget.style.boxShadow = "";
        }}
      >
        {/* Gradient border effect on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"
          style={{
            background: categoryColor 
              ? `linear-gradient(135deg, ${categoryColor}15, transparent)`
              : "linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)",
          }}
        />
        
        <div className="relative p-2.5 md:p-3 flex items-center gap-2 md:gap-3">
          {/* Preview Image - Show at the start if available */}
          {link?.preview_image ? (
            <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-border bg-muted relative">
              <img
                src={link.preview_image}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide image and show fallback icon
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Fallback icon - hidden by default, shown when image fails */}
              {displayIcon && (
                <div 
                  className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-primary/90 to-secondary/90 text-primary-foreground [&:has(+img[style*='display:none'])]:flex"
                  style={{
                    backgroundColor: categoryColor || undefined,
                  }}
                >
                  {displayIcon}
                </div>
              )}
            </div>
          ) : displayIcon ? (
            <div 
              className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-lg bg-gradient-to-br from-primary/90 to-secondary/90 flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 text-base"
              style={{
                backgroundColor: categoryColor || undefined,
              }}
            >
              {displayIcon}
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              {isVerified && (
                <Badge variant="default" className="px-1 py-0 h-4 text-xs flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified
                </Badge>
              )}
              {isPopular && (
                <Badge variant="secondary" className="px-1 py-0 h-4 text-xs flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Popular
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mb-0.5">
                {description}
              </p>
            )}
            {showClickCount && link && link.click_count > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {link.click_count} {link.click_count === 1 ? "click" : "clicks"}
                </span>
              </div>
            )}
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs px-1.5 py-0 h-5 cursor-pointer hover:bg-primary/10 transition-colors"
                    style={{
                      borderColor: tag.color || undefined,
                      color: tag.color || undefined,
                    }}
                    onClick={(e) => handleTagClick(e, tag.slug)}
                    data-tag-link
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0 h-5 text-muted-foreground"
                  >
                    +{tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            {/* Vote Buttons */}
            {link && (
              <div className="mt-1">
                <VoteButton linkId={link.id} size="sm" />
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </Card>
    </a>
  );
};

export default LinkCard;
