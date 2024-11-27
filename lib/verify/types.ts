// lib/verify/types.ts
export interface DocumentUploadData {
  documentType: string;
  documentImage: string;
  documentNumber?: string;
}

export interface DocumentUploadProps {
  onUpload: (data: DocumentUploadData) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  required?: boolean;
}
