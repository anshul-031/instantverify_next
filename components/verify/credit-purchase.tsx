"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/use-credits";
import { IndianRupee } from "lucide-react";

const creditPackages = [
  { credits: 5, amount: 999, popular: false },
  { credits: 10, amount: 1899, popular: true },
  { credits: 20, amount: 3599, popular: false },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CreditPurchase() {
  const [loading, setLoading] = useState(false);
  const { setCredits } = useCredits();
  const { toast } = useToast();

  const handlePurchase = async (credits: number, amount: number) => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits, amount }),
      });

      const { orderId } = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "InstantVerify.in",
        description: `${credits} Verification Credits`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            setCredits((prev) => prev + credits);
            toast({
              title: "Success",
              description: `Successfully purchased ${credits} credits`,
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to verify payment",
              variant: "destructive",
            });
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {creditPackages.map((pkg) => (
        <Card
          key={pkg.credits}
          className={pkg.popular ? "border-primary" : undefined}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {pkg.credits} Credits
              {pkg.popular && (
                <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                  Popular
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-2xl font-bold">
                <IndianRupee className="mr-1 inline-block h-5 w-5" />
                {pkg.amount}
              </p>
              <p className="text-sm text-muted-foreground">
                {(pkg.amount / pkg.credits).toFixed(2)} per verification
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => handlePurchase(pkg.credits, pkg.amount)}
              disabled={loading}
            >
              Purchase
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}