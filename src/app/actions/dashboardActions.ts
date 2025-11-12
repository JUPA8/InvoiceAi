"use server";

import { getCostCenters } from "@/services/costCenterService";
import { getSession } from "@/lib/session";

/**
 * Fetches cost center data and transforms it for chart display.
 * This server action is safe to call from client components.
 */
export async function getCostCenterChartData() {
  const session = await getSession();
  if (!session?.clientId) {
    // Or handle this scenario as you see fit
    throw new Error("Client ID not found in session.");
  }

  try {
    // 1. Fetch the raw data using your existing service
    const costCenters = await getCostCenters(session.clientId.toString());

    // 2. Transform the data into a format the chart can use
    // For this example, we're just counting them. You can adapt this
    // to sum up expenses or other metrics later.
    const chartData = costCenters.map((center) => ({
      name: center.name,
      value: 1, // Replace with a real metric, e.g., number of projects/invoices
    }));

    // You could also aggregate the data, for example:
    const activeCount = costCenters.filter((c) => c.isActive).length;
    const inactiveCount = costCenters.length - activeCount;

    const aggregatedData = [
      { name: "Active Centers", value: activeCount },
      { name: "Inactive Centers", value: inactiveCount },
    ];

    return aggregatedData;
  } catch (error) {
    console.error("Failed to get cost center chart data:", error);
    // Return an empty array or throw the error, depending on how you want the UI to react
    return [];
  }
}