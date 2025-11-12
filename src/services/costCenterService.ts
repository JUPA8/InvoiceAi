"use server";

import axios, { type RawAxiosRequestHeaders } from "axios";
import { getSession, SessionPayload } from "@/lib/session";

export interface CostCenter {
  id: string;
  name: string;
  clientId: number;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string;
  createdDate: string;
  modifiedBy?: string;
  modifiedDate?: string;
  deletedBy?: string;
  deletedDate?: string;
  applicationUrl?: string;
}

export interface CreateCostCenterRequest {
  name: string;
  isActive: boolean;
}

export interface UpdateCostCenterRequest {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CostCenterResponse {
  total: number;
  pageNumber: number;
  pageSize: number;
  filter: any;
  data: CostCenter[];
  messages: string[];
  isSuccess: boolean;
  statusCode: number;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

function getWorkingHeaders(session: SessionPayload): RawAxiosRequestHeaders {
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${session.basicAuth}`,
    "X-USER-KEY": session.userKey,
    "X-API-KEY": session.clientKey,
  };
}

export const getCostCenters = async (clientId: string) => {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");

  const workingHeaders = getWorkingHeaders(session);
  const url = `/api/v1/clients/${clientId}/CostCenters?query.ShowAll=true`;

  try {
    const response = await apiClient.get<CostCenterResponse>(url, {
      headers: workingHeaders,
    });
    return response.data.data.filter((center) => !center.isDeleted);
  } catch (error: any) {
    throw new Error("Failed to retrieve cost centers.");
  }
};

export const createCostCenter = async (
  clientId: string,
  data: CreateCostCenterRequest
) => {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");

  const workingHeaders = getWorkingHeaders(session);
  const url = `/api/v1/clients/${clientId}/CostCenters`;

  try {
    const response = await apiClient.post<CostCenter>(url, data, {
      headers: workingHeaders,
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to create cost center.");
  }
};

export const updateCostCenter = async (
  clientId: string,
  costCenterId: string,
  data: UpdateCostCenterRequest
) => {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");

  const workingHeaders = getWorkingHeaders(session);
  const url = `/api/v1/clients/${clientId}/CostCenters/${costCenterId}`;

  try {
    const response = await apiClient.put<CostCenter>(url, data, {
      headers: workingHeaders,
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to update cost center.");
  }
};

export const deleteCostCenter = async (
  clientId: string,
  costCenterId: string
) => {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");

  const workingHeaders = getWorkingHeaders(session);
  const url = `/api/v1/clients/${clientId}/CostCenters/${costCenterId}`;

  try {
    const response = await apiClient.delete(url, { headers: workingHeaders });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to delete cost center.");
  }
};
