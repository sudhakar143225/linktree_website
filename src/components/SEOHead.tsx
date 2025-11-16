import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  keywords?: string[];
}

const SEOHead = ({
  title = "Updates Loop - Your Linktree",
  description = "Your daily dose of tech news, AI breakthroughs, and innovation",
  image = "/logo_instagram_page.png",
  url = typeof window !== "undefined" ? window.location.href : "",
  type = "website",
  siteName = "Updates Loop",
  keywords = [],
}: SEOHeadProps) => {
  const fullTitle = title.includes("Updates Loop") ? title : `${title} | Updates Loop`;
  const fullImage = image.startsWith("http") ? image : `${typeof window !== "undefined" ? window.location.origin : ""}${image}`;
  const fullUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: typeof window !== "undefined" ? window.location.origin : "",
          description: description,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${typeof window !== "undefined" ? window.location.origin : ""}/?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        })}
      </script>

      {/* Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteName,
          url: typeof window !== "undefined" ? window.location.origin : "",
          logo: fullImage,
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;

