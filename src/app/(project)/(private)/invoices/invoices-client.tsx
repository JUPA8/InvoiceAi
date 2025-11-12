// ✅ COMPLETE CORRECTED invoices-client.tsx - All updates and fixes applied

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

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

import { processInvoiceAction } from "@/app/actions/invoiceActions";
import { InvoiceCard } from "@/app/components/invoice-card";
import { InvoiceDetailsModal } from "@/app/components/invoice-details-modal";
import * as invoiceService from "@/services/invoiceService";

import type { FileMetadata } from "@/types/invoice";
import type { Invoice } from "@/types/invoice";
import type { CostCenter } from "@/types/invoice";
import type { ExpenseType } from "@/types/invoice";

const FileStatus = {
  NOT_SET: -2,
  SKIPPED: -1,
  NEW: 0,
  PROCESSING: 1,
  FAILED: 2,
  COMPLETED: 3  // Status 3 = Processed
} as const;

// ✅ UPDATED: Fixed status display function
const getStatusDisplay = (status: number | undefined) => {
  const safeStatus = status ?? FileStatus.NOT_SET;
  
  switch (safeStatus) {
    case FileStatus.COMPLETED: // Status 3 = Successfully Processed
      return { 
        label: "Processed",
        color: "green",
        icon: CheckCircle,
        bgClass: "bg-green-100",
        textClass: "text-green-800"
      };
    case FileStatus.PROCESSING: // Status 1 = Currently Processing
      return { 
        label: "Processing", 
        color: "blue",
        icon: Clock,
        bgClass: "bg-blue-100",
        textClass: "text-blue-800"
      };
    case FileStatus.FAILED: // Status 2 = Failed Processing
      return { 
        label: "Failed", 
        color: "red",
        icon: XCircle,
        bgClass: "bg-red-100",
        textClass: "text-red-800"
      };
    case FileStatus.SKIPPED: // Status -1 = Skipped
      return { 
        label: "Skipped", 
        color: "gray",
        icon: AlertTriangle,
        bgClass: "bg-gray-100",
        textClass: "text-gray-800"
      };
    case FileStatus.NEW: // Status 0 = New/Pending
      return { 
        label: "Pending",
        color: "yellow",
        icon: AlertCircle,
        bgClass: "bg-yellow-100",
        textClass: "text-yellow-800"
      };
    case FileStatus.NOT_SET: // Status -2 = Not Set
    default:
      return { 
        label: "Pending", 
        color: "yellow",
        icon: AlertCircle,
        bgClass: "bg-yellow-100",
        textClass: "text-yellow-800"
      };
  }
};

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

interface InvoicesClientProps {
  initialInvoices: Invoice[];
  initialCostCenters: CostCenter[];
  initialExpenseTypes: ExpenseType[];
}

function InvoicesClient({
  initialInvoices,
  initialCostCenters,
  initialExpenseTypes,
}: InvoicesClientProps) {
  const [clientId, setClientId] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(
    initialCostCenters || []
  );
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>(
    initialExpenseTypes || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalInfo, setModalInfo] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  const [detailsModalInfo, setDetailsModalInfo] = useState<{
    isOpen: boolean;
    invoice: Invoice | null;
  }>({ isOpen: false, invoice: null });

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  
  const [processingInvoices, setProcessingInvoices] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const getClientId = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const session = await response.json();
          setClientId(session.clientId || "");
        } else {
          setError("Could not load user session.");
        }
      } catch (error) {
        setError("Error fetching user session.");
      }
    };
    getClientId();
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { 
      ...notification, 
      id, 
      timestamp: new Date() 
    }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  };

  // ✅ CORRECTED: loadData function with team leader approach
  const loadData = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading invoices (TEAM LEADER APPROACH - single efficient call)...');

      // ✅ RULE #4: Make ONE call to get invoices using /api/Invoices
      const invoicesData = await invoiceService.getInvoices();
      
      console.log('📊 Raw invoices loaded:', invoicesData.length);

      // ✅ FIXED: Don't make individual API calls for each invoice - use data from main response
      const processedInvoices = invoicesData.map((invoice: any) => {
        const name = invoice.invoiceNo || 
                     invoice.invoice_no || 
                     invoice.name ||
                     `Invoice-${invoice.id?.slice(-8)}`;

        // ✅ TEAM LEADER APPROACH: Use data that's already in the response
        return {
          ...invoice,
          name,
          expenseType: "N/A", // Get from classification later if needed
          costCenterName: "N/A", // Get from classification later if needed
          
          // ✅ CRITICAL: Preserve all invoice data that's already extracted by the API
          companyName: invoice.companyName || invoice.company_name || "N/A",
          invoiceNo: invoice.invoiceNo || invoice.invoice_no || "N/A", 
          total: invoice.total || 0,
          items: invoice.items || [],
          
          // ✅ RULE #5: extraData is where AI extracted data is stored
          extraData: invoice.extraData || {},
          
          // ✅ Status is already included in the API response
          file: invoice.file || null
        };
      });

      console.log('✅ Processed invoices with team leader approach:', processedInvoices.length);

      setInvoices(processedInvoices);

    } catch (error: any) {
      console.error('❌ Loading error:', error);
      setError(error.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId, loadData]);

  // ✅ UPDATED: Retry processing function (for failed invoices only)
  const handleRetryProcessing = async (invoice: Invoice) => {
    const fileId = invoice.fileId || invoice.id;
    if (!fileId) {
      addNotification({
        type: 'error',
        title: 'Retry Error',
        message: "No file ID found for retry processing"
      });
      return;
    }

    console.log(`🔄 Retrying processing for failed invoice: ${fileId}`);
    
    setProcessingInvoices(prev => new Set([...prev, fileId]));

    try {
      const result = await processInvoiceAction(fileId);
      
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Retry Successful',
          message: 'Invoice retry processing completed successfully! Data has been extracted.'
        });
        
        // Refresh data to show updated status
        setTimeout(async () => {
          await loadData();
        }, 2000);
        
      } else {
        throw new Error(result.message || 'Retry processing failed');
      }

    } catch (error: any) {
      console.error('❌ Retry processing error:', error);
      
      let errorMessage = error.message || "Failed to retry processing.";
      
      addNotification({
        type: 'error',
        title: 'Retry Failed',
        message: errorMessage
      });

      setError(errorMessage);
    } finally {
      setProcessingInvoices(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  // ✅ FIXED: handleViewDetails function with correct workflow
  const handleViewDetails = async (invoice: Invoice) => {
    try {
      console.log('🔍 Fetching detailed invoice data using INVOICE ID:', invoice.id);
      
      // ✅ RULE #4: Use invoice.id (INVOICE ID) not fileId
      const detailedInvoice = await invoiceService.getInvoice(invoice.id);
      
      if (!detailedInvoice) {
        throw new Error('Invoice details not found');
      }

      // Get file metadata to check actual status
      let fileData = detailedInvoice.file;
      let actualStatus = fileData?.status;
      
      console.log('🔍 Detailed invoice file status:', {
        invoiceId: invoice.id,
        fileStatus: actualStatus,
        company: detailedInvoice.companyName || detailedInvoice.company_name,
        total: detailedInvoice.total,
        hasExtraData: !!detailedInvoice.extraData
      });
      
      // Get classification data
      let expenseTypeName = "N/A";
      let costCenterName = "N/A";
      let costCenterId: string | null = null;
      let expenseTypeId: string | null = null;

      costCenterId = (fileData?.costCenterId || 
                    detailedInvoice.costCenterId || 
                    invoice.costCenterId || 
                    invoice.file?.costCenterId || null) as string | null;
                    
      expenseTypeId = (fileData?.expenseTypeId || 
                     detailedInvoice.expenseTypeId || 
                     invoice.expenseTypeId || 
                     invoice.file?.expenseTypeId || null) as string | null;
      
      // Get cost center name
      if (costCenterId) {
        const foundCostCenter = costCenters.find((cc: any) => 
          String(cc.id) === String(costCenterId)
        );
        if (foundCostCenter) {
          costCenterName = foundCostCenter.name;
        }
      }
      
      // Get expense type name
      if (expenseTypeId) {
        const foundExpenseType = expenseTypes.find((et: any) => 
          String(et.id) === String(expenseTypeId)
        );
        if (foundExpenseType) {
          expenseTypeName = foundExpenseType.name;
        }
      }

      // ✅ FIXED: Create complete invoice data with proper property mapping
      const completeInvoiceData: Invoice = {
        ...detailedInvoice,
        
        // ✅ FIXED: Normalize property names (prefer camelCase, fallback to snake_case)
        companyName: detailedInvoice.companyName || detailedInvoice.company_name || "N/A",
        invoiceNo: detailedInvoice.invoiceNo || detailedInvoice.invoice_no || "N/A",
        invoiceDate: detailedInvoice.invoiceDate || detailedInvoice.invoice_date,
        address: detailedInvoice.address,
        taxNumber: detailedInvoice.taxNumber || detailedInvoice.tax_number,
        branch: detailedInvoice.branch,
        subtotal: detailedInvoice.subtotal || 0,
        totalTax: detailedInvoice.totalTax || detailedInvoice.total_tax || 0,
        total: detailedInvoice.total || 0,
        paymentMethod: detailedInvoice.paymentMethod || detailedInvoice.payment_method,
        items: detailedInvoice.items || [],
        
        // ✅ RULE #5: Properly handle extraData (this is where AI extracted data is stored!)
        extraData: detailedInvoice.extraData || {},
        genuinityRank: detailedInvoice.genuinityRank,
        
        // Classification data
        expenseType: expenseTypeName,
        costCenterName: costCenterName,
        costCenterId: costCenterId,
        expenseTypeId: expenseTypeId,
        
        // ✅ CRITICAL: File information with correct status
        file: {
          ...fileData,
          status: actualStatus, // Use the actual status from the detailed response
          fileName: fileData?.fileName || detailedInvoice.file?.fileName || "Unknown file",
          costCenterId: costCenterId,
          expenseTypeId: expenseTypeId
        },
        
        name: fileData?.fileName || 
              detailedInvoice.invoiceNo || 
              detailedInvoice.invoice_no ||
              detailedInvoice.name || 
              "Unnamed Invoice",
              
        // ✅ BACKWARD COMPATIBILITY: Keep snake_case versions
        company_name: detailedInvoice.companyName || detailedInvoice.company_name,
        invoice_no: detailedInvoice.invoiceNo || detailedInvoice.invoice_no,
        invoice_date: detailedInvoice.invoiceDate || detailedInvoice.invoice_date,
        tax_number: detailedInvoice.taxNumber || detailedInvoice.tax_number,
        total_tax: detailedInvoice.totalTax || detailedInvoice.total_tax,
        payment_method: detailedInvoice.paymentMethod || detailedInvoice.payment_method
      };

      setDetailsModalInfo({
        isOpen: true,
        invoice: completeInvoiceData,
      });
      
    } catch (error: any) {
      console.error('❌ Error loading invoice details:', error);
      
      addNotification({
        type: 'error',
        title: 'Error Loading Details',
        message: error.message || "Failed to fetch invoice details."
      });
      
      const fallbackExpenseType = getExpenseTypeName(invoice.expenseTypeId || "", expenseTypes);
      const fallbackCostCenter = getCostCenterName(invoice.costCenterId || "", costCenters);
      
      setDetailsModalInfo({ 
        isOpen: true, 
        invoice: {
          ...invoice,
          expenseType: fallbackExpenseType,
          costCenterName: fallbackCostCenter,
        }
      });
    }
  };

  const handleRefresh = useCallback(() => {
    addNotification({
      type: 'info',
      title: 'Refreshing',
      message: 'Checking for processing updates...'
    });
    loadData();
  }, [loadData]);

  // Rest of component logic
  const filteredInvoices = React.useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter(
      (invoice) =>
        (invoice.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.companyName || invoice.company_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.expenseType || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  const paginatedInvoices = React.useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredInvoices.slice(startIndex, startIndex + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < totalPages - 1;

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // ✅ UPDATED: Stats calculation with correct status handling
  const stats = React.useMemo(
    () => ({
      total: invoices.length,
      processed: invoices.filter((i) => i && (i.file?.status ?? FileStatus.NOT_SET) === FileStatus.COMPLETED).length, // Status 3
      processing: invoices.filter((i) => i && (i.file?.status ?? FileStatus.NOT_SET) === FileStatus.PROCESSING).length, // Status 1
      pending: invoices.filter((i) => i && (!i.file || 
        (i.file.status ?? FileStatus.NOT_SET) === FileStatus.NEW || 
        (i.file.status ?? FileStatus.NOT_SET) === FileStatus.NOT_SET
      )).length, // Status 0 or -2
      failed: invoices.filter((i) => i && (i.file?.status ?? FileStatus.NOT_SET) === FileStatus.FAILED).length, // Status 2
      skipped: invoices.filter((i) => i && (i.file?.status ?? FileStatus.NOT_SET) === FileStatus.SKIPPED).length, // Status -1
    }),
    [invoices]
  );

  const getExpenseTypeName = (expenseTypeId: string, expenseTypesList: any[]) => {
    if (!expenseTypeId || !Array.isArray(expenseTypesList)) {
      return "N/A";
    }
    
    const expenseType = expenseTypesList.find((et) => {
      return et.id === expenseTypeId || 
             et.id === String(expenseTypeId) || 
             String(et.id) === String(expenseTypeId);
    });
    
    return expenseType?.name || "N/A";
  };

  const getCostCenterName = (costCenterId: string, costCentersList: any[]) => {
    if (!costCenterId || !Array.isArray(costCentersList)) {
      return "N/A";
    }
    
    const costCenter = costCentersList.find((cc) => {
      return cc.id === costCenterId || 
             cc.id === String(costCenterId) || 
             String(cc.id) === String(costCenterId);
    });
    
    return costCenter?.name || "N/A";
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="flex-1 p-8 bg-white min-h-screen">
      {/* Custom Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`w-96 border rounded-lg p-4 shadow-lg transition-all duration-300 ${
              notification.type === 'success' ? 'border-green-200 bg-green-50' :
              notification.type === 'error' ? 'border-red-200 bg-red-50' :
              notification.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                 notification.type === 'error' ? <XCircle className="h-4 w-4 text-red-600" /> :
                 notification.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                 <AlertCircle className="h-4 w-4 text-blue-600" />}
              </div>
              <div className="flex-1">
                <h5 className="mb-1 font-medium leading-none tracking-tight">
                  {notification.title}
                </h5>
                <div className="text-sm">
                  {notification.message}
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
            💡 Tip: Data extraction happens automatically after upload
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Total Invoices
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Processed
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.processed}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Processing
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.processing}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Clock size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Pending
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <AlertCircle size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Failed
              </div>
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Skipped
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {stats.skipped}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <RefreshCw size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 h-10 bg-white border-gray-300"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalInfo({ isOpen: true })}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            New Invoice
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 size={48} className="animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading invoice data and checking statuses...</p>
            </div>
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
                    Expense Type
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Date Added
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => {
                    const statusInfo = getStatusDisplay(invoice.file?.status);
                    const fileId = invoice.fileId || invoice.id;
                    const isProcessing = processingInvoices.has(fileId);
                    const isProcessed = (invoice.file?.status ?? FileStatus.NOT_SET) === FileStatus.COMPLETED;

                    return (
                      <TableRow
                        key={invoice.id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <TableCell className="py-4">
                          <div className="font-medium text-gray-900">
                            {invoice.name || "Unnamed Invoice"}
                          </div>
                          {isProcessing && (
                            <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Processing...
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-gray-700">
                            {invoice.expenseType}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              invoice.invoiceType === 2
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {invoice.invoiceType === 2 ? "Debit" : "Credit"}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-gray-700">
                            {(() => {
                              // ✅ FIXED: Always show system creation date (when added to system)
                              const systemCreatedDate = invoice.createdDate;
                              
                              if (!systemCreatedDate) return "N/A";
                              
                              try {
                                const date = new Date(systemCreatedDate);
                                if (isNaN(date.getTime())) {
                                  return "N/A";
                                }
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                return `${day}-${month}-${year}`; // DD-MM-YYYY format
                              } catch (e) {
                                return "N/A";
                              }
                            })()}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isProcessing
                                  ? "bg-blue-100 text-blue-800"
                                  : statusInfo.bgClass + " " + statusInfo.textClass
                              }`}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <statusInfo.icon className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </>
                              )}
                            </span>
                            {isProcessed && (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Processed
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {/* ✅ UPDATED: Actions menu with new logic */}
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
                              {/* ✅ View Details - Always available */}
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(invoice)}
                                className="cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                                {isProcessed && (
                                  <span className="ml-auto text-xs text-green-600">✓</span>
                                )}
                              </DropdownMenuItem>
                              
                              {/* ✅ Retry Process - Only for FAILED invoices */}
                              {(invoice.file?.status ?? FileStatus.NOT_SET) === FileStatus.FAILED && !isProcessing && (
                                <DropdownMenuItem
                                  onClick={() => handleRetryProcessing(invoice)}
                                  className="cursor-pointer text-orange-600 hover:text-orange-700"
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Retry Process
                                </DropdownMenuItem>
                              )}
                              
                              {/* ✅ Show processing state */}
                              {isProcessing && (
                                <DropdownMenuItem
                                  disabled
                                  className="cursor-not-allowed opacity-50"
                                >
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Processing...
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-gray-500"
                    >
                      No invoices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredInvoices.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-500">
                  Showing {paginatedInvoices.length} of{" "}
                  {filteredInvoices.length} invoices
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
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {modalInfo.isOpen && (
        <InvoiceCard
          costCenters={costCenters}
          expenseTypes={expenseTypes}
          setModalInfo={setModalInfo}
          onRefresh={loadData}
        />
      )}

      {detailsModalInfo.isOpen && (
        <InvoiceDetailsModal
          invoice={detailsModalInfo.invoice}
          setModalInfo={setDetailsModalInfo}
        />
      )}
    </div>
  );
}

// Default export
export default InvoicesClient;

// Named export as well (for flexibility)
export { InvoicesClient };