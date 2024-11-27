"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { frontendLogger } from "@/lib/logger";
import { PaymentModalProps, PaymentResponse } from "./payment-types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentModal({ 
  open, 
  onClose, 
  onSuccess, 
  amount, 
  verificationId = undefined 
}: PaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [discountedAmount, setDiscountedAmount] = useState(amount);
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const validateCoupon = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount }),
      });

      if (!response.ok) {
        throw new Error("Invalid coupon code");
      }

      const data = await response.json();
      setDiscountedAmount(amount - data.discountAmount);
      
      toast({
        title: "Success",
        description: "Coupon applied successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid coupon code",
        variant: "destructive",
      });
      setDiscountedAmount(amount);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (discountedAmount === 0) {
      onSuccess();
      if (verificationId) {
        router.push(`/verify/status/${verificationId}`);
      }
      return;
    }

    try {
      setLoading(true);
      frontendLogger.info('Initiating payment', { amount: discountedAmount });

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: discountedAmount, 
          credits: 1,
          verificationId 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        frontendLogger.error('Payment initiation failed', error);
        throw new Error(error.message || "Failed to initiate payment");
      }

      const { orderId, key }: PaymentResponse = await response.json();
      frontendLogger.info('Payment order created', { orderId });

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key,
        amount: discountedAmount * 100,
        currency: "INR",
        name: "InstantVerify.in",
        description: "Verification Credit",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            frontendLogger.info('Payment successful, verifying', {
              orderId,
              paymentId: response.razorpay_payment_id
            });

            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (!verifyResponse.ok) {
              const error = await verifyResponse.json();
              throw new Error(error.message || "Payment verification failed");
            }

            frontendLogger.info('Payment verified successfully');
            toast({
              title: "Payment Successful",
              description: "Your verification report is ready.",
            });

            onSuccess();
            if (verificationId) {
              router.push(`/verify/status/${verificationId}`);
            }
          } catch (error) {
            frontendLogger.error('Payment verification failed', error);
            toast({
              title: "Error",
              description: "Payment verification failed",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#1d4ed8",
        },
        modal: {
          ondismiss: () => {
            frontendLogger.info('Payment modal dismissed');
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      frontendLogger.error('Payment error', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Verification Credit</DialogTitle>
          <DialogDescription>
            You need 1 credit to perform this verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Have a coupon code?</Label>
            <div className="relative">
              <Input
                type={showCoupon ? "text" : "password"}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-8 top-0 h-full px-2"
                onClick={() => setShowCoupon(!showCoupon)}
              >
                {showCoupon ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="absolute right-0 top-0 h-full"
                onClick={validateCoupon}
                disabled={!couponCode || loading}
              >
                Apply
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span>1 Verification Credit</span>
              <span className="flex items-center font-semibold">
                <IndianRupee className="h-4 w-4" />
                {discountedAmount}
              </span>
            </div>
            {discountedAmount !== amount && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground line-through">
                  Original: ₹{amount}
                </span>
                <span className="ml-2 text-green-600">
                  You save: ₹{amount - discountedAmount}
                </span>
              </div>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Includes GST and all applicable taxes
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IndianRupee className="mr-2 h-4 w-4" />
            )}
            {loading ? "Processing..." : discountedAmount === 0 ? "Claim Credit" : "Pay Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}