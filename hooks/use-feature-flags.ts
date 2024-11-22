"use client";

import { useEffect, useState } from "react";

interface FeatureFlags {
  auth: {
    googleLogin: boolean;
    facebookLogin: boolean;
    githubLogin: boolean;
  };
  verification: {
    aadhaarVerification: boolean;
    voterIdVerification: boolean;
    drivingLicenseVerification: boolean;
    panCardVerification: boolean;
  };
  payment: {
    razorpay: boolean;
    gstInvoice: boolean;
  };
  features: {
    accessManagement: boolean;
    couponManagement: boolean;
    requestVerification: boolean;
    verificationHistory: boolean;
  };
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await fetch("/api/admin/feature-flags");
        const data = await response.json();
        setFlags(data);
      } catch (error) {
        console.error("Failed to fetch feature flags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

  return { flags, loading };
}