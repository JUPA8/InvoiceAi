"use server";

import axios, { type RawAxiosRequestHeaders } from "axios";
import { getSession, SessionPayload } from "@/lib/session";
import { getCostCenters as getCostCentersFromService } from "./costCenterService";

export interface ExpenseType {
  id: string;
  name: string;
  costCenterId: string;
  costCenter?: {
    id: string;
    name: string;
  };
  isActive?: boolean;
  createdDate?: string;
  modifiedDate?: string;
  isDeleted?: boolean;
}

export interface CreateExpenseTypeRequest {
  name: string;
  costCenterId: string;
}

export interface UpdateExpenseTypeRequest {
  id: string;
  name: string;
  costCenterId: string;
}

export interface ExpenseTypeResponse {
  total: number;
  pageNumber: number;
  pageSize: number;
  filter: any;
  data: ExpenseType[];
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

let workingHeaders: RawAxiosRequestHeaders | null = null;

export const getCostCenters = async (clientId: string) => {
  return getCostCentersFromService(clientId);
};

export const getAllExpenseTypesForClient = async (
  clientId: string
): Promise<ExpenseType[]> => {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated.");
  }

  if (!workingHeaders) {
    workingHeaders = getWorkingHeaders(session);
  }

  try {
    const costCenters = await getCostCenters(clientId);
    const allExpenseTypes: ExpenseType[] = [];

    for (const costCenter of costCenters) {
      try {
        const url = `/api/v1/cost-centers/${costCenter.id}/expense-types?query.ShowAll=true`;
        const response = await apiClient.get<ExpenseTypeResponse>(url, {
          headers: workingHeaders,
        });

        if (response.data.isSuccess) {
          const activeExpenseTypes = response.data.data
            .filter((et) => !et.isDeleted)
            .map((et) => ({
              ...et,
              costCenter: {
                id: costCenter.id,
                name: costCenter.name,
              },
            }));
          allExpenseTypes.push(...activeExpenseTypes);
        }
      } catch {
        continue;
      }
    }

    return allExpenseTypes;
  } catch {
    throw new Error("Failed to retrieve expense types");
  }
};

export const createExpenseType = async (
  data: CreateExpenseTypeRequest
): Promise<ExpenseType> => {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated.");
  }

  if (!workingHeaders) {
    workingHeaders = getWorkingHeaders(session);
  }

  const url = `/api/v1/cost-centers/${data.costCenterId}/expense-types`;

  try {
    const requestBody = {
      name: data.name,
      costCenterId: data.costCenterId,
    };

    const response = await apiClient.post<ExpenseType>(url, requestBody, {
      headers: workingHeaders,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error("Invalid expense type data. Please check all fields.");
    } else if (error.response?.status === 409) {
      throw new Error(
        "An expense type with this name already exists in this cost center."
      );
    }
    throw new Error(
      error.response?.data?.detail || "Failed to create expense type"
    );
  }
};

export const updateExpenseType = async (
  expenseTypeId: string,
  data: UpdateExpenseTypeRequest
): Promise<ExpenseType> => {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated.");
  }

  if (!workingHeaders) {
    workingHeaders = getWorkingHeaders(session);
  }

  const url = `/api/v1/cost-centers/${data.costCenterId}/expense-types/${expenseTypeId}`;

  try {
    const response = await apiClient.put<ExpenseType>(url, data, {
      headers: workingHeaders,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Expense type not found");
    } else if (error.response?.status === 400) {
      throw new Error("Invalid expense type data");
    }
    throw new Error(
      error.response?.data?.detail || "Failed to update expense type"
    );
  }
};

export const deleteExpenseType = async (
  costCenterId: string,
  expenseTypeId: string
) => {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated.");
  }

  if (!workingHeaders) {
    workingHeaders = getWorkingHeaders(session);
  }

  const url = `/api/v1/cost-centers/${costCenterId}/expense-types/${expenseTypeId}`;

  try {
    const response = await apiClient.delete(url, { headers: workingHeaders });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    if (status === 400) {
      throw new Error(
        "Cannot delete this expense type - it may be in use by other items."
      );
    } else if (status === 404) {
      throw new Error(
        "Expense type not found - it may have been already deleted."
      );
    } else if (status === 403) {
      throw new Error("You don't have permission to delete this expense type.");
    }
    throw new Error(
      error.response?.data?.detail || "Failed to delete expense type"
    );
  }
};

export const getExpenseTypeStats = async (clientId: string) => {
  if (!clientId) {
    throw new Error("Client ID is required");
  }

  try {
    const expenseTypes = await getAllExpenseTypesForClient(clientId);

    return {
      total: expenseTypes.length,
      active: expenseTypes.filter((et) => et.isActive !== false).length,
      costCentersInUse: new Set(expenseTypes.map((et) => et.costCenterId)).size,
    };
  } catch {
    return { total: 0, active: 0, costCentersInUse: 0 };
  }
};
