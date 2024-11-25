"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import languages from "@/messages/languages.json";
import { frontendLogger } from "@/lib/logger";

export function useLanguage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Load translations for the current language
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        frontendLogger.debug('Loading translations', {
          language: session?.user?.language || "en"
        });

        const response = await fetch(
          `/api/translations/${session?.user?.language || "en"}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to load translations");
        }
        
        const data = await response.json();
        setTranslations(data);
        window.__translations = data;

        frontendLogger.debug('Translations loaded successfully', {
          language: session?.user?.language || "en",
          translationKeys: Object.keys(data)
        });
      } catch (error) {
        frontendLogger.error('Failed to load translations', error);
        toast({
          title: "Error",
          description: "Failed to load translations. Using default language.",
          variant: "destructive",
        });
      }
    };

    loadTranslations();
  }, [session?.user?.language, toast]);

  const changeLanguage = async (language: string) => {
    try {
      setLoading(true);
      frontendLogger.debug('Changing language', { language });

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
      if (!translationsResponse.ok) {
        throw new Error("Failed to load translations");
      }
      
      const newTranslations = await translationsResponse.json();
      setTranslations(newTranslations);
      window.__translations = newTranslations;

      // Update HTML dir attribute for RTL languages
      document.documentElement.dir = languages.rtlLanguages.includes(language)
        ? "rtl"
        : "ltr";

      // Refresh the page with the new locale
      router.refresh();

      frontendLogger.info('Language changed successfully', { language });

      toast({
        title: "Language Updated",
        description: "Your preferred language has been updated.",
      });
    } catch (error) {
      frontendLogger.error('Language change failed', error);
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
      frontendLogger.debug('Translating key', { key, params });
      let translation = key.split(".").reduce((obj, k) => obj?.[k], translations);
      
      if (!translation) {
        frontendLogger.debug('Translation not found', { key });
        return key;
      }

      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          translation = translation.replace(`{${paramKey}}`, value);
        });
      }

      return translation;
    } catch (error) {
      frontendLogger.error('Translation error', { key, error });
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