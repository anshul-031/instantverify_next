"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useInvoice() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInvoice = async (transactionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoice/${transactionId}`);

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    generateInvoice,
    loading,
  };
}