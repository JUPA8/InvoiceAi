// ✅ COMPLETELY FIXED invoiceActions.ts - Following team leader's exact workflow

"use server";

import { revalidatePath } from "next/cache";
import * as invoiceService from "@/services/invoiceService";
import { getSession } from "@/lib/session";

export async function createInvoiceAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated." };
  }

  const file = formData.get("file") as File;
  const costCenterId = formData.get("costCenterId") as string;
  const expenseTypeId = formData.get("expenseTypeId") as string;
  const expenseTypeName = formData.get("expenseTypeName") as string;
  const type = formData.get("type") as string;
  const intent = formData.get("intent") as string;
  const processImmediately = intent === "process";

  if (!file || !costCenterId || !expenseTypeId || file.size === 0) {
    return {
      success: false,
      message: "Please fill in all required fields and select a file.",
    };
  }

  try {
    console.log('🚀 TEAM LEADER WORKFLOW: Starting correct automated process...');
    
    // ✅ RULE #1: Upload file with ProcessImmediately=true (AUTOMATED PROCESSING)
    // ✅ RULE #2: NO manual invoice creation - the API does it automatically!
    const fileUploadResponse = await invoiceService.uploadInvoiceFile(
      file,
      costCenterId,
      expenseTypeId
    );

    const fileId = fileUploadResponse.id;
    if (!fileId) {
      throw new Error("File ID not returned after upload.");
    }

    console.log('✅ File uploaded - AUTOMATED system will create invoice and extract data:', fileId);

    // ✅ RULE #2: NO manual invoice creation! The automated system does everything!
    // ✅ RULE #3: NO manual AI processing! Only use AI processing for "Process Now" button!

    if (processImmediately) {
      console.log('⏳ Waiting for automated processing to complete...');
      
      // Wait for the automated system to work
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // ✅ RULE #4: Check if invoice was created using INVOICE endpoints (not file endpoints)
      let invoice = null;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!invoice && attempts < maxAttempts) {
        try {
          // ✅ RULE #4: Use /api/Invoices endpoint to find the created invoice
          const invoices = await invoiceService.getInvoices();
          invoice = invoices.find((inv: any) => inv.fileId === fileId);
          
          if (invoice) {
            console.log('✅ Automated invoice creation successful - INVOICE ID:', invoice.id);
            break;
          }
          
          attempts++;
          console.log(`⏳ Waiting for automated invoice creation... (${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error('Error checking for automated invoice:', error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (invoice) {
        revalidatePath("/invoices");
        return {
          success: true,
          message: `Invoice "${file.name}" uploaded successfully! Automated processing created invoice with ID: ${invoice.id}`,
          data: invoice,
        };
      } else {
        revalidatePath("/invoices");
        return {
          success: true,
          message: `Invoice "${file.name}" uploaded successfully! Automated processing is happening in the background.`,
          data: { fileId },
        };
      }
    }

    revalidatePath("/invoices");
    return {
      success: true,
      message: `Invoice "${file.name}" uploaded successfully! Automated processing will create the invoice.`,
      data: { fileId },
    };
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to upload invoice.";
    return { success: false, message: errorMessage };
  }
}

// ✅ RULE #3: Only use this for manual "Process Now" button
export async function processInvoiceAction(fileId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated." };
  }

  if (!fileId) {
    return { success: false, message: "File ID is required." };
  }

  console.log(`🚀 MANUAL "Process Now" triggered for fileId: ${fileId}`);

  try {
    // ✅ RULE #3: This is the ONLY time we use AI processing endpoint
    const result = await invoiceService.processInvoice(fileId);
    
    console.log('✅ Manual processing completed:', result);

    revalidatePath("/invoices");
    return {
      success: true,
      message: "Invoice processing completed successfully! The AI has extracted all data.",
      data: result
    };
  } catch (error: any) {
    console.error('❌ Processing error:', error);
    
    let errorMessage = error.message || "Failed to process invoice.";
    
    if (error.message.includes("Rate limit")) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (error.message.includes("404")) {
      errorMessage = "Invoice not found. Please check if the invoice exists.";
    } else if (error.message.includes("500")) {
      errorMessage = "Server error during processing. Please try again later.";
    }

    return { 
      success: false, 
      message: errorMessage,
      details: error.response?.data || error.message
    };
  }
}

export async function checkProcessingStatusAction(fileId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated." };
  }

  if (!fileId) {
    return { success: false, message: "File ID is required." };
  }

  try {
    const status = await invoiceService.checkProcessingStatus(fileId);
    
    return {
      success: true,
      data: status,
      message: status.isCompleted 
        ? "Processing completed!" 
        : status.isFailed 
        ? "Processing failed"
        : status.isProcessing 
        ? "Still processing..." 
        : "Waiting to start processing"
    };
  } catch (error: any) {
    console.error('❌ Error checking status:', error);
    return {
      success: false,
      message: "Failed to check processing status.",
      details: error.message
    };
  }
}

// ✅ RULE #4: Get invoice using INVOICE ID (not file ID)
export async function getInvoiceAction(invoiceId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated." };
  }

  if (!invoiceId) {
    return { success: false, message: "Invoice ID is required." };
  }

  try {
    console.log(`📋 Fetching invoice using INVOICE ID: ${invoiceId}`);
    
    // ✅ RULE #4: Use invoice service with INVOICE ID
    const invoice = await invoiceService.getInvoice(invoiceId);

    console.log(`✅ Invoice fetched successfully with extraData: ${invoiceId}`);

    return {
      success: true,
      data: invoice,
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to get invoice details.";
    return { success: false, message: errorMessage };
  }
}

export async function refreshInvoicesAction() {
  try {
    revalidatePath("/invoices");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: "Failed to refresh invoices." };
  }
}

export async function getInvoiceStatsAction() {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated." };
  }

  try {
    // ✅ RULE #4: Use /api/Invoices endpoint
    const invoices = await invoiceService.getInvoices();

    const stats = {
      total: invoices.length,
      processed: invoices.filter((i: any) => i && i.file?.status === 3).length, // COMPLETED = Status 3
      processing: invoices.filter((i: any) => i && i.file?.status === 1).length, // PROCESSING = Status 1
      pending: invoices.filter(
        (i: any) => i && (!i.file || i.file.status === 0 || i.file.status === -2)
      ).length, // NEW or NOT_SET = Status 0 or -2
      failed: invoices.filter((i: any) => i && i.file?.status === 2).length, // FAILED = Status 2
      skipped: invoices.filter((i: any) => i && i.file?.status === -1).length, // SKIPPED = Status -1
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to get invoice statistics.",
      data: { total: 0, processed: 0, processing: 0, pending: 0, failed: 0, skipped: 0 },
    };
  }
}