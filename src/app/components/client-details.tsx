"use client";
import { Check, Filter, Plus } from "lucide-react";

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
import { User_Card } from "./user-card";

const data: Users[] = [
  {
    first_name: "Stratus",
    last_name: "Consulting",
    email: "connect@stratus.consulting",
    phone: "+55-11-91234-5678",
    id: 1,
  },
  {
    first_name: "Orion",
    last_name: "Systems",
    email: "info@orionsys.io",
    phone: "+1-415-555-0182",
    id: 2,
  },
  {
    first_name: "BluePeak",
    last_name: "Ltd.",
    email: "support@bluepeak.co",
    phone: "+44-20-7946-0958",
    id: 3,
  },
  {
    first_name: "Lumen",
    last_name: "Soft",
    email: "hello@lumensoft.net",
    phone: "+61-3-9123-4567",
    id: 4,
  },
  {
    first_name: "Helix",
    last_name: "Solutions",
    email: "contact@helix.solutions",
    phone: "+91-98765-12345",
    id: 5,
  },
  {
    first_name: "Apex",
    last_name: "Technologies",
    email: "team@apextech.com",
    phone: "+49-89-1234-5678",
    id: 6,
  },
  {
    first_name: "Cloud",
    last_name: "Bridge",
    email: "admin@cloudbridge.org",
    phone: "+33-1-2345-6789",
    id: 7,
  },
  {
    first_name: "Nova",
    last_name: "Edge",
    email: "contact@novaedge.ai",
    phone: "+1-202-555-0143",
    id: 8,
  },
  {
    first_name: "Quantum",
    last_name: "Leap",
    email: "support@quantumleap.dev",
    phone: "+7-495-765-4321",
    id: 9,
  },
  {
    first_name: "Pixel",
    last_name: "Drive",
    email: "info@pixeldrive.app",
    phone: "+81-70-1234-5678",
    id: 10,
  },
];

export type Users = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id: Number;
};

export function Client_Details() {
  const [tableData, setTableData] = React.useState<Users[]>(data);

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
    item: Users | null;
  }>({ isOpen: false, item: null });

  React.useEffect(() => {
    document.body.classList.toggle("overflow-hidden", modalInfo.isOpen);

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [modalInfo]);

  // columns setup
  const columns: ColumnDef<Users>[] = [
    {
      accessorKey: "first_name",
      header: "First Name",
      cell: ({ row }) => <div className="">{row.getValue("first_name")}</div>,
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
      cell: ({ row }) => <div className="">{row.getValue("last_name")}</div>,
    },

    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div className="">{row.getValue("phone")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[224px] absolute top-[-15px] right-[6px]"
            >
              <DropdownMenuItem
                onClick={() => {
                  setModalInfo({
                    isOpen: true,
                    item: user,
                  });
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Activities</DropdownMenuItem>
              <DropdownMenuItem className="text-[#c10007]">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable<Users>({
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

  return (
    <div className="w-full flex flex-col xl:gap-[26px] ">
      <h1 className="text-[30px] text-[#09090b] font-bold leading-[1.2]">
        Users
      </h1>
      <section className="flex items-center justify-between xl:mt-1">
        <Input
          placeholder="Search user..."
          value={
            (table.getColumn("first_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("first_name")?.setFilterValue(event.target.value)
          }
          className="w-[300px] xl:h-8 xl:px-3 items-center placeholder:leading-[20px]"
        />
        <Button
          variant="destructive"
          size="icon"
          className="w-[141px] h-8 px-3 flex items-center gap-2 bg-[#0283fa] cursor-pointer"
          onClick={() => {
            setModalInfo({
              isOpen: true,
              item: null,
            });
          }}
        >
          <div className="rounded-full border border-[#fff]">
            <Plus className="h-4 w-4" />
          </div>
          Add new user
        </Button>
      </section>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell>No results</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <section className="flex items-center justify-between space-x-2 xl:mt-[-10px]">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} items
        </div>
        <div className="flex items-center xl:gap-8">
          <div className=" flex items-center gap-2">
            <span className="text-sm text-[#09090b] leading-[1.43] font-500">
              Rows per page
            </span>
            <div className="w-[70px] h-8 flex items-center justify-center gap-4 border border-[#e4e4e7] bg-[#fff] rounded-[6px] shadow-sm">
              <span className="text-sm text-[#09090b] leading-[1.43] font-500">
                {pageSize}
              </span>
              <div className="flex flex-col">
                <button
                  className="mb-[-2px] cursor-pointer"
                  onClick={() => {
                    const newSize = pageSize + 1;
                    setPageSize(newSize);
                    table.setPageSize(newSize);
                  }}
                >
                  <ChevronUp className="w-3 h-3 text-[#71717a]" />
                </button>
                <button
                  className="mt-[-2px] cursor-pointer"
                  onClick={() => {
                    const newSize = Math.max(1, pageSize - 1); // Don't go below 1
                    setPageSize(newSize);
                    table.setPageSize(newSize);
                  }}
                >
                  <ChevronDown className="w-3 h-3 text-[#71717a]" />
                </button>
              </div>
            </div>
          </div>
          <span className="text-sm text-[#09090b] leading-[1.43] font-500">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                table.setPageIndex(table.getState().pagination.pageIndex - 2)
              }
              disabled={table.getState().pagination.pageIndex - 1 <= 0}
              className="relative w-8"
            >
              <div className="absolute top-1/2 left-1 -translate-y-1/2">
                <ChevronLeft />
              </div>
              <div className="absolute top-1/2 right-1 -translate-y-1/2">
                <ChevronLeft />
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="w-8"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-8"
            >
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                table.setPageIndex(table.getState().pagination.pageIndex + 2)
              }
              disabled={
                table.getState().pagination.pageIndex + 2 >=
                table.getPageCount()
              }
              className="gap-0 relative w-8"
            >
              <div className="absolute top-1/2 left-1 -translate-y-1/2">
                <ChevronRight />
              </div>
              <div className="absolute top-1/2 right-1 -translate-y-1/2">
                <ChevronRight />
              </div>
            </Button>
          </div>
        </div>
      </section>
      {modalInfo.isOpen && (
        <User_Card item={modalInfo.item} setModalInfo={setModalInfo} />
      )}
    </div>
  );
}
