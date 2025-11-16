import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  color: string | null;
  order_position: number;
  show_on_home: boolean | null;
  subcategories: string | null;
  background_image?: string | null;
  custom_color_palette?: any;
  description?: string | null;
  icon_lucide_name?: string | null;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order_position", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      return (data || []) as Category[];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Partial<Category>) => {
      const { data, error } = await supabase
        .from("categories")
        .insert([category as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update category: " + error.message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete category: " + error.message);
    },
  });
};

export const useUpdateCategoryOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; order_position: number }>) => {
      // Batch update order positions
      const promises = updates.map(({ id, order_position }) =>
        supabase
          .from("categories")
          .update({ order_position })
          .eq("id", id)
      );

      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category order updated");
    },
    onError: (error) => {
      toast.error("Failed to update category order: " + error.message);
    },
  });
};
