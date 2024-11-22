"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useCredits() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/user/credits");
        const data = await response.json();
        setCredits(data.credits);
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [session?.user?.id]);

  return { credits, loading, setCredits };
}