// Open Graph meta tag scraping

import { supabase } from "@/integrations/supabase/client";

export interface LinkPreview {
  url: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  og_site_name?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
}

// Fetch link preview using Supabase Edge Function or direct fetch
export const fetchLinkPreview = async (url: string): Promise<LinkPreview | null> => {
  try {
    // Use a CORS proxy or Edge Function to fetch the page
    // For now, we'll use a simple fetch (may need Edge Function for CORS)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) return null;

    const html = data.contents;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const getMetaContent = (property: string, name?: string): string | undefined => {
      const meta = doc.querySelector(`meta[property="${property}"]`) || 
                   (name ? doc.querySelector(`meta[name="${name}"]`) : null);
      return meta?.getAttribute("content") || undefined;
    };

    const preview: LinkPreview = {
      url,
      og_title: getMetaContent("og:title") || doc.querySelector("title")?.textContent || undefined,
      og_description: getMetaContent("og:description") || getMetaContent("description"),
      og_image: getMetaContent("og:image"),
      og_type: getMetaContent("og:type"),
      og_site_name: getMetaContent("og:site_name"),
      twitter_card: getMetaContent("twitter:card", "twitter:card"),
      twitter_title: getMetaContent("twitter:title", "twitter:title"),
      twitter_description: getMetaContent("twitter:description", "twitter:description"),
      twitter_image: getMetaContent("twitter:image", "twitter:image"),
    };

    return preview;
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return null;
  }
};

// Save preview to database
export const saveLinkPreview = async (linkId: string, preview: LinkPreview) => {
  const { error } = await supabase
    .from("link_previews")
    .upsert({
      link_id: linkId,
      url: preview.url,
      og_title: preview.og_title,
      og_description: preview.og_description,
      og_image: preview.og_image,
      og_type: preview.og_type,
      og_site_name: preview.og_site_name,
      twitter_card: preview.twitter_card,
      twitter_title: preview.twitter_title,
      twitter_description: preview.twitter_description,
      twitter_image: preview.twitter_image,
      preview_image: preview.og_image || preview.twitter_image,
      last_checked_at: new Date().toISOString(),
    }, {
      onConflict: "link_id",
    });

  if (error) throw error;
};

// Get preview from database
export const getLinkPreview = async (linkId: string) => {
  const { data, error } = await supabase
    .from("link_previews")
    .select("*")
    .eq("link_id", linkId)
    .single();

  if (error) throw error;
  return data;
};

