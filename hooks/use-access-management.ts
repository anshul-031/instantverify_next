"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AccessGrant {
  id: string;
  userId: string;
  grantedToId: string;
  type: "VIEW" | "FULL";
  expiresAt: string;
}

export function useAccessManagement() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const grantAccess = async (email: string, type: "VIEW" | "FULL") => {
    try {
      setLoading(true);
      const response = await fetch("/api/access/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });

      if (!response.ok) {
        throw new Error("Failed to grant access");
      }

      toast({
        title: "Success",
        description: "Access granted successfully",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grant access. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async (grantId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/access/revoke/${grantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to revoke access");
      }

      toast({
        title: "Success",
        description: "Access revoked successfully",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke access. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const listAccessGrants = async (): Promise<AccessGrant[]> => {
    try {
      setLoading(true);
      const response = await fetch("/api/access/list");
      if (!response.ok) {
        throw new Error("Failed to fetch access grants");
      }
      return await response.json();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch access grants",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    grantAccess,
    revokeAccess,
    listAccessGrants,
    loading,
  };
}