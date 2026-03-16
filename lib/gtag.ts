// lib/gtag.ts
// utilities for Google Analytics v4 (gtag.js)
// see https://developers.google.com/analytics/devguides/collection/gtagjs

// add minimal global typings used by the snippet
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '';

// log a pageview
export const pageview = (url: string) => {
  if (!GA_TRACKING_ID) return;
  window.gtag?.('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// log specific events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (!GA_TRACKING_ID) return;
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
