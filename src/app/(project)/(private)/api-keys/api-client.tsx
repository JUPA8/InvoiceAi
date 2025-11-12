"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  KeyRound,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  PlusCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  Copy,
} from "lucide-react";
import { ApiKey, ApiKeyStats } from "./page";
import {
  createKeyAction,
  deleteKeyAction,
  refreshKeysAction,
  revokeKeyAction,
} from "@/app/actions/apiKeyActions";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : children}
    </button>
  );
}

export function ApiKeyClient({
  data,
  stats,
}: {
  data: ApiKey[];
  stats: ApiKeyStats;
}) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showActionDropdown, setShowActionDropdown] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, startRefreshTransition] = useTransition();

  const [createFormState, formAction] = useFormState(createKeyAction, {
    success: false,
    message: "",
  });
  const formRef = React.useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (createFormState.success) {
      setIsModalOpen(false);
      formRef.current?.reset();
    }
  }, [createFormState]);

  useEffect(() => {
    const handleClickOutside = () => setShowActionDropdown(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredKeys = data.filter((key) =>
    key.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedKeys = filteredKeys.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredKeys.length / rowsPerPage);

  const handleRefresh = () => {
    startRefreshTransition(() => {
      refreshKeysAction();
    });
  };

  return (
    <div className="space-y-6 flex-1 p-8 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-500 mt-1">Manage and track your API Keys.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm">Total Keys</div>
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm">Revoked</div>
          <div className="text-2xl font-bold text-red-600">{stats.revoked}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm">Created Today</div>
          <div className="text-2xl font-bold">{stats.createdToday}</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by key name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-700"
        >
          <PlusCircle size={16} /> Create new API key
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                API Key
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Is Revoked
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedKeys.map((key) => (
              <tr key={key.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {key.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                  <div className="flex items-center gap-2">
                    <span>{key.displayKey}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(key.key)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {key.isRevoked ? (
                    <span className="text-red-600">Yes</span>
                  ) : (
                    "No"
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {new Date(key.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionDropdown(
                          showActionDropdown === key.id ? null : key.id
                        );
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {showActionDropdown === key.id && (
                      <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="py-1">
                          <form
                            action={() =>
                              revokeKeyAction(key.id, key.isRevoked)
                            }
                            className="w-full"
                          >
                            <button
                              type="submit"
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {key.isRevoked ? "Un-revoke Key" : "Revoke Key"}
                            </button>
                          </form>
                          <form
                            action={deleteKeyAction.bind(null, key.id)}
                            className="w-full"
                          >
                            <button
                              type="submit"
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500">
            Showing {paginatedKeys.length} of {filteredKeys.length} items
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                Rows per page
              </span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="text-sm font-medium text-gray-900">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-lg w-96 border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Create new API Key
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Give your new key a descriptive name. The key value will be
              generated automatically.
            </p>
            <form action={formAction} ref={formRef}>
              <div className="mt-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Key Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., My Awesome App Key"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {!createFormState.success && createFormState.message && (
                <p className="text-red-500 text-sm mt-2">
                  {createFormState.message}
                </p>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <SubmitButton>Create Key</SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
