'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ResendVerificationProps {
  email: string;
  onSuccess?: () => void;
}

export function ResendVerification({ email, onSuccess }: ResendVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to resend verification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <Button
        variant="link"
        className="h-auto p-0 text-primary"
        onClick={handleResend}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Click here to resend verification email'}
      </Button>
    </div>
  );
}