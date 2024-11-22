import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  landmark: z.string().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

interface AddressVerificationProps {
  onComplete: (data: AddressForm) => void;
}

export function AddressVerification({ onComplete }: AddressVerificationProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  const onSubmit = async (data: AddressForm) => {
    try {
      setLoading(true);

      // Simulate address verification with pincode API
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${data.pincode}`
      );
      const result = await response.json();

      if (result[0].Status === 'Error') {
        toast({
          title: 'Invalid Pincode',
          description: 'Please enter a valid pincode',
          variant: 'destructive',
        });
        return;
      }

      onComplete(data);
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Failed to verify address. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Address Verification</h2>
        <p className="mt-2 text-muted-foreground">
          Please provide your current residential address
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="line1">Address Line 1</Label>
          <Input
            id="line1"
            {...register('line1')}
            placeholder="House/Flat No., Building Name"
          />
          {errors.line1 && (
            <p className="text-sm text-red-500">{errors.line1.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="line2">Address Line 2</Label>
          <Input id="line2" {...register('line2')} placeholder="Street, Area" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landmark">Landmark (Optional)</Label>
          <Input
            id="landmark"
            {...register('landmark')}
            placeholder="Nearby landmark"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} placeholder="City" />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register('state')} placeholder="State" />
            {errors.state && (
              <p className="text-sm text-red-500">{errors.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              {...register('pincode')}
              placeholder="6-digit pincode"
              maxLength={6}
            />
            {errors.pincode && (
              <p className="text-sm text-red-500">{errors.pincode.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Verify Address
            </>
          )}
        </Button>
      </form>
    </div>
  );
}