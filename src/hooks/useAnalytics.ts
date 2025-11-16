import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LinkAnalytics {
  id: string;
  link_id: string;
  device_type: string | null;
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  os_version: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  session_id: string | null;
  clicked_at: string;
}

export interface AnalyticsSession {
  id: string;
  session_id: string;
  first_seen_at: string;
  last_seen_at: string;
  country: string | null;
  region: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  total_clicks: number;
}

export const useLinkAnalytics = (linkId: string | null, startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ["link_analytics", linkId, startDate, endDate],
    queryFn: async () => {
      if (!linkId) return [];

      let query = supabase
        .from("link_analytics")
        .select("*")
        .eq("link_id", linkId)
        .order("clicked_at", { ascending: false });

      if (startDate) {
        query = query.gte("clicked_at", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("clicked_at", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as LinkAnalytics[]) || [];
    },
    enabled: !!linkId,
  });
};

export const useGeographicAnalytics = (linkId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["geographic_analytics", linkId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_geographic_analytics", {
        p_link_id: linkId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

      if (error) throw error;
      return data as Array<{ country: string; region: string; clicks: number }>;
    },
  });
};

export const useDeviceAnalytics = (linkId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["device_analytics", linkId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_device_analytics", {
        p_link_id: linkId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

      if (error) throw error;
      return data as Array<{ device_type: string; browser: string; os: string; clicks: number }>;
    },
  });
};

export const useTimeBasedAnalytics = (
  linkId: string,
  startDate: Date,
  endDate: Date,
  groupBy: "hour" | "day" | "day_of_week" = "hour"
) => {
  return useQuery({
    queryKey: ["time_based_analytics", linkId, startDate, endDate, groupBy],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_time_based_analytics", {
        p_link_id: linkId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_group_by: groupBy,
      });

      if (error) throw error;
      return data as Array<{ time_period: string; clicks: number }>;
    },
  });
};

export const useAllAnalytics = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ["all_analytics", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("link_analytics")
        .select("*")
        .order("clicked_at", { ascending: false });

      if (startDate) {
        query = query.gte("clicked_at", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("clicked_at", endDate.toISOString());
      }

      const { data, error } = await query.limit(10000); // Limit to prevent huge queries

      if (error) throw error;
      return (data as LinkAnalytics[]) || [];
    },
  });
};

export const useAnalyticsSessions = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ["analytics_sessions", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("analytics_sessions")
        .select("*")
        .order("last_seen_at", { ascending: false });

      if (startDate) {
        query = query.gte("first_seen_at", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("last_seen_at", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as AnalyticsSession[]) || [];
    },
  });
};

// Track click analytics
export const trackLinkClick = async (linkId: string) => {
  // Get client info
  const userAgent = navigator.userAgent;
  const language = navigator.language;

  // Detect device type
  const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) ? "mobile" : "desktop";
  
  // Detect browser
  let browser = "unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  // Detect OS
  let os = "unknown";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

  // Get or create session
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }

  // Get referrer
  const referrer = document.referrer || null;

  // Insert analytics
  const { error } = await supabase
    .from("link_analytics")
    .insert([{
      link_id: linkId,
      device_type: deviceType,
      browser: browser,
      os: os,
      user_agent: userAgent,
      referrer: referrer,
      session_id: sessionId,
      // Note: IP, country, region, city would be set server-side via trigger or Edge Function
      // For now, we'll use null values
      ip_address: null,
      country: null,
      region: null,
      city: null,
    }]);

  if (error) {
    console.error("Failed to track analytics:", error);
  }

  // Update session
  await supabase.rpc("increment_click_count" as any, { link_id: linkId });
};

