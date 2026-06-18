const isDev = typeof window !== "undefined" && (
  window.location.hostname.includes("localhost") || 
  window.location.hostname.includes("127.0.0.1") || 
  window.location.hostname.includes(".run.app") ||
  window.location.hostname.includes("aistudio")
);

export const API_BASE_URL = isDev ? "" : "http://www.legns.top:1234";
