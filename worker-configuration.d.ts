/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
  EVENTS?: AnalyticsEngineDataset;
  ACCOUNT_ID?: string;
  /** Secret (wrangler secret put): API token with Account Analytics:Read. */
  ANALYTICS_API_TOKEN?: string;
}
