
"use client";

import {  
    LayoutDashboard,
    FileSpreadsheet,
    FolderPen,
    Calculator,
    Tag, 
    UsersRound,
    KeySquare,
    Settings,
    ChevronsUpDown,
    User ,
    ArrowLeftToLine
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col justify-between">
      <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <User className="w-8 h-8 text-gray-700" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold">John Doe</span>
            <p className="text-sm text-gray-500">johndoe@example.com</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => console.log("Chevron clicked")}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          <ChevronsUpDown className="w-4 h-4" />
        </button>
      </div>

         <h2 className="mb-4 text-sm  text-gray-500  tracking-wide">
          Workspace
        </h2>

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start cursor-pointer">
            <LayoutDashboard className="mr-2 w-4 h-4" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start cursor-pointer">
            <FileSpreadsheet className="mr-2 w-4 h-4" /> Invoices
          </Button>
           {/* <Button variant="ghost" className="w-full justify-start cursor-pointer">
            <FolderPen className="mr-2 w-4 h-4" /> Projects
          </Button> */}
           <Button variant="ghost" className="w-full justify-start cursor-pointer">
            <Calculator className="mr-2 w-4 h-4" /> Cost centers
          </Button>
          <Button variant="ghost" className="w-full justify-start cursor-pointer">
            <Tag className="mr-2 w-4 h-4" /> Expense type
          </Button>
        </nav>

         <h2 className="mt-6 mb-4 text-sm  text-gray-500  tracking-wide">
          Administration
        </h2>

         <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start cursor-pointer">
            <UsersRound className="mr-2 w-4 h-4" /> Clients
          </Button>
          <Button variant="ghost" className="w-full justify-start cursor-pointer">
            <KeySquare className="mr-2 w-4 h-4" /> API Keys
          </Button>
           <Button variant="ghost" className="w-full justify-start cursor-pointer">
            <Settings className="mr-2 w-4 h-4" /> Settings
          </Button>
           
        </nav>

      </div>
       <div className="mt-10 mb-10">
        <Button
          variant="ghost"
          className="w-full justify-start text-black-600 hover:text-black-800 cursor-pointer"
          onClick={() => console.log("Logout clicked")}
        >
          <ArrowLeftToLine className="mr-2 w-4 h-4" /> Logout
        </Button>
      </div>
    </aside>
  );
}
