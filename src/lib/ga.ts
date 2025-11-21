declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "consent" | "set",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
let loggedMissingId = false;
let loggedMissingGtag = false;

export const pageview = (url: string) => {
  if (typeof window === "undefined") return;

  if (!GA_ID) {
    if (process.env.NODE_ENV !== "production" && !loggedMissingId) {
      console.warn("[analytics] NEXT_PUBLIC_GA_ID is not set; skipping pageview");
      loggedMissingId = true;
    }
    return;
  }

  if (typeof window.gtag !== "function") {
    if (process.env.NODE_ENV !== "production" && !loggedMissingGtag) {
      console.warn("[analytics] window.gtag is not ready; skipping pageview");
      loggedMissingGtag = true;
    }
    return;
  }

  window.gtag("config", GA_ID, {
    page_path: url,
  });
};
