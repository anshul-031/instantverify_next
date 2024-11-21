"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function SystemSettings() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setLoading(true);
      // Save settings logic here
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Google Login</Label>
              <p className="text-sm text-muted-foreground">
                Enable/disable Google OAuth login
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Facebook Login</Label>
              <p className="text-sm text-muted-foreground">
                Enable/disable Facebook OAuth login
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>GitHub Login</Label>
              <p className="text-sm text-muted-foreground">
                Enable/disable GitHub OAuth login
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credit Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCredits">Default Credits</Label>
              <Input
                id="defaultCredits"
                type="number"
                placeholder="Enter default credits for new users"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPurchase">Minimum Purchase Amount</Label>
              <Input
                id="minPurchase"
                type="number"
                placeholder="Enter minimum purchase amount"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}