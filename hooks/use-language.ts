"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import languages from "@/messages/languages.json";

export function useLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load translations for the current language
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(
          `/api/translations/${session?.user?.language || "en"}`
        );
        if (!response.ok) throw new Error("Failed to load translations");
        const translations = await response.json();
        window.__translations = translations;
      } catch (error) {
        console.error("Failed to load translations:", error);
      }
    };

    loadTranslations();
  }, [session?.user?.language]);

  const changeLanguage = async (language: string) => {
    try {
      setLoading(true);

      // Validate language code
      if (!languages.supported.find((lang) => lang.code === language)) {
        throw new Error("Invalid language code");
      }

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

      // Load new translations
      const translationsResponse = await fetch(`/api/translations/${language}`);
      if (!translationsResponse.ok) throw new Error("Failed to load translations");
      const translations = await translationsResponse.json();
      window.__translations = translations;

      // Update HTML dir attribute for RTL languages
      document.documentElement.dir = languages.rtlLanguages.includes(language)
        ? "rtl"
        : "ltr";

      // Refresh the page with the new locale
      router.refresh();

      toast({
        title: "Language Updated",
        description: "Your preferred language has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change language. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const translate = (key: string, params?: Record<string, string>) => {
    try {
      let translation = key.split(".").reduce((obj, key) => obj[key], window.__translations || {});
      if (!translation) return key;

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          translation = translation.replace(`{${key}}`, value);
        });
      }

      return translation;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  return {
    currentLanguage: session?.user?.language || languages.defaultLanguage,
    changeLanguage,
    translate,
    loading,
    isRTL: languages.rtlLanguages.includes(
      session?.user?.language || languages.defaultLanguage
    ),
  };
}