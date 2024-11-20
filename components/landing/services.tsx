import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Search, FileText, Zap } from "lucide-react";

const services = [
  {
    title: "Real-time ID Verification",
    description: "Instant verification of Aadhaar and other government IDs",
    icon: FileCheck,
  },
  {
    title: "Criminal Background Screening",
    description: "Comprehensive check of criminal records and court cases",
    icon: Search,
  },
  {
    title: "Standard Police Verification",
    description: "Official police verification report",
    icon: FileText,
  },
  {
    title: "Express Verification",
    description: "Fast-track police verification service",
    icon: Zap,
  },
];

export function ServicesSection() {
  return (
    <section className="container space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Our Services
        </h2>
        <p className="mt-4 text-muted-foreground">
          Comprehensive verification solutions
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <Card key={service.title}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <service.icon className="h-8 w-8 text-primary" />
                <CardTitle>{service.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}