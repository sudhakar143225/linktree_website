// Detect social platform from URL
export const detectSocialPlatform = (url: string): { platform: string; icon: string } | null => {
  if (!url) return null;

  const urlLower = url.toLowerCase();

  const platforms: Record<string, { platform: string; icon: string }> = {
    instagram: { platform: "Instagram", icon: "📷" },
    twitter: { platform: "Twitter", icon: "🐦" },
    x: { platform: "X", icon: "𝕏" },
    youtube: { platform: "YouTube", icon: "📺" },
    linkedin: { platform: "LinkedIn", icon: "💼" },
    facebook: { platform: "Facebook", icon: "👥" },
    github: { platform: "GitHub", icon: "💻" },
    discord: { platform: "Discord", icon: "💬" },
    tiktok: { platform: "TikTok", icon: "🎵" },
    pinterest: { platform: "Pinterest", icon: "📌" },
    reddit: { platform: "Reddit", icon: "🤖" },
    telegram: { platform: "Telegram", icon: "✈️" },
    whatsapp: { platform: "WhatsApp", icon: "💚" },
    snapchat: { platform: "Snapchat", icon: "👻" },
    spotify: { platform: "Spotify", icon: "🎵" },
    medium: { platform: "Medium", icon: "📝" },
    dribbble: { platform: "Dribbble", icon: "🎨" },
    behance: { platform: "Behance", icon: "🎨" },
  };

  for (const [key, value] of Object.entries(platforms)) {
    if (urlLower.includes(key)) {
      return value;
    }
  }

  return null;
};

// Get platform emoji
export const getPlatformEmoji = (url: string): string | null => {
  const detected = detectSocialPlatform(url);
  return detected?.icon || null;
};

