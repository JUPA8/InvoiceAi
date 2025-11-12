import { ExpenseTypeClient } from "./expense-type-client";

export default async function ExpenseTypePage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 relative">
      <ExpenseTypeClient />
    </main>
  );
}
