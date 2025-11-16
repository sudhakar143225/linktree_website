import { Card, CardContent } from "@/components/ui/card";
import { Image } from "lucide-react";
import { useLinkPreview } from "@/hooks/useLinkPreview";

interface LinkPreviewProps {
  linkId: string | null;
  url?: string;
  className?: string;
}

const LinkPreview = ({ linkId, url, className }: LinkPreviewProps) => {
  const { data: preview, isLoading } = useLinkPreview(linkId, url);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            Loading preview...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preview || (!preview.og_image && !preview.twitter_image && !preview.preview_image)) {
    return null;
  }

  const previewImage = preview.preview_image || preview.og_image || preview.twitter_image;
  const previewTitle = preview.og_title || preview.twitter_title;
  const previewDescription = preview.og_description || preview.twitter_description;

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {previewImage && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <img
              src={previewImage}
              alt={previewTitle || "Link preview"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
        {(previewTitle || previewDescription) && (
          <div className="p-3 space-y-1">
            {previewTitle && (
              <h4 className="text-sm font-semibold line-clamp-2">{previewTitle}</h4>
            )}
            {previewDescription && (
              <p className="text-xs text-muted-foreground line-clamp-2">{previewDescription}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkPreview;

