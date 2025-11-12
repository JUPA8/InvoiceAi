export interface FileMetadata {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  publicUrl?: string;
  status?: 0 | 1 | 2 | 3 | -1 | -2;
  processedAt?: string;
  errorMessage?: string;
  retryCount?: number;
  jobId?: string;
  aiReply?: string;
  costCenterId?: string;
  expenseTypeId?: string;
  invoiceId?: string;
  processImmediately?: boolean;
  clientId?: number;
}

// ✅ FIXED: Updated Invoice interface to match API schema exactly
export interface Invoice {
  id: string;
  
  // ✅ FIXED: Use camelCase for frontend, API expects camelCase too
  invoiceDate: string;
  companyName: string;
  address: string;
  taxNumber: string;
  invoiceNo: string;
  branch: string;
  subtotal: number;
  totalTax: number;
  total: number;
  paymentMethod: string;
  invoiceType: 1 | 2;
  items: InvoiceItem[];
  
  // Metadata
  createdDate?: string;
  modifiedDate?: string;
  
  // File relationship
  file?: FileMetadata;
  fileId?: string;
  
  // Frontend display properties
  name?: string;
  expenseType?: string;
  type?: string;
  status?: "Processed" | "Pending" | "Flagged";
  costCenterName?: string;
  costCenterId?: string;
  expenseTypeId?: string;
  
  // ✅ FIXED: Correct property name for extra data
  extraData?: Record<string, any>;
  genuinityRank?: number;
  clientId?: number;
  
  // ✅ BACKWARD COMPATIBILITY: Keep snake_case versions for legacy support
  invoice_date?: string;
  company_name?: string;
  tax_number?: string;
  invoice_no?: string;
  total_tax?: number;
  payment_method?: string;
}

export interface InvoiceItem {
  id?: string;
  quantity: number;
  description: string;
  price: number;
  tax: number;
  invoiceId?: string;
}

export interface CostCenter {
  id: string;
  name: string;
  clientId: number;
  isActive: boolean;
  isDeleted?: boolean;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  deletedBy?: string;
  deletedDate?: string;
  applicationUrl?: string;
}

export interface ExpenseType {
  id: string;
  name: string;
  costCenterId: string;
  costCenter?: {
    id: string;
    name: string;
  };
  isActive?: boolean;
  createdDate?: string;
  modifiedDate?: string;
  isDeleted?: boolean;
}

export interface ExpenseTypeResponse {
  total: number;
  pageNumber: number;
  pageSize: number;
  filter: any;
  data: ExpenseType[];
  messages: string[];
  isSuccess: boolean;
  statusCode: number;
}

export interface CostCenterResponse {
  total: number;
  pageNumber: number;
  pageSize: number;
  filter: any;
  data: CostCenter[];
  messages: string[];
  isSuccess: boolean;
  statusCode: number;
}

export interface InvoiceResponse {
  total: number;
  pageNumber: number;
  pageSize: number;
  filter: any;
  data: Invoice[];
  messages: string[];
  isSuccess: boolean;
  statusCode: number;
}

// ✅ FIXED: Updated CreateInvoiceRequest to match API schema
export interface CreateInvoiceRequest {
  invoiceDate: string;
  companyName: string;
  invoiceNo: string;
  invoiceType: 1 | 2;
  fileId: string;
  items: InvoiceItem[];
  address?: string;
  taxNumber?: string;
  branch?: string;
  subtotal?: number;
  totalTax?: number;
  total?: number;
  paymentMethod?: string;
  extraData?: Record<string, any>;
  genuinityRank?: number;
}

export interface UploadFileResponse {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  isPublic: boolean;
  publicUrl?: string;
  uploadedAt: string;
}