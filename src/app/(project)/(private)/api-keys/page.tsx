import { cookies } from "next/headers";
import { ApiKeyClient } from "./api-client";
import * as apiKeyService from "@/services/apiKeyService";

export type ApiKey = {
  id: string;
  key: string;
  name: string;
  displayKey: string;
  isRevoked: boolean;
  createdAt: string;
};

export type ApiKeyStats = {
  total: number;
  active: number;
  revoked: number;
  createdToday: number;
};

export default async function ApiKeyPage() {
  const CLIENT_ID = "2";

  const sessionCookie = (await cookies()).get("session_data")?.value;

  let apiKeys: ApiKey[] = [];

  if (sessionCookie) {
    try {
      const session: apiKeyService.AuthPayload = JSON.parse(sessionCookie);
      const rawKeys = await apiKeyService.getApiKeys(CLIENT_ID, session);

      apiKeys = rawKeys.map((k: any) => ({
        ...k,
        name: k.key,
        displayKey: k.key
          ? k.key.substring(0, 8) + "..." + k.key.substring(k.key.length - 4)
          : "",
      }));
    } catch (error) {
      console.error("Failed to fetch API keys on server:", error);
    }
  } else {
    console.log(
      "No session cookie found on server page, could not fetch API keys."
    );
  }

  const stats: ApiKeyStats = {
    total: apiKeys.length,
    active: apiKeys.filter((k) => !k.isRevoked).length,
    revoked: apiKeys.filter((k) => k.isRevoked).length,
    createdToday: apiKeys.filter(
      (k) => new Date(k.createdAt).toDateString() === new Date().toDateString()
    ).length,
  };

  return <ApiKeyClient data={apiKeys} stats={stats} />;
}
