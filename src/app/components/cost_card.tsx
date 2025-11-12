"use client";
import * as React from "react";
import { X } from "lucide-react";
import { Payment } from "./cost-center";
import {
  createCostCenter,
  updateCostCenter,
} from "@/services/costCenterService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CostCardProps = {
  item: Payment | null;
  setModalInfo: React.Dispatch<
    React.SetStateAction<{ isOpen: boolean; item: Payment | null }>
  >;
  setTableData: React.Dispatch<React.SetStateAction<Payment[]>>;
  onRefresh?: () => Promise<void>;
  clientId: string;
};

export function Cost_card({
  item,
  setModalInfo,
  setTableData,
  onRefresh,
  clientId,
}: CostCardProps) {
  const [inputsData, setInputsData] = React.useState({
    name: item?.name || "",
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!clientId) {
      setError("Client ID is required");
      setSaving(false);
      return;
    }

    const apiData = {
      name: inputsData.name,
      isActive: true,
    };

    try {
      if (item == null) {
        const result = await createCostCenter(clientId, apiData);
        const creationDate = result.createdDate
          ? new Date(result.createdDate)
          : new Date();
        const newItem: Payment = {
          id: result.id,
          name: result.name,
          status: result.isActive ? "Active" : "Inactive",
          created_at: creationDate.toISOString().split("T")[0],
          isActive: result.isActive,
        };
        setTableData((prev) => [...prev, newItem]);
      } else {
        const updateData = { id: item.id, ...apiData };
        const result = await updateCostCenter(clientId, item.id, updateData);
        const updatedItem: Payment = {
          ...item,
          name: result.name,
          status: result.isActive ? "Active" : "Inactive",
          isActive: result.isActive,
        };
        setTableData((prev) =>
          prev.map((i) => (i.id === item.id ? updatedItem : i))
        );
      }

      setModalInfo({ isOpen: false, item: null });
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
      console.error("Error saving cost center:", error);
      setError(
        error.message || "Failed to save cost center. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/15">
      <Card className="w-[423px]">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center justify-between">
              {item == null ? "New" : "Edit"} Cost Center
              <X
                className="w-4 h-4 text-[#71717a] cursor-pointer"
                onClick={() => setModalInfo({ isOpen: false, item: null })}
              />
            </CardTitle>
            <CardDescription>
              Fill in the details below to{" "}
              {item == null ? "register a new" : "edit the"} cost center.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                {error}
              </div>
            )}
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Name of your Cost Center..."
                  value={inputsData.name}
                  onChange={(e) =>
                    setInputsData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center pt-6">
            <div></div>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalInfo({ isOpen: false, item: null })}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-[137px] bg-[#0283fa]"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : `${item == null ? "Add" : "Edit"} cost center`}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
