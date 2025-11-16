import { useEffect } from "react";
import { useLinks } from "@/hooks/useLinks";
import { useCategories } from "@/hooks/useCategories";

const Sitemap = () => {
  const { data: links } = useLinks();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (links && categories && typeof window !== "undefined") {
      const baseUrl = window.location.origin;
      
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${categories?.map((cat) => `
  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <lastmod>${new Date(cat.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
${links?.filter(link => link.is_active).map((link) => `
  <url>
    <loc>${baseUrl}${link.url}</loc>
    <lastmod>${new Date(link.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

      // Return XML content
      const blob = new Blob([sitemap], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      window.location.href = url;
    }
  }, [links, categories]);

  return <div className="min-h-screen bg-background flex items-center justify-center">Generating sitemap...</div>;
};

export default Sitemap;

