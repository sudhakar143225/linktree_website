import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/hooks/useCategories";

interface InstagramBioPreviewProps {
  categories: Category[];
  siteUrl?: string;
}

const InstagramBioPreview = ({ categories, siteUrl = "yourlinktree.com" }: InstagramBioPreviewProps) => {
  const bioLink = siteUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="w-5 h-5" />
          Instagram Bio Link Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg p-6 text-white">
          <div className="space-y-2 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <Instagram className="w-8 h-8" />
            </div>
            <div className="font-bold text-lg">@yourhandle</div>
            <div className="text-sm opacity-90">
              Your bio description here
              <br />
              <a href={bioLink} className="underline font-medium">
                {bioLink}
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Categories to Display in Bio:</h4>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 5).map((category) => (
              <Badge key={category.id} variant="outline">
                {category.name}
              </Badge>
            ))}
            {categories.length > 5 && (
              <Badge variant="outline">+{categories.length - 5} more</Badge>
            )}
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a href={bioLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Copy Bio Link
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default InstagramBioPreview;

