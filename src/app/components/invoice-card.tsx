// ✅ UPDATED invoice-card.tsx - Removed "Process Now" button (automatic processing only)

"use client";
import * as React from "react";
import { X, Upload } from "lucide-react";

import * as invoiceService from "@/services/invoiceService";

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

interface CostCenter {
  id: string;
  name: string;
  isActive?: boolean;
  clientId?: number;
  [key: string]: any;
}

interface ExpenseType {
  id: string;
  name: string;
  costCenterId: string;
  costCenter?: any;
  isActive?: boolean;
  [key: string]: any;
}

type InvoiceCardProps = {
  costCenters: CostCenter[];
  expenseTypes: ExpenseType[];
  setModalInfo: React.Dispatch<React.SetStateAction<{ isOpen: boolean }>>;
  onRefresh?: () => Promise<void>;
};

export function InvoiceCard({
  costCenters,
  expenseTypes,
  setModalInfo,
  onRefresh,
}: InvoiceCardProps) {
  const [inputsData, setInputsData] = React.useState({
    costCenterId: "",
    expenseTypeId: "",
    expenseTypeName: "",
    type: "Debit",
  });

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isSubmittingRef = React.useRef(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const filteredExpenseTypes = inputsData.costCenterId
    ? expenseTypes.filter((et) => et.costCenterId === inputsData.costCenterId)
    : [];

  // ✅ SIMPLIFIED: Only one upload function with automatic processing
  const handleSubmit = React.useCallback(async () => {
    if (isSubmittingRef.current) {
      console.log("Submit already in progress, ignoring...");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    isSubmittingRef.current = true;

    try {
      setSaving(true);
      setError(null);

      if (
        !selectedFile ||
        !inputsData.costCenterId ||
        !inputsData.expenseTypeId
      ) {
        throw new Error(
          "Please fill in all required fields and select a file."
        );
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB.");
      }

      console.log('🚀 AUTOMATIC PROCESSING: Upload with automated data extraction...');

      // ✅ AUTOMATIC: Upload with ProcessImmediately=true for automated workflow
      const fileUploadResponse = await Promise.race([
        invoiceService.uploadInvoiceFile(
          selectedFile,
          inputsData.costCenterId,
          inputsData.expenseTypeId
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Upload timeout")), 45000)
        ),
      ]);

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error("Operation was cancelled");
      }

      if (!fileUploadResponse?.id) {
        throw new Error("File ID not returned after upload.");
      }

      console.log('✅ File uploaded - AUTOMATIC processing will extract data:', fileUploadResponse.id);

      const successMessage = `Invoice "${selectedFile.name}" uploaded successfully! Data extraction is happening automatically.`;

      setModalInfo({ isOpen: false });
      if (onRefresh) {
        await onRefresh();
      }

      console.log('✅ AUTOMATIC WORKFLOW complete:', successMessage);

    } catch (error: any) {
      console.error("Error in handleSubmit:", error);

      if (error.message === "Operation was cancelled") {
        return;
      }

      setError(error.message || "Failed to save invoice. Please try again.");
    } finally {
      setSaving(false);
      isSubmittingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [selectedFile, inputsData, setModalInfo, onRefresh]);

  const handleExpenseTypeChange = (value: string) => {
    const selected = filteredExpenseTypes.find((et) => et.id === value);
    setInputsData((prev) => ({
      ...prev,
      expenseTypeId: value,
      expenseTypeName: selected?.name || "",
    }));
  };

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isSubmittingRef.current = false;
    };
  }, []);

  const isDisabled = saving || isSubmittingRef.current;

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/15">
      <Card className="w-[500px] max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center justify-between">
            New Invoice
            <X
              className="w-4 h-4 text-[#71717a] cursor-pointer"
              onClick={() => {
                if (!isDisabled) {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                  }
                  setModalInfo({ isOpen: false });
                }
              }}
            />
          </CardTitle>
          <CardDescription>
            Fill in the details below to upload and register a new invoice.
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              ✅ Data extraction happens automatically after upload - no manual processing needed!
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-600 underline text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="costCenter">Cost Center *</Label>
              <Select
                value={inputsData.costCenterId}
                onValueChange={(value) =>
                  setInputsData((prev) => ({
                    ...prev,
                    costCenterId: value,
                    expenseTypeId: "",
                    expenseTypeName: "",
                  }))
                }
                required
                disabled={isDisabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a cost center" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters
                    .filter((center) => center.isActive !== false)
                    .map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="expenseType">Expense Type *</Label>
              <Select
                value={inputsData.expenseTypeId}
                onValueChange={handleExpenseTypeChange}
                required
                disabled={isDisabled || !inputsData.costCenterId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      inputsData.costCenterId
                        ? "Select an expense type"
                        : "Select a cost center first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredExpenseTypes
                    .filter((et) => et.isActive !== false)
                    .map((et) => (
                      <SelectItem key={et.id} value={et.id}>
                        {et.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label>Type *</Label>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="Debit"
                    checked={inputsData.type === "Debit"}
                    onChange={(e) =>
                      setInputsData((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    disabled={isDisabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Debit <span className="text-gray-500">(Expense)</span>
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="Credit"
                    checked={inputsData.type === "Credit"}
                    onChange={(e) =>
                      setInputsData((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    disabled={isDisabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Credit <span className="text-gray-500">(Income)</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="file">File Upload *</Label>
              <div className="mt-1 border border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors">
                <Input
                  id="file"
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                  }}
                  disabled={isDisabled}
                />
                <label
                  htmlFor="file"
                  className={`cursor-pointer flex flex-col items-center ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PDF, JPG, PNG up to 10MB
                  </span>
                  {selectedFile && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-md">
                      <span className="text-sm text-blue-700 font-medium">
                        Selected: {selectedFile.name}
                      </span>
                      <div className="text-xs text-blue-600 mt-1">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-6">
          <div></div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (abortControllerRef.current) {
                  abortControllerRef.current.abort();
                }
                setModalInfo({ isOpen: false });
              }}
              disabled={isDisabled}
            >
              Cancel
            </Button>
            {/* ✅ REMOVED: "Process Now" button - automatic processing only */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isDisabled}
              className="min-w-[120px] bg-[#0283fa]"
            >
              {saving ? "Uploading..." : "Add Invoice"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}