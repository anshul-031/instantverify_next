import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ReportStatusProps {
  status: string;
}

export function ReportStatus({ status }: ReportStatusProps) {
  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge variant="default">Verified</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Processing</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="font-medium">Verification Status</span>
      </div>
      {getStatusBadge()}
    </div>
  );
}