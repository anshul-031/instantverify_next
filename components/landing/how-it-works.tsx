import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Smartphone, Database, FileSearch } from "lucide-react";

const steps = [
  {
    title: "Upload Documents",
    description: "Upload proof of address such as Aadhaar card and take a photo",
    icon: Upload,
  },
  {
    title: "OTP Verification",
    description: "Verify your identity with OTP sent to your registered mobile",
    icon: Smartphone,
  },
  {
    title: "UIDAI Verification",
    description: "System verifies your Aadhaar details with UIDAI database",
    icon: Database,
  },
  {
    title: "Background Check",
    description: "Comprehensive verification of criminal records and background",
    icon: FileSearch,
  },
];

export function HowItWorksSection() {
  return (
    <section className="container space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          How It Works
        </h2>
        <p className="mt-4 text-muted-foreground">
          Simple and secure verification process
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {index + 1}
                </span>
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}