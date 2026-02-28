// src/helpers/getAppDomain.ts

const DOMAIN_OVERRIDES: Record<string, string> = {
  notion3: "notion.so",
  notion: "notion.so",
  "google-restricted": "google.com",
  "ai-provider": "make.com",
  mcp: "anthropic.com",
  "openai-gpt-3": "openai.com",
  "app#gemini-ai-djw8e0": "deepmind.google",
};

export const getAppDomain = (
  accountName: string | null | undefined,
): string => {
  if (!accountName) return "make.com";

  if (DOMAIN_OVERRIDES[accountName]) {
    return DOMAIN_OVERRIDES[accountName];
  }

  let cleanName = accountName.toLowerCase();

  if (cleanName.startsWith("app#")) {
    cleanName = cleanName.split("#")[1];
  }

  cleanName = cleanName.replace(/[0-9]+$/, "");

  cleanName = cleanName.split("-")[0];

  return `${cleanName}.com`;
};
