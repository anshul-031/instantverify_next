"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface VerificationProgressProps {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  steps: {
    name: string;
    status: "pending" | "processing" | "completed" | "failed";
  }[];
}

export function VerificationProgress({
  status,
  progress,
  steps,
}: VerificationProgressProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        );
      case "processing":
        return <Badge>Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          {getStatusBadge(status)}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.name}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(step.status)}
              <span className="font-medium">{step.name}</span>
            </div>
            {getStatusBadge(step.status)}
          </div>
        ))}
      </div>
    </div>
  );
}