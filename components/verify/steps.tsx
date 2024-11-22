import { Check } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="space-y-4">
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.title} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                  index <= currentStep
                    ? "border-primary"
                    : "border-gray-200"
                }`}
              >
                <span className="text-sm font-medium">
                  Step {index + 1}
                </span>
                <span className="text-sm">{step.title}</span>
                {index < currentStep && (
                  <Check className="ml-2 h-4 w-4 text-primary" />
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}