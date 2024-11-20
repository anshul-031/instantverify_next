import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Car, UserCheck } from "lucide-react";

const useCases = [
  {
    title: "Tenant Verification",
    description: "Comprehensive background checks for potential tenants",
    icon: Home,
  },
  {
    title: "Driver Verification",
    description: "Thorough verification for professional drivers",
    icon: Car,
  },
  {
    title: "Domestic Help Verification",
    description: "Background verification for household staff",
    icon: UserCheck,
  },
];

export function UseCasesSection() {
  return (
    <section className="container space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Use Cases
        </h2>
        <p className="mt-4 text-muted-foreground">
          Trusted verification solutions for various needs
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((useCase) => (
          <Card key={useCase.title} className="text-center">
            <CardHeader>
              <div className="flex justify-center">
                <useCase.icon className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>{useCase.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{useCase.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}