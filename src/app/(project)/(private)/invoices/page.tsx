import InvoicesClient from "./invoices-client";
import * as invoiceService from "@/services/invoiceService";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
  const session = await getSession();

  if (!session?.clientId) {
    redirect("/login?error=session_expired");
  }

  const { clientId } = session;

  const results = await Promise.allSettled([
    Promise.race([
      invoiceService.getInvoices(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout getting invoices")), 10000)
      ),
    ]),
    Promise.race([
      invoiceService.getCostCenters(clientId),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout getting cost centers")),
          8000
        )
      ),
    ]),
    Promise.race([
      invoiceService.getAllExpenseTypesForClient(clientId),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout getting expense types")),
          15000
        )
      ),
    ]),
  ]);

  const invoices: any[] =
    results[0].status === "fulfilled" && Array.isArray(results[0].value)
      ? results[0].value
      : [];
  const costCenters: any[] =
    results[1].status === "fulfilled" && Array.isArray(results[1].value)
      ? results[1].value
      : [];
  const expenseTypes: any[] =
    results[2].status === "fulfilled" && Array.isArray(results[2].value)
      ? results[2].value
      : [];

  const serializableInvoices = invoices.map((invoice) => {
    if (invoice.file?.invoice) {
      const newInvoice = { ...invoice };
      const { invoice: _, ...fileWithoutInvoice } = newInvoice.file;
      newInvoice.file = fileWithoutInvoice;
      return newInvoice;
    }
    return invoice;
  });

  const serializableCostCenters = costCenters.map((center) => {
    return {
      id: center.id,
      name: center.name,
      isActive: center.isActive,
      clientId: center.clientId,
    };
  });

  const serializableExpenseTypes = expenseTypes.map((et) => ({
    id: et.id,
    name: et.name,
    costCenterId: et.costCenterId || et.costCenter?.id,
    isActive: et.isActive,
  }));

  if (process.env.NODE_ENV === "development") {
    console.log("Page load results (sanitized):", {
      invoices: serializableInvoices.length,
      costCenters: serializableCostCenters.length,
      expenseTypes: serializableExpenseTypes.length,
      failures: results
        .filter((r) => r.status === "rejected")
        .map((r, i) => ({
          index: i,
          reason: r.status === "rejected" ? r.reason?.message : "Unknown",
        })),
    });
  }

  return (
    <InvoicesClient
      initialInvoices={serializableInvoices}
      initialCostCenters={serializableCostCenters}
      initialExpenseTypes={serializableExpenseTypes}
    />
  );
}