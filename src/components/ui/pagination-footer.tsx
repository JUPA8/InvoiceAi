"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationFooterProps {
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function PaginationFooter({
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PaginationFooterProps) {

  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const itemsOnPage = Math.min(
    rowsPerPage,
    totalItems - (currentPage - 1) * rowsPerPage
  );
  const buttonClass = "w-8 h-8 border rounded-md text-sm cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center justify-center";


  return (
    <div className="flex justify-between items-center px-4 py-3 text-sm ">
      <div>Showing {itemsOnPage} of {totalItems} items</div>

      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            onRowsPerPageChange(Number(e.target.value));
            onPageChange(1); 
          }}
          className="px-2 py-1 border rounded-md text-sm cursor-pointer"
        >
          {[10, 25, 50].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className={buttonClass}
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          className={buttonClass}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
         className={buttonClass}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

         <button
         className={buttonClass}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
