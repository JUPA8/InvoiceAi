// ✅ COMPLETELY FIXED invoice-details-modal.tsx - Proper extraData display and status handling

"use client";
import * as React from "react";
import { X, Download, FileText, AlertCircle, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { FileMetadata, Invoice } from "@/types/invoice";

type InvoiceDetailsModalProps = {
  invoice: Invoice | null;
  setModalInfo: React.Dispatch<
    React.SetStateAction<{ isOpen: boolean; invoice: Invoice | null }>
  >;
};

export function InvoiceDetailsModal({
  invoice,
  setModalInfo,
}: InvoiceDetailsModalProps) {
  if (!invoice) return null;

  // Helper function to format currency
  const formatCurrency = (amount: any): string => {
    if (amount === null || amount === undefined || amount === "") return "N/A";
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    return isNaN(numAmount) ? "N/A" : `${numAmount.toFixed(2)}`;
  };

  // Helper function to format date
  const formatDate = (dateString: any): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const cleanDateString = dateString.replace(/\s+\d{2}:\d{2}:\d{2}$/, '');
        const newDate = new Date(cleanDateString);
        if (!isNaN(newDate.getTime())) {
          return newDate.toLocaleDateString();
        }
        return dateString;
      }
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // ✅ FIXED: Correct status detection based on API schema
  const getStatusDisplay = () => {
    const status = invoice.file?.status;
    console.log('🔍 Invoice status check:', {
      fileStatus: status,
      invoiceId: invoice.id,
      company: invoice.companyName || invoice.company_name,
      total: invoice.total,
      hasExtraData: !!invoice.extraData
    });
    
    switch (status) {
      case 3: return { // COMPLETED
        label: "Processed",
        color: "text-green-600", 
        bg: "bg-green-100",
        icon: CheckCircle
      };
      case 1: return { // PROCESSING
        label: "Processing", 
        color: "text-blue-600", 
        bg: "bg-blue-100",
        icon: Clock
      };
      case 2: return { // FAILED
        label: "Failed", 
        color: "text-red-600", 
        bg: "bg-red-100",
        icon: XCircle
      };
      case -1: return { // SKIPPED
        label: "Skipped", 
        color: "text-gray-600", 
        bg: "bg-gray-100",
        icon: AlertTriangle
      };
      case 0: return { // NEW
        label: "Pending", 
        color: "text-yellow-600", 
        bg: "bg-yellow-100",
        icon: AlertCircle
      };
      default: return { 
        label: "Pending", 
        color: "text-yellow-600", 
        bg: "bg-yellow-100",
        icon: AlertCircle
      };
    }
  };

  const statusDisplay = getStatusDisplay();

  // ✅ FIXED: Determine if invoice is truly processed (Status 3 = COMPLETED)
  const isProcessed = invoice?.file?.status === 3;

  // ✅ FIXED: Comprehensive check for AI processed data
  const hasAIData = React.useMemo(() => {
    if (!invoice) return false;
    
    const fileStatus = invoice.file?.status;
    
    // First check: File status is 3 (COMPLETED)
    const isStatusCompleted = fileStatus === 3;
    
    // Second check: Has meaningful AI-extracted data
    const companyName = invoice.companyName || invoice.company_name;
    const hasExtractedCompany = companyName && 
      companyName !== "N/A" && 
      companyName !== "Unknown Company" &&
      companyName.trim().length > 0;
    
    const hasExtractedTotal = invoice.total && invoice.total > 0;
    
    const hasExtractedItems = invoice.items && 
      Array.isArray(invoice.items) && 
      invoice.items.length > 0;
    
    const invoiceNumber = invoice.invoiceNo || invoice.invoice_no;
    const hasExtractedInvoiceNo = invoiceNumber && 
      invoiceNumber !== "N/A" &&
      invoiceNumber.trim().length > 0;
    
    // ✅ RULE #5: Check extraData (this is where AI extracted data is stored)
    const hasExtraData = invoice.extraData && 
      typeof invoice.extraData === 'object' &&
      Object.keys(invoice.extraData).length > 0;
    
    const hasAnyExtractedData = hasExtractedCompany || 
      hasExtractedTotal || 
      hasExtractedItems || 
      hasExtractedInvoiceNo ||
      hasExtraData;
    
    console.log('🔍 AI Data Check:', {
      fileStatus,
      isStatusCompleted,
      hasExtractedCompany,
      hasExtractedTotal,
      hasExtractedItems,
      hasExtractedInvoiceNo,
      hasExtraData,
      hasAnyExtractedData,
      finalResult: isStatusCompleted && hasAnyExtractedData
    });
    
    return isStatusCompleted && hasAnyExtractedData;
  }, [invoice]);

  // ✅ FIXED: Get company name with proper fallback
  const getCompanyName = () => {
    if (!invoice) return "N/A";
    return invoice.companyName || invoice.company_name || "N/A";
  };

  // ✅ FIXED: Get invoice number with proper fallback
  const getInvoiceNo = () => {
    if (!invoice) return "N/A";
    return invoice.invoiceNo || invoice.invoice_no || "N/A";
  };

  // ✅ FIXED: Get invoice date with proper fallback
  const getInvoiceDate = () => {
    if (!invoice) return undefined;
    return invoice.invoiceDate || invoice.invoice_date;
  };

  // ✅ FIXED: Get tax number with proper fallback
  const getTaxNumber = () => {
    if (!invoice) return undefined;
    return invoice.taxNumber || invoice.tax_number;
  };

  // ✅ FIXED: Get total tax with proper fallback
  const getTotalTax = () => {
    if (!invoice) return 0;
    return invoice.totalTax || invoice.total_tax || 0;
  };

  // ✅ FIXED: Get payment method with proper fallback
  const getPaymentMethod = () => {
    if (!invoice) return undefined;
    return invoice.paymentMethod || invoice.payment_method;
  };

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/15">
      <Card className="w-[900px] max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center justify-between">
            Invoice Details
            <X
              className="w-4 h-4 text-[#71717a] cursor-pointer hover:text-gray-900"
              onClick={() => setModalInfo({ isOpen: false, invoice: null })}
            />
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span className="truncate max-w-sm">
              {invoice.name || getInvoiceNo() || "Unnamed Invoice"}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusDisplay.bg} ${statusDisplay.color}`}>
              <statusDisplay.icon className="w-3 h-3" />
              {statusDisplay.label}
              {isProcessed && <span className="ml-1">✅</span>}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Processing status notices */}
          {!isProcessed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">AI Processing Status</h4>
                <p className="text-sm text-blue-800">
                  {invoice.file?.status === 1 
                    ? "This invoice is currently being processed by AI. Check back in a few moments for extracted data."
                    : invoice.file?.status === 2
                    ? "AI processing failed for this invoice. You can retry processing from the actions menu."
                    : "This invoice hasn't been processed yet. Click 'Process Now' to extract invoice data with AI."
                  }
                </p>
              </div>
            </div>
          )}

          {/* Success notice when processed */}
          {isProcessed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">✅ Invoice Successfully Processed</h4>
                <p className="text-sm text-green-800">
                  This invoice has been successfully processed by AI. All extracted data is shown below with green checkmarks.
                </p>
              </div>
            </div>
          )}

          {/* Main Invoice Information */}
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Invoice Information
              {isProcessed && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ AI Extracted</span>}
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 text-sm">Company</span>
                  <span className={`font-semibold text-sm text-right max-w-[200px] ${
                    isProcessed && getCompanyName() && getCompanyName() !== "N/A" ? "text-green-800" : "text-gray-800"
                  }`}>
                    {getCompanyName()}
                    {isProcessed && getCompanyName() && getCompanyName() !== "N/A" && <span className="ml-1 text-green-600">✓</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 text-sm">Invoice #</span>
                  <span className={`font-semibold text-sm ${
                    isProcessed && getInvoiceNo() && getInvoiceNo() !== "N/A" ? "text-green-800" : "text-gray-800"
                  }`}>
                    {getInvoiceNo()}
                    {isProcessed && getInvoiceNo() && getInvoiceNo() !== "N/A" && <span className="ml-1 text-green-600">✓</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 text-sm">Invoice Date</span>
                  <span className={`font-semibold text-sm ${
                    isProcessed ? "text-green-800" : "text-gray-800"
                  }`}>
                    {formatDate(getInvoiceDate())}
                    {isProcessed && <span className="ml-1 text-green-600">✓</span>}
                  </span>
                </div>
                
                {/* System creation date */}
                {invoice.createdDate && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500 text-sm">Added to System</span>
                    <span className="font-semibold text-gray-600 text-sm">
                      {formatDate(invoice.createdDate)}
                    </span>
                  </div>
                )}
                {getTaxNumber() && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500 text-sm">Tax Number</span>
                    <span className={`font-semibold text-sm ${
                      isProcessed ? "text-green-800" : "text-gray-800"
                    }`}>
                      {getTaxNumber()}
                      {isProcessed && <span className="ml-1 text-green-600">✓</span>}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 text-sm">Type</span>
                  <span className={`font-semibold text-sm ${
                    invoice.invoiceType === 2 ? "text-red-600" : "text-green-600"
                  }`}>
                    {invoice.invoiceType === 2 ? "Debit" : "Credit"}
                  </span>
                </div>
                {getPaymentMethod() && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500 text-sm">Payment Method</span>
                    <span className={`font-semibold text-sm ${
                      isProcessed ? "text-green-800" : "text-gray-800"
                    }`}>
                      {getPaymentMethod()}
                      {isProcessed && <span className="ml-1 text-green-600">✓</span>}
                    </span>
                  </div>
                )}
                {invoice.branch && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500 text-sm">Branch</span>
                    <span className={`font-semibold text-sm ${
                      isProcessed ? "text-green-800" : "text-gray-800"
                    }`}>
                      {invoice.branch}
                      {isProcessed && <span className="ml-1 text-green-600">✓</span>}
                    </span>
                  </div>
                )}
                {invoice.genuinityRank && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500 text-sm">AI Confidence</span>
                    <span className="font-semibold text-green-600 text-sm">
                      {invoice.genuinityRank}%
                      <span className="ml-1 text-green-600">✓</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {invoice.address && (
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 text-sm">Address</span>
                  <span className={`font-semibold text-sm text-right max-w-xs ${
                    isProcessed ? "text-green-800" : "text-gray-800"
                  }`}>
                    {invoice.address}
                    {isProcessed && <span className="ml-1 text-green-600">✓</span>}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="border rounded-lg p-4 space-y-3 bg-blue-50/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              Financial Summary
              {isProcessed && (invoice.total > 0 || invoice.subtotal > 0) && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ AI Extracted</span>
              )}
            </h3>
            
            <div className="space-y-2">
              {(invoice.subtotal !== undefined && invoice.subtotal !== null && invoice.subtotal !== 0) && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Subtotal</span>
                  <span className={`font-semibold ${
                    isProcessed && invoice.subtotal > 0 ? "text-green-700" : "text-gray-800"
                  }`}>
                    {formatCurrency(invoice.subtotal)}
                    {isProcessed && invoice.subtotal > 0 && <span className="ml-1 text-green-600">✓</span>}
                  </span>
                </div>
              )}
              
              {(getTotalTax() !== undefined && getTotalTax() !== null && getTotalTax() !== 0) && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Tax</span>
                  <span className={`font-semibold ${
                    isProcessed && getTotalTax() > 0 ? "text-green-700" : "text-gray-800"
                  }`}>
                    {formatCurrency(getTotalTax())}
                    {isProcessed && getTotalTax() > 0 && <span className="ml-1 text-green-600">✓</span>}
                  </span>
                </div>
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700 text-lg">Total Amount</span>
                  <span className={`font-bold text-lg ${
                    isProcessed && invoice.total > 0 ? "text-green-600" : "text-blue-600"
                  }`}>
                    {formatCurrency(invoice.total)}
                    {isProcessed && invoice.total > 0 && <span className="ml-1 text-green-600">✓</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <span>Line Items ({invoice.items.length})</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ AI Extracted</span>
              </h3>
              
              <div className="space-y-3">
                {invoice.items.map((item: any, index: number) => (
                  <div key={index} className="border rounded-md p-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1 text-green-800">
                          {item.description || `Item ${index + 1}`}
                          <span className="ml-1 text-green-600">✓</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.quantity ? `Quantity: ${item.quantity}` : 'Quantity: N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm mb-1 text-green-700">
                          {formatCurrency(item.price)}
                          <span className="ml-1 text-green-600">✓</span>
                        </div>
                        {item.tax && (
                          <div className="text-xs text-gray-500">
                            Tax: {formatCurrency(item.tax)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classification */}
          <div className="border rounded-lg p-4 space-y-3 bg-green-50/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              Classification
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Manual Entry</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 text-sm">Cost Center</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {invoice.costCenterName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 text-sm">Expense Type</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {invoice.expenseType || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ RULE #5: extraData display - This is where AI extracted data is stored! */}
          {invoice.extraData && Object.keys(invoice.extraData).length > 0 && (
            <div className="border rounded-lg p-4 space-y-3 bg-green-50/50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                ✅ Additional AI Extracted Data
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">extraData Field</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(invoice.extraData).map(([key, value]) => {
                  // Skip null, undefined, or empty values
                  if (value === null || value === undefined || value === '') {
                    return null;
                  }
                  
                  return (
                    <div key={key} className="border-b border-gray-200 pb-2 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-500 text-sm capitalize flex-shrink-0 mr-4">
                          {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-semibold text-green-800 text-sm text-right">
                          {(() => {
                            const stringValue = String(value);
                            if (stringValue.length > 100) {
                              return stringValue.substring(0, 100) + '...';
                            }
                            return stringValue;
                          })()}
                          <span className="ml-1 text-green-600">✓</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* File Details */}
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">File Information</h3>
            {invoice.file ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 text-sm">File Name</span>
                  <span className="font-semibold text-gray-800 text-sm truncate max-w-xs">
                    {invoice.file.fileName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 text-sm">Content Type</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {invoice.file.contentType || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 text-sm">File Size</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {invoice.file.size 
                      ? `${(invoice.file.size / 1024 / 1024).toFixed(2)} MB`
                      : "N/A"
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 text-sm">Processing Status</span>
                  <span className={`font-semibold text-sm flex items-center gap-1 ${statusDisplay.color}`}>
                    <statusDisplay.icon className="w-3 h-3" />
                    {statusDisplay.label}
                    {isProcessed && <span className="text-green-600">✅</span>}
                  </span>
                </div>
                {invoice.file.processedAt && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500 text-sm">Processed At</span>
                    <span className="font-semibold text-green-800 text-sm">
                      {formatDate(invoice.file.processedAt)}
                      <span className="ml-1 text-green-600">✓</span>
                    </span>
                  </div>
                )}
                {invoice.file.errorMessage && (
                  <div className="flex justify-between">
                    <span className="font-medium text-red-500 text-sm">Error</span>
                    <span className="font-semibold text-red-800 text-sm text-right max-w-xs">
                      {invoice.file.errorMessage}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No file information available.</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex items-center justify-end gap-3 pt-6">
          <Button
            type="button"
            onClick={() => setModalInfo({ isOpen: false, invoice: null })}
            className="min-w-[100px]"
          >
            Close
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}