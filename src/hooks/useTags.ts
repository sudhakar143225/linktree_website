import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface LinkTag {
  id: string;
  link_id: string;
  tag_id: string;
  created_at: string;
  tag?: Tag;
}

export const useTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("usage_count", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Tag[];
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: Partial<Tag>) => {
      // Auto-generate slug if not provided
      if (!tag.slug && tag.name) {
        tag.slug = tag.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      }

      const { data, error } = await supabase
        .from("tags")
        .insert([tag as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create tag: " + error.message);
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tag> & { id: string }) => {
      const { data, error } = await supabase
        .from("tags")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update tag: " + error.message);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete tag: " + error.message);
    },
  });
};

export const useLinkTags = (linkId: string | null) => {
  return useQuery({
    queryKey: ["link_tags", linkId],
    queryFn: async () => {
      if (!linkId) return [];

      const { data, error } = await supabase
        .from("link_tags")
        .select(`
          *,
          tag:tags(*)
        `)
        .eq("link_id", linkId);

      if (error) throw error;
      return (data as LinkTag[]) || [];
    },
    enabled: !!linkId,
  });
};

export const useAddTagToLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, tagId }: { linkId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from("link_tags")
        .insert([{ link_id: linkId, tag_id: tagId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["link_tags", variables.linkId] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useRemoveTagFromLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, tagId }: { linkId: string; tagId: string }) => {
      const { error } = await supabase
        .from("link_tags")
        .delete()
        .eq("link_id", linkId)
        .eq("tag_id", tagId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["link_tags", variables.linkId] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

