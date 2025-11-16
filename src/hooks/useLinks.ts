import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Link {
  id: string;
  title: string;
  description: string | null;
  url: string;
  icon_name: string | null;
  category_id: string | null;
  is_pinned: boolean;
  is_active: boolean;
  is_featured: boolean;
  order_position: number;
  click_count: number;
  expiration_date: string | null;
  subcategory: string | null;
  upvote_count?: number | null;
  downvote_count?: number | null;
  health_status?: string | null;
  preview_image?: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
}

export const useLinks = () => {
  return useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("links")
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .eq("is_active", true)
        .or("expiration_date.is.null,expiration_date.gt." + new Date().toISOString())
        .order("is_pinned", { ascending: false })
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data as Link[];
    },
  });
};

export const useAllLinks = () => {
  return useQuery({
    queryKey: ["links", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("links")
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .order("is_pinned", { ascending: false })
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data as Link[];
    },
  });
};

export const useIncrementClickCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.rpc("increment_click_count" as any, {
        link_id: linkId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: Partial<Link>) => {
      const { data, error } = await supabase
        .from("links")
        .insert([link as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create link: " + error.message);
    },
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Link> & { id: string }) => {
      const { data, error } = await supabase
        .from("links")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update link: " + error.message);
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("links").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete link: " + error.message);
    },
  });
};

export const useUpdateLinkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; order_position: number }>) => {
      // Batch update order positions
      const promises = updates.map(({ id, order_position }) =>
        supabase
          .from("links")
          .update({ order_position })
          .eq("id", id)
      );

      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link order updated");
    },
    onError: (error) => {
      toast.error("Failed to update link order: " + error.message);
    },
  });
};
