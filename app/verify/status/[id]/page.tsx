"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { VerificationProgress } from "@/components/verify/verification-progress";
import { useToast } from "@/hooks/use-toast";

interface VerificationStatus {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  steps: {
    name: string;
    status: "pending" | "processing" | "completed" | "failed";
  }[];
}

export default function VerificationStatusPage() {
  const params = useParams();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/verification-status/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch status");
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch verification status",
          variant: "destructive",
        });
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [params.id, toast]);

  if (!status) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Loading verification status...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Verification Status</h1>
            <p className="mt-2 text-muted-foreground">
              Track your verification progress
            </p>
          </div>

          <VerificationProgress
            status={status.status}
            progress={status.progress}
            steps={status.steps}
          />
        </div>
      </Card>
    </div>
  );
}