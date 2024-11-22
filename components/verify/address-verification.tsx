"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin } from "lucide-react";

const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
});

type AddressForm = z.infer<typeof addressSchema>;

interface AddressVerificationProps {
  onComplete: (data: any) => void;
}

export function AddressVerification({ onComplete }: AddressVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);

      // Simulate address verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onComplete(data);
    } catch (error) {
      setError("Failed to verify address. Please try again.");
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="line1">Address Line 1</Label>
          <Input id="line1" {...register("line1")} />
          {errors.line1 && (
            <p className="text-sm text-red-500">{errors.line1.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="line2">Address Line 2</Label>
          <Input id="line2" {...register("line2")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
            {errors.state && (
              <p className="text-sm text-red-500">{errors.state.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" {...register("pincode")} />
          {errors.pincode && (
            <p className="text-sm text-red-500">{errors.pincode.message}</p>
          )}
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