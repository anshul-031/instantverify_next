"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SubUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  credits: number;
  createdAt: string;
}

export function useSubUsers() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createSubUser = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/sub-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create sub-user");
      }

      toast({
        title: "Success",
        description: "Sub-user created successfully",
      });

      return await response.json();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sub-user",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const listSubUsers = async (): Promise<SubUser[]> => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/sub-users");
      if (!response.ok) {
        throw new Error("Failed to fetch sub-users");
      }
      return await response.json();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sub-users",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const transferCredits = async (subUserId: string, credits: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/user/sub-users/${subUserId}/credits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credits }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to transfer credits");
      }

      toast({
        title: "Success",
        description: "Credits transferred successfully",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to transfer credits",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSubUser,
    listSubUsers,
    transferCredits,
    loading,
  };
}