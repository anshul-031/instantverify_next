"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sign } from "jsonwebtoken";

interface VerificationProgress {
  status: string;
  progress: number;
  steps: Array<{
    name: string;
    status: string;
    description?: string;
    timestamp?: string;
  }>;
}

export function useVerificationProgress(verificationId: string) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<VerificationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id || !verificationId) return;

    // Initial fetch
    fetchProgress();

    // Set up WebSocket connection
    const token = sign(
      { sub: session.user.id },
      process.env.NEXT_PUBLIC_WS_SECRET!
    );
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/api/ws/verification?token=${token}`
    );

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe_verification",
          verificationId,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === "verification_progress" &&
          data.verificationId === verificationId
        ) {
          setProgress(data.data);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Failed to connect to progress updates");
      // Fall back to polling
      const interval = setInterval(fetchProgress, 5000);
      return () => clearInterval(interval);
    };

    return () => {
      ws.close();
    };
  }, [session?.user?.id, verificationId]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(
        `/api/verification-status/${verificationId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch verification status");
      }
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      setError("Failed to fetch verification status");
    }
  };

  return { progress, error, refetch: fetchProgress };
}