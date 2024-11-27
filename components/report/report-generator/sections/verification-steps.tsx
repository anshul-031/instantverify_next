import { CheckCircle, XCircle, Clock } from "lucide-react";

interface VerificationStep {
  name: string;
  status: "completed" | "failed" | "pending";
  timestamp: string;
  description?: string;
}

interface VerificationStepsProps {
  steps: VerificationStep[];
}

export function VerificationSteps({ steps }: VerificationStepsProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex items-start gap-4 rounded-lg border p-4"
        >
          {getStepIcon(step.status)}
          <div className="flex-1">
            <p className="font-medium">{step.name}</p>
            {step.description && (
              <p className="text-sm text-muted-foreground">{step.description}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(step.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}