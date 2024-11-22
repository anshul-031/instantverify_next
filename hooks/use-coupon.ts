"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minAmount: number;
  maxDiscount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export function useCoupon() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateCoupon = async (code: string, amount: number) => {
    try {
      setLoading(true);
      const response = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount }),
      });

      if (!response.ok) {
        throw new Error("Invalid coupon");
      }

      const coupon: Coupon = await response.json();
      return coupon;
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid or expired coupon",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    validateCoupon,
    loading,
  };
}