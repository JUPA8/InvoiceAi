"use client";
import {
  Check,
  ClipboardList,
  Plus,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Building,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import * as expenseTypeService from "@/services/expenseTypeService";
import { ExpenseTypeCard } from "@/app/components/expence-card";

export type ExpenseType = {
  id: string;
  name: string;
  costCenter: string;
  costCenterId: string;
  createdAt: string;
  isActive?: boolean;
};

export type CostCenter = {
  id: string;
  name: string;
  isActive: boolean;
};

export function ExpenseTypeClient() {
  const [clientId, setClientId] = React.useState<string>("");
  const [expenseTypes, setExpenseTypes] = React.useState<ExpenseType[]>([]);
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [modalInfo, setModalInfo] = React.useState<{
    isOpen: boolean;
    item: ExpenseType | null;
  }>({ isOpen: false, item: null });

  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(0);

  React.useEffect(() => {
    const getClientId = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const session = await response.json();
          setClientId(session.clientId || "");
        } else {
          setError("Could not load user session.");
          setLoading(false);
        }
      } catch {
        setError("Error fetching user session.");
        setLoading(false);
      }
    };
    getClientId();
  }, []);

  const loadData = React.useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [expenseTypesData, costCentersData] = await Promise.all([
        expenseTypeService.getAllExpenseTypesForClient(clientId),
        expenseTypeService.getCostCenters(clientId),
      ]);

      const mappedExpenseTypes: ExpenseType[] = expenseTypesData
        .filter((e: any) => e.isActive !== false)
        .map((e: any) => ({
          id: e.id,
          name: e.name,
          costCenter: e.costCenter?.name || "N/A",
          costCenterId: e.costCenterId,
          createdAt: e.createdDate
            ? new Date(e.createdDate).toISOString().split("T")[0]
            : "",
          isActive: e.isActive,
        }));

      const activeCostCenters = costCentersData.filter(
        (cc: any) => cc.isActive
      );

      setExpenseTypes(mappedExpenseTypes);
      setCostCenters(activeCostCenters);
    } catch (error: any) {
      setError(error.message || "Failed to load expense types.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  React.useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId, loadData]);

  React.useEffect(() => {
    document.body.classList.toggle("overflow-hidden", modalInfo.isOpen);
  }, [modalInfo.isOpen]);

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return expenseTypes;
    return expenseTypes.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.costCenter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenseTypes, searchTerm]);

  const paginatedData = React.useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < totalPages - 1;

  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const handleDelete = React.useCallback(
    async (item: ExpenseType) => {
      if (!clientId) return;
      if (!confirm(`Delete "${item.name}"?`)) return;

      try {
        setError(null);
        await expenseTypeService.deleteExpenseType(item.costCenterId, item.id);
        await loadData();
      } catch (error: any) {
        setError(error.message || "Failed to delete expense type.");
      }
    },
    [clientId, loadData]
  );

  const handleRefresh = React.useCallback(() => {
    loadData();
  }, [loadData]);

  const stats = React.useMemo(
    () => ({
      total: expenseTypes.length,
      costCentersInUse: new Set(expenseTypes.map((item) => item.costCenter))
        .size,
      active: expenseTypes.filter((item) => item.isActive !== false).length,
    }),
    [expenseTypes]
  );

  return (
    <div className="flex-1 p-8 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expense Types</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-800 border-red-300"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Total Expense Types
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <ClipboardList size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Cost Centers in Use
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.costCentersInUse}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Building size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Active Types
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Check size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search expense types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 h-10 bg-white border-gray-300"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setModalInfo({ isOpen: true, item: null });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            New Expense Type
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={48} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Cost Center
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Created At
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <TableCell className="py-2">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-gray-700">{item.costCenter}</div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-gray-700">{item.createdAt}</div>
                      </TableCell>
                      <TableCell className="py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[200px]"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setModalInfo({ isOpen: true, item });
                              }}
                              className="cursor-pointer"
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => handleDelete(item)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-gray-500"
                    >
                      No expense types found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">
                Showing {paginatedData.length} of {filteredData.length} expense
                types
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    Rows per page
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(0);
                    }}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Page {currentPage + 1} of {totalPages || 1}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(0)}
                    disabled={!canPreviousPage}
                    className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
                    title="First page"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!canPreviousPage}
                    className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
                    title="Previous page"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!canNextPage}
                    className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
                    title="Next page"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={!canNextPage}
                    className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
                    title="Last page"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {modalInfo.isOpen && (
        <ExpenseTypeCard
          item={modalInfo.item}
          costCenters={costCenters}
          setModalInfo={setModalInfo}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
