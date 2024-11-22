'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, X } from 'lucide-react';

export function FeedbackBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your feedback',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      toast({
        title: 'Success',
        description: 'Thank you for your feedback!',
      });
      setFeedback('');
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'
      }`}
    >
      <div className="m-4 w-80 rounded-lg border bg-background shadow-lg">
        <div
          className="flex cursor-pointer items-center justify-between rounded-t-lg bg-primary p-3 text-primary-foreground"
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onKeyDown={e => e.key === 'Enter' && setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Feedback</span>
          </div>
          <X className="h-4 w-4" />
        </div>
        <div className="p-4">
          <Textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Share your thoughts with us..."
            className="mb-4 min-h-[100px]"
            aria-label="Feedback"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </div>
    </div>
  );
}