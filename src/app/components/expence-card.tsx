"use client";
import * as React from "react";
import { X } from "lucide-react";

import * as expenseTypeService from "@/services/expenseTypeService";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CostCenter,
  ExpenseType,
} from "../(project)/(private)/expense-type/expense-type-client";

type ExpenseTypeCardProps = {
  item: ExpenseType | null;
  costCenters: CostCenter[];
  setModalInfo: React.Dispatch<
    React.SetStateAction<{ isOpen: boolean; item: ExpenseType | null }>
  >;
  onRefresh?: () => Promise<void>;
};

export function ExpenseTypeCard({
  item,
  costCenters,
  setModalInfo,
  onRefresh,
}: ExpenseTypeCardProps) {
  const [inputsData, setInputsData] = React.useState({
    name: item?.name || "",
    costCenterId: item?.costCenterId || "",
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!inputsData.name || !inputsData.costCenterId) {
      setError("Name and Cost Center are required");
      setSaving(false);
      return;
    }

    const apiData = {
      name: inputsData.name,
      costCenterId: inputsData.costCenterId,
    };

    try {
      if (item == null) {
        await expenseTypeService.createExpenseType(apiData);
      } else {
        const updateData = {
          id: item.id,
          name: inputsData.name,
          costCenterId: inputsData.costCenterId,
        };
        await expenseTypeService.updateExpenseType(item.id, updateData);
      }

      setModalInfo({ isOpen: false, item: null });
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
      setError(
        error.message || "Failed to save expense type. Please try again."
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
              {item == null ? "New" : "Edit"} Expense Type
              <X
                className="w-4 h-4 text-[#71717a] cursor-pointer"
                onClick={() => setModalInfo({ isOpen: false, item: null })}
              />
            </CardTitle>
            <CardDescription>
              Fill in the details below to{" "}
              {item == null ? "register a new" : "edit the"} expense type.
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
                  placeholder="Name of your Expense Type..."
                  value={inputsData.name}
                  onChange={(e) =>
                    setInputsData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  disabled={saving}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="costCenter">Cost Center *</Label>
                <Select
                  value={inputsData.costCenterId}
                  onValueChange={(value) =>
                    setInputsData((prev) => ({ ...prev, costCenterId: value }))
                  }
                  required
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a cost center" />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenters.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  : `${item == null ? "Add" : "Edit"} expense type`}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
