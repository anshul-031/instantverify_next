"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  verificationRequests: any[];
  verificationHistory: any[];
  credits: number;
  transactions: any[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    refetch: fetchDashboardData,
  };
}