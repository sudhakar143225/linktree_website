// CSV report generation

import { Link } from "@/hooks/useLinks";
import { Category } from "@/hooks/useCategories";
import { LinkAnalytics } from "@/hooks/useAnalytics";

// CSV Export
export const exportToCSV = (data: any[], filename: string = "report.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Handle values with commas or quotes
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Analytics CSV Export
export const exportAnalyticsToCSV = (analytics: LinkAnalytics[], filename: string = "analytics.csv") => {
  const csvData = analytics.map((a) => ({
    "Link ID": a.link_id,
    "Clicked At": new Date(a.clicked_at).toLocaleString(),
    "Device Type": a.device_type || "Unknown",
    "Browser": a.browser || "Unknown",
    "OS": a.os || "Unknown",
    "Country": a.country || "Unknown",
    "Region": a.region || "Unknown",
    "City": a.city || "Unknown",
    "Referrer": a.referrer || "Direct",
    "Session ID": a.session_id || "Unknown",
  }));

  exportToCSV(csvData, filename);
};

// Links CSV Export
export const exportLinksToCSV = (links: Link[], categories: Category[], filename: string = "links.csv") => {
  const csvData = links.map((link) => {
    const category = categories.find((c) => c.id === link.category_id);
    return {
      "Title": link.title,
      "URL": link.url,
      "Description": link.description || "",
      "Category": category?.name || "Uncategorized",
      "Subcategory": link.subcategory || "",
      "Clicks": link.click_count,
      "Upvotes": link.upvote_count || 0,
      "Downvotes": link.downvote_count || 0,
      "Pinned": link.is_pinned ? "Yes" : "No",
      "Featured": link.is_featured ? "Yes" : "No",
      "Active": link.is_active ? "Yes" : "No",
      "Created At": new Date(link.created_at).toLocaleString(),
      "Health Status": link.health_status || "Unknown",
    };
  });

  exportToCSV(csvData, filename);
};

