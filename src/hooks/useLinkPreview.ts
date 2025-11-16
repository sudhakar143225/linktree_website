import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLinkPreview, saveLinkPreview, getLinkPreview } from "@/lib/linkPreview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LinkPreviewData {
  id: string;
  link_id: string;
  url: string;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string | null;
  og_site_name: string | null;
  twitter_card: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  preview_image: string | null;
  fetched_at: string;
  last_checked_at: string;
}

export const useLinkPreview = (linkId: string | null, url?: string) => {
  return useQuery({
    queryKey: ["link_preview", linkId],
    queryFn: async () => {
      if (!linkId) return null;

      // First check if preview exists in database
      try {
        const existing = await getLinkPreview(linkId);
        if (existing) return existing as LinkPreviewData;
      } catch (error) {
        // Preview doesn't exist, fetch it
      }

      // If URL provided and no preview exists, fetch it
      if (url) {
        const preview = await fetchLinkPreview(url);
        if (preview) {
          await saveLinkPreview(linkId, preview);
          return await getLinkPreview(linkId) as LinkPreviewData;
        }
      }

      return null;
    },
    enabled: !!linkId,
  });
};

export const useFetchLinkPreview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, url }: { linkId: string; url: string }) => {
      const preview = await fetchLinkPreview(url);
      if (!preview) {
        throw new Error("Failed to fetch link preview");
      }

      await saveLinkPreview(linkId, preview);
      return preview;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["link_preview", variables.linkId] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link preview fetched successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to fetch link preview");
    },
  });
};

