export interface DocumentUploadData {
  documentImage: string;
  documentType: string;
  documentNumber?: string;
}

export interface DocumentUploadProps {
  onUpload: (data: DocumentUploadData) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  required?: boolean;
}

export interface DocumentCameraProps {
  onCapture: (photo: string) => void;
}

export interface DocumentPreviewProps {
  image: string;
  onRemove: () => void;
}

export interface DocumentInstructionsProps {
  acceptedTypes: string[];
  maxSize: number;
}