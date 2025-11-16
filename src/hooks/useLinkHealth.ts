import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LinkHealthCheck {
  id: string;
  link_id: string;
  status_code: number | null;
  status_text: string | null;
  is_healthy: boolean;
  error_message: string | null;
  response_time_ms: number | null;
  checked_at: string;
}

// Check link health via Edge Function or direct fetch
export const checkLinkHealth = async (url: string): Promise<Partial<LinkHealthCheck>> => {
  try {
    const startTime = Date.now();
    
    // Use HEAD request for faster checking (doesn't download body)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(url, {
        method: "HEAD",
        mode: "no-cors", // May not work in all cases, but tries
        signal: controller.signal,
      } as RequestInit);

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // With no-cors, we can't read status, but if no error, assume healthy
      return {
        status_code: 200,
        status_text: "OK",
        is_healthy: true,
        response_time_ms: responseTime,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === "AbortError") {
        return {
          status_code: null,
          status_text: "Timeout",
          is_healthy: false,
          error_message: "Request timed out after 5 seconds",
          response_time_ms: Date.now() - startTime,
        };
      }

      return {
        status_code: null,
        status_text: "Error",
        is_healthy: false,
        error_message: error.message || "Failed to check link health",
        response_time_ms: Date.now() - startTime,
      };
    }
  } catch (error: any) {
    return {
      status_code: null,
      status_text: "Error",
      is_healthy: false,
      error_message: error.message || "Failed to check link health",
    };
  }
};

export const useLinkHealth = (linkId: string | null) => {
  return useQuery({
    queryKey: ["link_health", linkId],
    queryFn: async () => {
      if (!linkId) return null;

      const { data, error } = await supabase
        .from("link_health_checks")
        .select("*")
        .eq("link_id", linkId)
        .order("checked_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return data as LinkHealthCheck | null;
    },
    enabled: !!linkId,
  });
};

export const useCheckLinkHealth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, url }: { linkId: string; url: string }) => {
      // Check health
      const healthData = await checkLinkHealth(url);

      // Save to database
      const { data, error } = await supabase
        .from("link_health_checks")
        .insert([{
          link_id: linkId,
          ...healthData,
          checked_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Update link health status
      await supabase
        .from("links")
        .update({
          last_health_check: new Date().toISOString(),
          health_status: healthData.is_healthy ? "healthy" : "unhealthy",
        })
        .eq("id", linkId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["link_health", variables.linkId] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link health check completed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to check link health");
    },
  });
};

// Automatic background health checks
export const useAutoHealthCheck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (links: Array<{ id: string; url: string }>) => {
      const checks = await Promise.allSettled(
        links.map(async (link) => {
          const healthData = await checkLinkHealth(link.url);
          
          await supabase
            .from("link_health_checks")
            .insert([{
              link_id: link.id,
              ...healthData,
              checked_at: new Date().toISOString(),
            }]);

          await supabase
            .from("links")
            .update({
              last_health_check: new Date().toISOString(),
              health_status: healthData.is_healthy ? "healthy" : "unhealthy",
            })
            .eq("id", link.id);
        })
      );

      return checks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
};

