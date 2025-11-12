"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as apiKeyService from "@/services/apiKeyService";

const CLIENT_ID = "2";

const getSession = async (): Promise<apiKeyService.AuthPayload | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_data")?.value;

  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie);
  } catch {
    return null;
  }
};

export async function createKeyAction(prevState: any, formData: FormData) {
  const keyName = formData.get("name") as string;
  const session = await getSession();

  if (!session) return { success: false, message: "Authentication error." };
  if (!keyName) return { success: false, message: "Key name is required." };

  try {
    await apiKeyService.createApiKey(CLIENT_ID, { key: keyName }, session);
    revalidatePath("/api-keys");
    return { success: true, message: "API Key created successfully." };
  } catch (error: any) {
    console.error(
      "Create API Key Error:",
      error.response?.data || error.message
    );
    return { success: false, message: "Failed to create API Key." };
  }
}

export async function revokeKeyAction(keyId: string, currentStatus: boolean) {
  const session = await getSession();
  if (!session) return;

  try {
    await apiKeyService.revokeApiKey(CLIENT_ID, keyId, !currentStatus, session);
    revalidatePath("/api-keys");
  } catch (error) {
    console.error("Revoke API Key Error:", error);
  }
}

export async function deleteKeyAction(keyId: string) {
  const session = await getSession();
  if (!session) return;

  try {
    await apiKeyService.deleteApiKey(CLIENT_ID, keyId, session);
    revalidatePath("/api-keys");
  } catch (error) {
    console.error("Delete API Key Error:", error);
  }
}

export async function refreshKeysAction() {
  revalidatePath("/api-keys");
}
