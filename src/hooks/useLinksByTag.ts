import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "./useLinks";

export const useLinksByTag = (tagId: string | null) => {
  return useQuery({
    queryKey: ["links_by_tag", tagId],
    queryFn: async () => {
      if (!tagId) return [];

      // Fetch link_ids that have this tag
      const { data: linkTags, error } = await supabase
        .from("link_tags")
        .select("link_id")
        .eq("tag_id", tagId);

      if (error) throw error;

      const linkIds = (linkTags || []).map((lt: { link_id: string }) => lt.link_id);

      if (linkIds.length === 0) return [];

      // Fetch all links with these IDs
      const { data: links, error: linksError } = await supabase
        .from("links")
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .in("id", linkIds)
        .eq("is_active", true)
        .order("is_pinned", { ascending: false })
        .order("click_count", { ascending: false })
        .order("created_at", { ascending: false });

      if (linksError) throw linksError;
      return (links as Link[]) || [];
    },
    enabled: !!tagId,
  });
};

