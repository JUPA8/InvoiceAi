import axios, { type RawAxiosRequestHeaders } from "axios";

export interface AuthPayload {
  userKey: string;
  basicAuth: string;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const createAuthHeaders = (auth: AuthPayload): RawAxiosRequestHeaders => {
  return {
    "Content-Type": "application/json",
    "X-USER-KEY": auth.userKey,
    Authorization: `Basic ${auth.basicAuth}`,
  };
};

export const getApiKeys = async (clientId: string, auth: AuthPayload) => {
  const response = await apiClient.get(
    `/api/v1/clients/${clientId}/keys?query.ShowAll=true`,
    {
      headers: createAuthHeaders(auth),
    }
  );
  return response.data.data || response.data || [];
};

export const createApiKey = async (
  clientId: string,
  data: { key: string },
  auth: AuthPayload
) => {
  const payload = {
    key: data.key,
    isRevoked: false,
  };
  const response = await apiClient.post(
    `/api/v1/clients/${clientId}/keys`,
    payload,
    {
      headers: createAuthHeaders(auth),
    }
  );
  return response.data;
};

export const revokeApiKey = async (
  clientId: string,
  keyId: string,
  isRevoked: boolean,
  auth: AuthPayload
) => {
  const payload = { isRevoked };
  return apiClient.put(`/api/v1/clients/${clientId}/keys/${keyId}`, payload, {
    headers: createAuthHeaders(auth),
  });
};

export const deleteApiKey = async (
  clientId: string,
  keyId: string,
  auth: AuthPayload
) => {
  return apiClient.delete(`/api/v1/clients/${clientId}/keys/${keyId}`, {
    headers: createAuthHeaders(auth),
  });
};
