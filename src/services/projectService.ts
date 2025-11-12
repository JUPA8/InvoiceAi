"use server";

import axios, { type RawAxiosRequestHeaders } from 'axios';
import { cookies } from 'next/headers';

interface AuthPayload {
  userKey: string;
  basicAuth: string;
}

const getSession = async (): Promise<AuthPayload | null> => {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session_data")?.value;
    if (!sessionCookie) return null;
    try {
      return JSON.parse(sessionCookie);
    } catch {
      return null;
    }
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const createAuthHeaders = (auth: AuthPayload): RawAxiosRequestHeaders => {
  return {
    'Content-Type': 'application/json',
    'X-USER-KEY': auth.userKey,
    'Authorization': `Basic ${auth.basicAuth}`,
  };
};

export const getProjects = async (clientId: string) => {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");
  const response = await apiClient.get(`/api/v1/clients/${clientId}/projects?query.ShowAll=true`, {
    headers: createAuthHeaders(session),
  });
  return response.data.data || response.data || [];
};

export const createProject = async (clientId: string, projectData: { projectName: string, applicationUrl: string, isActive: boolean }) => {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");
  return apiClient.post(`/api/v1/clients/${clientId}/projects`, projectData, {
    headers: createAuthHeaders(session),
  });
};

export const updateProject = async (clientId: string, projectId: string, projectData: { id: string, projectName: string, applicationUrl: string, isActive: boolean }) => {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");
  return apiClient.put(`/api/v1/clients/${clientId}/projects/${projectId}`, projectData, {
    headers: createAuthHeaders(session),
  });
};

export const deleteProject = async (clientId: string, projectId: string) => {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");
  return apiClient.delete(`/api/v1/clients/${clientId}/projects/${projectId}`, {
    headers: createAuthHeaders(session),
  });
};