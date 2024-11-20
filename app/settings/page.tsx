"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLanguageChange = async (value: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/language", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update language");
      }

      await update({ language: value });

      toast({
        title: "Language Updated",
        description: "Your preferred language has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update language. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Language Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select
                value={session?.user?.language || "en"}
                onValueChange={handleLanguageChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                This will change the language of the entire application.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}