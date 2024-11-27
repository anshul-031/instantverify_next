import { formatDate } from "@/lib/utils";

interface ReportHeaderProps {
  documentType: string;
  documentNumber: string;
  createdAt: string;
}

export function ReportHeader({ documentType, documentNumber, createdAt }: ReportHeaderProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Verification Report</h2>
      <div className="text-sm text-muted-foreground">
        <p>Document Type: {documentType.toUpperCase()}</p>
        <p>Document Number: {documentNumber}</p>
        <p>Generated on: {formatDate(createdAt)}</p>
      </div>
    </div>
  );
}