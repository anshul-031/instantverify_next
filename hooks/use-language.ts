"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  const changeLanguage = async (language: string) => {
    try {
      setLoading(true);

      // Update user's preferred language in the database
      const response = await fetch("/api/settings/language", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });

      if (!response.ok) {
        throw new Error("Failed to update language");
      }

      // Update session with new language
      await update({ language });

      // Refresh the page with the new locale
      router.refresh();
    } catch (error) {
      console.error("Failed to change language:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentLanguage: session?.user?.language || "en",
    changeLanguage,
    loading,
  };
}