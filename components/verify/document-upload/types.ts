import { z } from "zod";

export const documentUploadSchema = z.object({
  documentImage: z.string(),
  documentType: z.string(),
  documentNumber: z.string().optional()
});

export type DocumentUploadData = z.infer<typeof documentUploadSchema>;

export interface DocumentUploadProps {
  onUpload: (data: DocumentUploadData) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  required?: boolean;
}