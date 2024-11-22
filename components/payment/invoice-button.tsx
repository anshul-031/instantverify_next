"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceButtonProps {
  transactionId: string;
}

export function InvoiceButton({ transactionId }: InvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const downloadInvoice = async () => {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={downloadInvoice}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-2 h-4 w-4" />
      )}
      Download Invoice
    </Button>
  );
}