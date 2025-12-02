import { ConvexHttpClient } from "convex/browser";

let _convexClient: ConvexHttpClient | null = null;

export const getConvexClient = (): ConvexHttpClient => {
  if (!_convexClient) {
    const url = process.env.CONVEX_URL;
    if (!url) {
      throw new Error("CONVEX_URL environment variable is not set");
    }
    _convexClient = new ConvexHttpClient(url);
  }
  return _convexClient;
};

// For backwards compatibility - use getter proxy
export const convexClient = new Proxy({} as ConvexHttpClient, {
  get(_, prop) {
    return (getConvexClient() as any)[prop];
  },
});

// Legacy export for backward compatibility
export const convex = convexClient;
