import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";

interface VerificationStatus {
  id: string;
  status: "pending" | "completed" | "failed";
  result?: any;
  createdAt: string;
}

export function VerificationStatus({ id }: { id: string }) {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/verification-status/${id}`);
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error("Failed to fetch status:", error);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchStatus, 5000);
    fetchStatus();

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Verification not found
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Verification Status
          <Badge
            variant={
              status.status === "completed"
                ? "default"
                : status.status === "failed"
                ? "destructive"
                : "secondary"
            }
          >
            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Verification ID</p>
            <p className="font-medium">{status.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">
              {new Date(status.createdAt).toLocaleString()}
            </p>
          </div>
          {status.status === "completed" && (
            <Button
              className="w-full"
              onClick={() => generatePDF(status.id)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}