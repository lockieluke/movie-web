import { mwFetch } from "@/backend/helpers/fetch";

export interface MetaResponse {
  version: string;
  name: string;
  description?: string;
  hasCaptcha: boolean;
  captchaClientKey?: string;
}

export async function getBackendMeta(url: string): Promise<MetaResponse> {
  return mwFetch<MetaResponse>("/meta", {
    baseURL: url,
  });
}
