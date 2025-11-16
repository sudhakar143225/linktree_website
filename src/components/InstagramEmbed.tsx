import { Card, CardContent } from "@/components/ui/card";
import { Instagram } from "lucide-react";

interface InstagramEmbedProps {
  postUrl: string;
  postId?: string;
}

const InstagramEmbed = ({ postUrl, postId }: InstagramEmbedProps) => {
  // Extract post ID from URL if not provided
  const extractPostId = (url: string): string | null => {
    const match = url.match(/instagram\.com\/p\/([^/?]+)/);
    return match ? match[1] : null;
  };

  const id = postId || extractPostId(postUrl);

  if (!id) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          <Instagram className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Invalid Instagram post URL</p>
        </CardContent>
      </Card>
    );
  }

  // Instagram embed using oEmbed API (display only)
  // Note: This requires backend implementation or using Instagram's embed API
  // For now, we'll show a placeholder with link
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative w-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 aspect-square flex items-center justify-center">
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex flex-col items-center justify-center text-white hover:bg-black/10 transition-colors"
          >
            <Instagram className="w-12 h-12 mb-4" />
            <span className="text-sm font-medium">View on Instagram</span>
            <span className="text-xs opacity-75 mt-2">{postUrl}</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramEmbed;

