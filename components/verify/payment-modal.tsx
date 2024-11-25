"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IndianRupee, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { frontendLogger } from "@/lib/logger";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentModal({ open, onClose, onSuccess, amount }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
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

  const handlePayment = async () => {
    try {
      setLoading(true);
      frontendLogger.info('Initiating payment', { amount });

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, credits: 1 }),
      });

      if (!response.ok) {
        const error = await response.json();
        frontendLogger.error('Payment initiation failed', error);
        throw new Error(error.message || "Failed to initiate payment");
      }

      const { orderId, key } = await response.json();
      frontendLogger.info('Payment order created', { orderId });

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key,
        amount: amount * 100,
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
              description: "Your verification will now proceed.",
            });

            onSuccess();
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
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span>1 Verification Credit</span>
              <span className="flex items-center font-semibold">
                <IndianRupee className="h-4 w-4" />
                {amount}
              </span>
            </div>
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
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}