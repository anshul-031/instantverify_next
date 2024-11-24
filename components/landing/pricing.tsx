import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Landmark, IndianRupee } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    title: "B2C",
    description: "For individual users",
    icon: Users,
    features: [
      "Real-time ID verification",
      "Basic background check",
      "Standard processing time",
      "Email support",
    ],
    originalPrice: 100,
    discountPercentage: 80,
    action: "Get Started",
  },
  {
    title: "B2B",
    description: "For businesses",
    icon: Building2,
    features: [
      "Bulk verification",
      "Priority processing",
      "API access",
      "Dedicated support",
    ],
    price: "Contact Sales",
    action: "Contact Us",
  },
  {
    title: "B2G",
    description: "For government organizations",
    icon: Landmark,
    features: [
      "Custom solutions",
      "Integration support",
      "Dedicated infrastructure",
      "24/7 support",
    ],
    price: "Contact Sales",
    action: "Contact Us",
  },
];

export function PricingSection() {
  const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number) => {
    const discountedPrice = originalPrice * (1 - discountPercentage / 100);
    const gst = discountedPrice * 0.18; // 18% GST
    const finalPrice = discountedPrice + gst;
    return {
      discounted: discountedPrice.toFixed(2),
      withGst: finalPrice.toFixed(2),
    };
  };

  return (
    <section className="container space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Pricing Plans
        </h2>
        <p className="mt-4 text-muted-foreground">
          Choose the right plan for your needs
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card key={plan.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <plan.icon className="h-8 w-8 text-primary" />
                <CardTitle>{plan.title}</CardTitle>
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-6">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="space-y-4">
                {plan.originalPrice ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      <span className="text-2xl font-bold line-through text-muted-foreground">
                        {plan.originalPrice}
                      </span>
                      <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                        {plan.discountPercentage}% OFF
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-primary">
                        <IndianRupee className="inline h-5 w-5" />
                        {calculateDiscountedPrice(plan.originalPrice, plan.discountPercentage).discounted}
                        <span className="text-sm font-normal text-muted-foreground"> + GST</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Final price: ₹{calculateDiscountedPrice(plan.originalPrice, plan.discountPercentage).withGst} (incl. GST)
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{plan.price}</p>
                )}
                <Link href={plan.title === "B2C" ? "/verify" : "/contact"}>
                  <Button className="w-full">{plan.action}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        * Special 80% discount is available for a limited time only. Regular prices will apply after the promotional period.
      </p>
    </section>
  );
}