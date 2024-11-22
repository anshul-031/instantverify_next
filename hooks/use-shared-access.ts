"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SharedAccess {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  type: "VIEW" | "FULL";
  expiresAt: string;
}

export function useSharedAccess() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const listSharedAccess = async (): Promise<SharedAccess[]> => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/access");
      if (!response.ok) {
        throw new Error("Failed to fetch shared access");
      }
      return await response.json();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shared access",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getUserAccess = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/access/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user access");
      }
      return await response.json();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user access",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    listSharedAccess,
    getUserAccess,
    loading,
  };
}