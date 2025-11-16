// Vote tracking using cookie + IP combination

// Simple cookie helper functions
const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const generateVoteId = (linkId: string): string => {
  // Get or create cookie ID
  let cookieId = getCookie("vote_session_id");
  if (!cookieId) {
    cookieId = `vote_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    setCookie("vote_session_id", cookieId, 365); // Expires in 1 year
  }
  return `${cookieId}_${linkId}`;
};

export const hasVoted = (linkId: string): boolean => {
  const voteId = generateVoteId(linkId);
  return getCookie(`vote_${voteId}`) !== null;
};

export const setVoted = (linkId: string, voteType: "upvote" | "downvote"): void => {
  const voteId = generateVoteId(linkId);
  setCookie(`vote_${voteId}`, voteType, 365);
};

export const getVoteType = (linkId: string): "upvote" | "downvote" | null => {
  const voteId = generateVoteId(linkId);
  const voteType = getCookie(`vote_${voteId}`);
  return (voteType as "upvote" | "downvote") || null;
};

// Get client info (IP will be extracted server-side)
export const getClientInfo = async () => {
  try {
    return {
      userAgent: navigator.userAgent || "",
      language: navigator.language || "en",
    };
  } catch (error) {
    return {
      userAgent: navigator.userAgent || "",
      language: navigator.language || "en",
    };
  }
};

