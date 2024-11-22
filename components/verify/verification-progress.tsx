"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useTranslation } from "next-i18next";

interface VerificationStep {
  name: string;
  status: "pending" | "processing" | "completed" | "failed" | "warning";
  description?: string;
  timestamp?: string;
}

interface VerificationProgressProps {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  steps: VerificationStep[];
}

export function VerificationProgress({
  status,
  progress,
  steps,
}: VerificationProgressProps) {
  const { t } = useTranslation("common");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            {t("verification.status.completed", "Completed")}
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-blue-500">
            {t("verification.status.processing", "Processing")}
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            {t("verification.status.failed", "Failed")}
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="default" className="bg-yellow-500">
            {t("verification.status.warning", "Warning")}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {t("verification.status.pending", "Pending")}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {t("verification.progress.overall", "Overall Progress")}
          </span>
          {getStatusBadge(status)}
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {progress}% {t("verification.progress.complete", "complete")}
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.name}
            className="flex flex-col space-y-2 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(step.status)}
                <div>
                  <span className="font-medium">{step.name}</span>
                  {step.description && (
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step.timestamp && (
                  <span className="text-sm text-muted-foreground">
                    {step.timestamp}
                  </span>
                )}
                {getStatusBadge(step.status)}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="ml-6 mt-2 h-6 w-0.5 bg-border" />
            )}
          </div>
        ))}
      </div>

      {status === "failed" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            <p className="font-medium">
              {t(
                "verification.error.message",
                "Verification failed. Please check the errors above and try again."
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}