// SEO helper functions

export interface PageMetadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string[];
}

export const generatePageMetadata = (metadata: PageMetadata) => {
  const siteName = "Updates Loop";
  const defaultTitle = "Updates Loop - Your Linktree";
  const defaultDescription = "Your daily dose of tech news, AI breakthroughs, and innovation";
  const defaultImage = "/logo_instagram_page.png";

  return {
    title: metadata.title || defaultTitle,
    description: metadata.description || defaultDescription,
    image: metadata.image || defaultImage,
    url: metadata.url || (typeof window !== "undefined" ? window.location.href : ""),
    type: metadata.type || "website",
    siteName,
    keywords: metadata.keywords || [],
  };
};

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

