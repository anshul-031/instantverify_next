'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';
import featureFlags from '@/config/feature-flags';

interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  status: string;
}

interface GSTInvoiceProps {
  transaction: Transaction;
}

export function GSTInvoice({ transaction }: GSTInvoiceProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!featureFlags.payment.gstInvoice) {
    return null;
  }

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoice/${transaction.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${transaction.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Transaction ID: {transaction.id}</p>
          <p className="text-sm text-muted-foreground">
            Date: {new Date(transaction.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Amount: ₹{transaction.amount}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={loading || transaction.status !== 'completed'}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download GST Invoice
        </Button>
      </div>
    </Card>
  );
}