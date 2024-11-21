import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Zap, Clock } from "lucide-react";

const features = [
  {
    title: "Real-time Verification",
    description: "Instant verification results with advanced AI technology",
    icon: Zap,
  },
  {
    title: "Secure & Compliant",
    description: "Bank-grade security with full regulatory compliance",
    icon: Lock,
  },
  {
    title: "Trusted Platform",
    description: "Trusted by leading businesses across India",
    icon: Shield,
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock customer support and assistance",
    icon: Clock,
  },
];

export function FeaturesSection() {
  return (
    <section className="container space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Key Features
        </h2>
        <p className="mt-4 text-muted-foreground">
          Advanced verification solutions for modern businesses
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="text-center">
            <CardHeader>
              <div className="flex justify-center">
                <feature.icon className="h-12 w-12 text-primary" />
              </div>
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