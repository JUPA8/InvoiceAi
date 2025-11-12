// ✅ COMPLETELY FIXED invoiceService.ts - Following team leader's exact workflow + FILE_FAILED_PROCESSING fix

"use server";

import axios from "axios";
import { getSession, type SessionPayload } from "@/lib/session";

export type {
  FileMetadata,
  Invoice,
  InvoiceItem,
  CostCenter,
  ExpenseType,
  ExpenseTypeResponse,
  CostCenterResponse,
  InvoiceResponse,
  CreateInvoiceRequest,
  UploadFileResponse,
} from "../types/invoice";

import type {
  FileMetadata,
  Invoice,
  CostCenter,
  ExpenseType,
} from "@/types/invoice";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

// ✅ FIXED: Conservative rate limits to prevent API overload
const requestHistory = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 8; // Very conservative

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  maxRedirects: 3,
});

function getWorkingHeaders(session: SessionPayload) {
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${session.basicAuth}`,
    "X-USER-KEY": session.userKey,
    "X-API-KEY": session.clientKey,
  };
}

let workingHeaders: any = null;
let headersTimestamp: number = 0;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const requests = requestHistory.get(key) || [];
  const recentRequests = requests.filter((time) => now - time < 60000);
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    console.warn(`⚠️ Rate limit hit for ${key}: ${recentRequests.length}/${MAX_REQUESTS_PER_MINUTE}`);
    return false;
  }
  recentRequests.push(now);
  requestHistory.set(key, recentRequests);
  return true;
}

function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📋 Cache hit for ${key}`);
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`💾 Cached ${key}`);
}

function handleApiError(error: any, operation: string): Error {
  console.error(`API Error during ${operation}:`, error);
  
  if (error.code === "ECONNABORTED") {
    return new Error(`Timeout during ${operation}. The server took too long to respond.`);
  }

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    let detailedMessage = "No additional details from server.";
    if (data) {
      if (typeof data === 'string' && data.length > 0) {
        detailedMessage = data;
      } else if (data.message) {
        detailedMessage = data.message;
      } else if (data.error) {
        detailedMessage = data.error;
      } else if (Array.isArray(data.messages)) {
        detailedMessage = data.messages.join(", ");
      } else if (typeof data === 'object') {
        try {
          detailedMessage = JSON.stringify(data);
        } catch {}
      }
    }

    const finalErrorMessage = `Operation failed: ${operation}. Status: ${status}. Details: ${detailedMessage}`;
    return new Error(finalErrorMessage);
  }

  return new Error(`Failed to ${operation}. Error: ${error.message || 'Unknown network error'}`);
}

// ✅ RULE #1: Upload with ProcessImmediately=true - AUTOMATED WORKFLOW
export const uploadInvoiceFile = async (
  file: File,
  costCenterId?: string,
  expenseTypeId?: string
): Promise<{ id: string }> => {
  if (!file) throw new Error("File is required");

  if (!checkRateLimit("uploadFile")) {
    throw new Error("Rate limit exceeded - please wait before uploading again");
  }

  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size must be less than 10MB");
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("File type not supported");
    }

    const formData = new FormData();
    formData.append("File", file);
    formData.append("IsPublic", "true");
    
    // ✅ TEAM LEADER RULE #1: ProcessImmediately=true for AUTOMATED workflow
    formData.append("ProcessImmediately", "true");

    if (costCenterId) formData.append("CostCenterId", costCenterId);
    if (expenseTypeId) formData.append("ExpenseTypeId", expenseTypeId);

    const uploadHeaders = {
      "X-USER-KEY": session.userKey,
      Authorization: `Basic ${session.basicAuth}`,
      "X-API-KEY": session.clientKey,
    };

    console.log('🚀 TEAM LEADER WORKFLOW: Uploading with automated processing...');

    const response = await apiClient.post("/api/v1/files/upload", formData, {
      headers: uploadHeaders,
      timeout: 45000,
    });

    const result = response.data.data || response.data;
    if (!result?.id) {
      throw new Error("No file ID returned");
    }

    console.log('✅ File uploaded - AUTOMATED system will create invoice and extract data:', result.id);

    // Clear invoice cache to force refresh
    cache.delete("invoices");

    return result;
  } catch (error: any) {
    throw handleApiError(error, "upload file");
  }
};

// ✅ RULE #3: Only use this for manual "Process Now" button - FIXED FILE_FAILED_PROCESSING
export const processInvoice = async (fileId: string) => {
  if (!fileId) throw new Error("File ID is required");

  if (!checkRateLimit("processInvoice")) {
    throw new Error("Rate limit exceeded - please wait before processing again");
  }

  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    if (!workingHeaders || Date.now() - headersTimestamp > 300000) {
      workingHeaders = getWorkingHeaders(session);
      headersTimestamp = Date.now();
    }

    console.log(`🚀 Manual "Process Now" for file: ${fileId}`);

    // ✅ FIXED: First check file status before attempting to process
    const fileStatusResponse = await apiClient.get(
      `/api/v1/files/${fileId}/metadata`,
      {
        headers: workingHeaders,
        timeout: 10000,
      }
    );

    const fileData = fileStatusResponse.data;
    console.log('📊 Current file status:', {
      fileId: fileId,
      status: fileData.status,
      errorMessage: fileData.errorMessage,
      processedAt: fileData.processedAt,
    });

    // ✅ FIXED: Handle different file statuses appropriately
    switch (fileData.status) {
      case 3: // COMPLETED
        return {
          isSuccess: true,
          message: "File has already been processed successfully",
          data: fileData,
          extractedData: fileData.aiReply,
          fileId: fileId,
          alreadyProcessed: true
        };

      case 1: // PROCESSING
        return {
          isSuccess: true,
          message: "File is currently being processed. Please wait for completion.",
          data: fileData,
          fileId: fileId,
          isProcessing: true
        };

      case 2: // FAILED - This is what was causing the FILE_FAILED_PROCESSING error
        console.log('⚠️ File has failed status - cannot reprocess failed files');
        throw new Error(`File processing previously failed: ${fileData.errorMessage || 'Unknown error'}. Please upload a new copy of the file instead of trying to reprocess this one.`);

      case -1: // SKIPPED
        console.log('⚠️ File was skipped - attempting to trigger processing...');
        break;

      case 0: // NEW
      case -2: // NOT_SET
        console.log('✅ File is ready for processing...');
        break;

      default:
        console.log('🤔 Unknown file status, attempting processing...');
        break;
    }

    // ✅ FIXED: Only attempt AI processing if file is NOT in failed state
    if (fileData.status === 2) { // FAILED
      throw new Error(`Cannot process failed file. The file processing failed previously with error: ${fileData.errorMessage || 'Unknown error'}. Please upload a new file instead.`);
    }

    // ✅ Proceed with AI processing for valid files
    const processingResponse = await apiClient.post(
      `/api/v1/AIProcessing/process-document`,
      {
        fileId: fileId,
        instruction: "Extract all invoice data including company name, invoice number, date, items, totals, tax information, and payment details"
      },
      {
        headers: workingHeaders,
        timeout: 60000,
      }
    );

    console.log('✅ Manual processing triggered successfully:', processingResponse.data);

    // Clear cache to force refresh
    cache.delete("invoices");
    cache.delete(`invoice_${fileId}`);

    return {
      isSuccess: true,
      message: "Manual processing triggered successfully",
      data: processingResponse.data,
      extractedData: processingResponse.data?.result,
      fileId: fileId
    };

  } catch (error: any) {
    console.error('❌ Manual processing error:', error);
    
    // ✅ FIXED: Better error handling for FILE_FAILED_PROCESSING and other scenarios
    if (error.response?.status === 400) {
      const errorDetails = error.response?.data || {};
      
      if (typeof errorDetails === 'string' && errorDetails.includes('FILE_FAILED_PROCESSING')) {
        throw new Error('This file has failed processing and cannot be reprocessed. Please upload a new copy of the file instead.');
      }
      
      if (errorDetails.message) {
        throw new Error(`Processing failed: ${errorDetails.message}`);
      }
      
      throw new Error('File cannot be processed. This may be because the file has already failed processing or is in an invalid state. Please try uploading a new copy of the file.');
    }

    throw handleApiError(error, "trigger manual processing");
  }
};

// ✅ RULE #4: Get invoices using INVOICE ID, not file ID
export const getInvoices = async () => {
  const cacheKey = "invoices";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!checkRateLimit("getInvoices")) {
    console.warn("⚠️ Rate limit hit for getInvoices - returning cached data or empty array");
    return cache.get(cacheKey)?.data || [];
  }

  try {
    const session = await getSession();
    if (!session) return [];

    if (!workingHeaders || Date.now() - headersTimestamp > 300000) {
      workingHeaders = getWorkingHeaders(session);
      headersTimestamp = Date.now();
    }

    console.log('📋 Fetching invoices using CORRECT endpoint: /api/Invoices');

    // ✅ RULE #4: Use /api/Invoices endpoint (not file endpoints)
    const response = await apiClient.get("/api/Invoices?query.ShowAll=true", {
      headers: workingHeaders,
      timeout: 10000,
    });

    let invoices = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      invoices = response.data.data;
    } else if (Array.isArray(response.data)) {
      invoices = response.data;
    }

    console.log(`✅ Loaded ${invoices.length} invoices with proper invoice IDs`);

    // Process invoices and remove cyclic references
    const processedInvoices = invoices.map((invoice: any) => {
      let cleanedInvoice = { ...invoice };
      
      // Remove circular references
      if (cleanedInvoice.file && cleanedInvoice.file.invoice) {
        const { invoice: _, ...fileWithoutInvoice } = cleanedInvoice.file;
        cleanedInvoice.file = fileWithoutInvoice;
      }
      
      return cleanedInvoice;
    });

    setCache(cacheKey, processedInvoices);
    return processedInvoices;
  } catch (error: any) {
    console.error('❌ Error loading invoices:', error);
    // Return cached data if available, otherwise empty array
    return cache.get(cacheKey)?.data || [];
  }
};

// ✅ RULE #4: Get individual invoice using INVOICE ID 
export const getInvoice = async (invoiceId: string) => {
  if (!invoiceId) throw new Error("Invoice ID is required");

  const cacheKey = `invoice_${invoiceId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!checkRateLimit("getInvoice")) {
    console.warn(`⚠️ Rate limit hit for getInvoice(${invoiceId}) - returning cached data`);
    const cachedData = cache.get(cacheKey)?.data;
    if (cachedData) return cachedData;
    throw new Error("Rate limit exceeded and no cached data available");
  }

  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    if (!workingHeaders || Date.now() - headersTimestamp > 300000) {
      workingHeaders = getWorkingHeaders(session);
      headersTimestamp = Date.now();
    }

    console.log(`📋 Fetching invoice details using INVOICE ID: ${invoiceId}`);

    // ✅ RULE #4: Use /api/Invoices/{invoiceId} (not file endpoints)
    const response = await apiClient.get(`/api/Invoices/${invoiceId}`, {
      headers: workingHeaders,
      timeout: 8000,
    });

    let result = response.data.data || response.data;
    
    // Remove circular references
    if (result && result.file && result.file.invoice) {
      const { invoice: _, ...fileWithoutInvoice } = result.file;
      result.file = fileWithoutInvoice;
    }
    
    console.log(`✅ Loaded invoice details with extraData: ${invoiceId}`);
    
    setCache(cacheKey, result);
    return result;
  } catch (error: any) {
    throw handleApiError(error, "fetch invoice details");
  }
};

export const checkProcessingStatus = async (fileId: string) => {
  if (!fileId) throw new Error("File ID is required");

  // Don't rate limit status checks as heavily
  if (!checkRateLimit("checkStatus")) {
    console.warn("⚠️ Rate limit hit for status check");
    return {
      fileId: fileId,
      status: -1,
      isCompleted: false,
      isFailed: false,
      isProcessing: false,
      errorMessage: "Rate limit exceeded"
    };
  }

  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    if (!workingHeaders || Date.now() - headersTimestamp > 300000) {
      workingHeaders = getWorkingHeaders(session);
      headersTimestamp = Date.now();
    }

    const response = await apiClient.get(
      `/api/v1/files/${fileId}/metadata`,
      {
        headers: workingHeaders,
        timeout: 10000,
      }
    );

    const fileData = response.data;
    
    console.log('📊 File status:', {
      fileId: fileId,
      status: fileData.status,
      processedAt: fileData.processedAt,
    });
    
    return {
      fileId: fileId,
      status: fileData.status,
      processedAt: fileData.processedAt,
      errorMessage: fileData.errorMessage,
      isCompleted: fileData.status === 3, // Status 3 = COMPLETED
      isFailed: fileData.status === 2,     // Status 2 = FAILED
      isProcessing: fileData.status === 1  // Status 1 = PROCESSING
    };

  } catch (error: any) {
    console.error('❌ Error checking status:', error);
    throw handleApiError(error, "check processing status");
  }
};

export const getCostCenters = async (clientId: string) => {
  if (!clientId) throw new Error("Client ID is required");

  const cacheKey = `costcenters_${clientId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!checkRateLimit("getCostCenters")) {
    return cache.get(cacheKey)?.data || [];
  }

  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    if (!workingHeaders || Date.now() - headersTimestamp > 300000) {
      workingHeaders = getWorkingHeaders(session);
      headersTimestamp = Date.now();
    }

    const response = await apiClient.get(
      `/api/v1/clients/${clientId}/CostCenters?query.ShowAll=true`,
      {
        headers: workingHeaders,
        timeout: 8000,
      }
    );

    const data = response.data.data || response.data;
    const result = Array.isArray(data)
      ? data.filter(
          (center: any) => center && !center.isDeleted && center.isActive
        )
      : [];

    setCache(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error('❌ Error loading cost centers:', error);
    return cache.get(cacheKey)?.data || [];
  }
};

export const getAllExpenseTypesForClient = async (
  clientId: string
): Promise<ExpenseType[]> => {
  if (!clientId) return [];

  const cacheKey = `expensetypes_${clientId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!checkRateLimit("getAllExpenseTypes")) {
    return cache.get(cacheKey)?.data || [];
  }

  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const costCenters = await getCostCenters(clientId);
    const limitedCostCenters = costCenters.slice(0, 5); // Reduced to avoid rate limits
    const allExpenseTypes: ExpenseType[] = [];

    for (let i = 0; i < limitedCostCenters.length; i++) {
      const costCenter = limitedCostCenters[i];

      try {
        if (!workingHeaders || Date.now() - headersTimestamp > 300000) {
          workingHeaders = getWorkingHeaders(session);
          headersTimestamp = Date.now();
        }

        const url = `/api/v1/cost-centers/${costCenter.id}/expense-types?query.ShowAll=true`;
        const response = await apiClient.get(url, {
          headers: workingHeaders,
          timeout: 6000,
        });

        const responseData = response.data;
        if (responseData && responseData.isSuccess !== false) {
          const data = responseData.data || responseData;
          const expenseTypes = Array.isArray(data) ? data : [];

          const processedTypes = expenseTypes
            .filter((et: any) => et && !et.isDeleted)
            .map((et: any) => ({
              ...et,
              costCenter: {
                id: costCenter.id,
                name: costCenter.name,
              },
            }));

          allExpenseTypes.push(...processedTypes);
        }
      } catch (error: any) {
        console.error(`Error loading expense types for cost center ${costCenter.id}:`, error);
        continue;
      }

      // Add delay between requests to avoid rate limits
      if (i < limitedCostCenters.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setCache(cacheKey, allExpenseTypes);
    return allExpenseTypes;
  } catch (error: any) {
    console.error('❌ Error loading expense types:', error);
    return cache.get(cacheKey)?.data || [];
  }
};