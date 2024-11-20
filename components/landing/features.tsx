import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileCheck, Clock, Lock, Award } from "lucide-react";

const features = [
  {
    title: "Instant Verification",
    description: "Real-time verification of government IDs and background checks",
    icon: Clock,
  },
  {
    title: "Secure & Compliant",
    description: "End-to-end encrypted data handling with complete privacy",
    icon: Lock,
  },
  {
    title: "Multiple Use Cases",
    description: "Perfect for tenant, domestic help, and driver verification",
    icon: Users,
  },
  {
    title: "Official Verification",
    description: "Direct verification through government databases",
    icon: Shield,
  },
  {
    title: "Comprehensive Reports",
    description: "Detailed reports with criminal record checks",
    icon: FileCheck,
  },
  {
    title: "Trusted Service",
    description: "Recognized and trusted by businesses across India",
    icon: Award,
  },
];

export function FeaturesSection() {
  return (
    <section className="container space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Why Choose InstantVerify
        </h2>
        <p className="mt-4 text-muted-foreground">
          Comprehensive verification solutions for all your needs
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="h-8 w-8 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}