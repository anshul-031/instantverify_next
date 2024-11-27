import { z } from "zod";

export const verifySchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  documentType: z.enum(["aadhaar", "pan", "driving_license", "voter_id"], {
    required_error: "Document type is required",
    invalid_type_error: "Invalid document type",
  }),
  documentNumber: z.string().min(1, "Document number is required"),
  personPhoto: z.string().min(1, "Person photo is required"),
  documentImage: z.string().min(1, "Document image is required").optional(), // Optional change here
  useCredits: z.string().min(1, "user credits is required"),
});

export type VerifyRequest = z.infer<typeof verifySchema>;