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
import { Client_Card } from "./client-card";

const clients: Clients[] = [
  {
    name: "Stratus Consulting",
    email: "connect@stratus.consulting",
    phone_number: "+55-11-91234-5678",
    timezone: "-3",
    status: "Active",
    id: 1,
  },
  {
    name: "Orion Systems",
    email: "info@orionsys.io",
    phone_number: "+1-415-555-0182",
    timezone: "-8",
    status: "Active",
    id: 2,
  },
  {
    name: "BluePeak Ltd.",
    email: "support@bluepeak.co",
    phone_number: "+44-20-7946-0958",
    timezone: "+0",
    status: "Inactive",
    id: 3,
  },
  {
    name: "LumenSoft",
    email: "hello@lumensoft.net",
    phone_number: "+61-3-9123-4567",
    timezone: "+10",
    status: "Inactive",
    id: 4,
  },
  {
    name: "Helix Solutionsssssssssssssssssssssssssssssssss ddddd ddddd ddd",
    email: "contact@helix.solutions",
    phone_number: "+91-98765-12345",
    timezone: "+5.5",
    status: "Active",
    id: 5,
  },
  {
    name: "Apex Technologies",
    email: "team@apextech.com",
    phone_number: "+49-89-1234-5678",
    timezone: "+1",
    status: "Active",
    id: 6,
  },
  {
    name: "CloudBridge",
    email: "admin@cloudbridge.org",
    phone_number: "+33-1-2345-6789",
    timezone: "+1",
    status: "Inactive",
    id: 7,
  },
  {
    name: "Nova Edge",
    email: "contact@novaedge.ai",
    phone_number: "+1-202-555-0143",
    timezone: "-5",
    status: "Inactive",
    id: 8,
  },
  {
    name: "Quantum Leap",
    email: "support@quantumleap.dev",
    phone_number: "+7-495-765-4321",
    timezone: "+3",
    status: "Active",
    id: 9,
  },
  {
    name: "PixelDrive",
    email: "info@pixeldrive.app",
    phone_number: "+81-70-1234-5678",
    timezone: "+9",
    status: "Inactive",
    id: 10,
  },
];

export type Clients = {
  name: string;
  email: string;
  phone_number: string;
  timezone: string;
  status: string;
  id: Number;
};

type ClientDetailProps = {
  clientID: string;
};

export function Clinet_Table({ clientID }: ClientDetailProps) {
  const [selectedClient, setSelectedClient] = React.useState<
    Clients | undefined
  >(() => clients.find((e: Clients) => e.id === Number(clientID)));
  const [tableData, setTableData] = React.useState<Clients[]>(
    selectedClient ? [selectedClient] : []
  );
  console.log(selectedClient);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);

  // columns setup
  const columns: ColumnDef<Clients>[] = [
    {
      accessorKey: "name",
      header: "Client Name",
      cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      cell: ({ row }) => <div className="">{row.getValue("phone_number")}</div>,
    },
    {
      accessorKey: "timezone",
      header: "Timezone Offset",
      cell: ({ row }) => <div className="">{row.getValue("timezone")}</div>,
    },
    {
      accessorKey: "status",
      header: "Statust",
      cell: ({ row }) => <div className="">{row.getValue("status")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const client = row.original;
        return <div className="w-[30px]"></div>;
      },
    },
  ];

  const table = useReactTable<Clients>({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full flex flex-col gap-[11px] ">
      <h1 className="text-[30px] text-[#09090b] font-bold leading-[1.2]">
        Clients Details
      </h1>
      <div className="rounded-md border px-[13px] pt-[14px] pb-[15px]">
        <Table className="px-[13px] pt-[14px] pb-[15px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="pb-[6.5px]">
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
                <TableRow key={row.id} className="border-b-0">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="pt-[6.5px]">
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
    </div>
  );
}
