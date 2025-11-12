"use client";
import {
  Check,
  Filter,
  Plus,
  RefreshCw,
  Share,
  Loader2,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client_Card } from "./client-card";
import { useRouter } from "next/navigation";
import { fetchData } from "../actions/fetching";

// const data: Clients[] = [
//   {
//     name: "Stratus Consulting",
//     email: "connect@stratus.consulting",
//     phone_number: "+55-11-91234-5678",
//     timezone: "-3",
//     status: "Active",
//     id: 1,
//   },
//   {
//     name: "Orion Systems",
//     email: "info@orionsys.io",
//     phone_number: "+1-415-555-0182",
//     timezone: "-8",
//     status: "Active",
//     id: 2,
//   },
//   {
//     name: "BluePeak Ltd.",
//     email: "support@bluepeak.co",
//     phone_number: "+44-20-7946-0958",
//     timezone: "+0",
//     status: "Inactive",
//     id: 3,
//   },
//   {
//     name: "LumenSoft",
//     email: "hello@lumensoft.net",
//     phone_number: "+61-3-9123-4567",
//     timezone: "+10",
//     status: "Inactive",
//     id: 4,
//   },
//   {
//     name: "Helix Solutions",
//     email: "contact@helix.solutions",
//     phone_number: "+91-98765-12345",
//     timezone: "+5.5",
//     status: "Active",
//     id: 5,
//   },
//   {
//     name: "Apex Technologies",
//     email: "team@apextech.com",
//     phone_number: "+49-89-1234-5678",
//     timezone: "+1",
//     status: "Active",
//     id: 6,
//   },
//   {
//     name: "CloudBridge",
//     email: "admin@cloudbridge.org",
//     phone_number: "+33-1-2345-6789",
//     timezone: "+1",
//     status: "Inactive",
//     id: 7,
//   },
//   {
//     name: "Nova Edge",
//     email: "contact@novaedge.ai",
//     phone_number: "+1-202-555-0143",
//     timezone: "-5",
//     status: "Inactive",
//     id: 8,
//   },
//   {
//     name: "Quantum Leap",
//     email: "support@quantumleap.dev",
//     phone_number: "+7-495-765-4321",
//     timezone: "+3",
//     status: "Active",
//     id: 9,
//   },
//   {
//     name: "PixelDrive",
//     email: "info@pixeldrive.app",
//     phone_number: "+81-70-1234-5678",
//     timezone: "+9",
//     status: "Inactive",
//     id: 10,
//   },
// ];

export type Clients = {
  name: string;
  email: string;
  phone_number: string;
  timezone: string;
  status: string;
  id: number;
};

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  loading?: boolean;
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
          <div
            className={`text-2xl font-bold flex items-center gap-2 ${color}`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : value}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );
}

export function Clients(data) {
  const [tableData, setTableData] = React.useState<Clients[]>(
    data.clients.data.map((client: any) => ({
      ...client, // keep all existing fields
      name: client.name,
      email: "no-email@example.com", // Provide a default or empty value if not available
      phone_number: "N/A", // Provide a default or empty value
      timezone: client.timezoneOffset ?? 0, // Or map as you want
      status: client.isActive ? "Active" : "Inactive",
    }))
  );

  console.log(data.clients.data);

  const [loading, setLoading] = React.useState(false);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);

  const [modalInfo, setModalInfo] = React.useState<{
    isOpen: boolean;
    item: Clients | null;
  }>({ isOpen: false, item: null });

  React.useEffect(() => {
    document.body.classList.toggle("overflow-hidden", modalInfo.isOpen);

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [modalInfo]);

  const router = useRouter();

  // Enhanced columns setup with better styling
  const columns: ColumnDef<Clients>[] = [
    {
      accessorKey: "name",
      header: "Client Name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-gray-700">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      cell: ({ row }) => (
        <div className="text-gray-700 font-mono text-sm">
          {row.getValue("phone_number")}
        </div>
      ),
    },
    {
      accessorKey: "timezone",
      header: "Timezone",
      cell: ({ row }) => {
        const timezone = row.getValue("timezone") as string;
        return (
          <div className="text-gray-700">
            UTC{timezone[0] == "-" ? "" : "+"}
            {timezone}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
              status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const client = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem
                onClick={() => {
                  setModalInfo({
                    isOpen: true,
                    item: client,
                  });
                }}
                className="cursor-pointer"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/clients/${client.id}`)}
                className="cursor-pointer"
              >
                Details
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 cursor-pointer">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable<Clients>({
    data: tableData,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
  });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    const csvContent = [
      ["Client Name", "Email", "Phone Number", "Timezone", "Status"],
      ...tableData.map((client) => [
        client.name,
        client.email,
        client.phone_number,
        client.timezone,
        client.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: tableData ? tableData.length : 0,
    active:
      tableData.length > 0
        ? tableData.filter((client) => client.status === "Active").length
        : 0,
    inactive:
      tableData.length > 0
        ? tableData.filter((client) => client.status === "Inactive").length
        : 0,
  };

  const statsData = [
    {
      title: "Total Clients",
      value: loading ? "..." : stats.total.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      loading,
    },
    {
      title: "Active Clients",
      value: loading ? "..." : stats.active.toString(),
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      loading,
    },
    {
      title: "Inactive Clients",
      value: loading ? "..." : stats.inactive.toString(),
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
      loading,
    },
  ];

  return (
    <div className="flex-1 p-8 bg-white min-h-screen">
      {/* Header with Clients Title and Refresh Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
            loading={stat.loading}
          />
        ))}
      </div>

      {/* Controls Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search clients..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="w-80 h-10 bg-white border-gray-300"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Share size={16} />
            Export
          </button>

          <button
            onClick={() => {
              setModalInfo({
                isOpen: true,
                item: null,
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add New Client
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={48} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className="font-semibold text-gray-700"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-gray-500"
                    >
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Table Footer with Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">
                Showing{" "}
                {Math.min(pageSize, table.getFilteredRowModel().rows.length)} of{" "}
                {table.getFilteredRowModel().rows.length} clients
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    Rows per page
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setPageSize(newSize);
                      table.setPageSize(newSize);
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
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalInfo.isOpen && (
        <Client_Card item={modalInfo.item} setModalInfo={setModalInfo} />
      )}
    </div>
  );
}
