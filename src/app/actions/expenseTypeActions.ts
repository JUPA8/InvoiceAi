"use server";

import { revalidatePath } from "next/cache";
import * as expenseTypeService from "@/services/expenseTypeService";
import { getSession } from "@/lib/session";

export async function createExpenseTypeAction(
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated." };
  }

  const rawFormData = {
    name: formData.get("name") as string,
    costCenterId: formData.get("costCenterId") as string,
  };

  if (!rawFormData.name || !rawFormData.costCenterId) {
    return { success: false, message: "Name and Cost Center are required." };
  }

  try {
    const result = await expenseTypeService.createExpenseType({
      name: rawFormData.name,
      costCenterId: rawFormData.costCenterId,
    });

    revalidatePath("/expense-type");
    return {
      success: true,
      message: "Expense Type created successfully.",
      data: result,
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Failed to create Expense Type.";
    return { success: false, message: errorMessage };
  }
}

export async function updateExpenseTypeAction(
  expenseTypeId: string,
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated." };
  }

  const rawFormData = {
    name: formData.get("name") as string,
    costCenterId: formData.get("costCenterId") as string,
  };

  if (!rawFormData.name || !rawFormData.costCenterId) {
    return { success: false, message: "Name and Cost Center are required." };
  }

  try {
    const result = await expenseTypeService.updateExpenseType(expenseTypeId, {
      id: expenseTypeId,
      name: rawFormData.name,
      costCenterId: rawFormData.costCenterId,
    });

    revalidatePath("/expense-type");
    return {
      success: true,
      message: "Expense Type updated successfully.",
      data: result,
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Failed to update Expense Type.";
    return { success: false, message: errorMessage };
  }
}

export async function deleteExpenseTypeAction(
  costCenterId: string,
  expenseTypeId: string
) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated." };
  }

  try {
    await expenseTypeService.deleteExpenseType(costCenterId, expenseTypeId);
    revalidatePath("/expense-type");
    return {
      success: true,
      message: "Expense Type deleted successfully.",
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Failed to delete Expense Type.";
    return { success: false, message: errorMessage };
  }
}

export async function getExpenseTypeStatsAction() {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated." };
  }

  try {
    const stats = await expenseTypeService.getExpenseTypeStats(
      session.clientId
    );
    return {
      success: true,
      data: stats,
    };
  } catch {
    return {
      success: false,
      message: "Failed to get expense type statistics.",
      data: { total: 0, active: 0, costCentersInUse: 0 },
    };
  }
}
