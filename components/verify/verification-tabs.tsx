"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VERIFICATION_TYPES } from "@/lib/verification-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

interface VerificationTabsProps {
  onVerificationTypeChange: (type: string) => void;
}

export function VerificationTabs({ onVerificationTypeChange }: VerificationTabsProps) {
  const [activeTab, setActiveTab] = useState("ADVANCED");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedType(null);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    onVerificationTypeChange(type);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="ADVANCED" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ADVANCED">Advanced</TabsTrigger>
          <TabsTrigger value="MEDIUM">Medium</TabsTrigger>
          <TabsTrigger value="BASIC">Basic</TabsTrigger>
        </TabsList>

        {Object.entries(VERIFICATION_TYPES).map(([category, types]) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-4">
              {types.map((type) => (
                <div
                  key={type.value}
                  className={`flex flex-col space-y-2 rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedType === type.value
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleTypeSelect(type.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">{type.label}</h3>
                    </div>
                    {type.requiresOtp && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Requires OTP
                      </span>
                    )}
                  </div>

                  {selectedType === type.value && (
                    <div className="mt-4 space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{type.disclaimer}</AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Requirements:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {type.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {activeTab !== "ADVANCED" && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            Advanced verification provides the most comprehensive and reliable results. 
            We recommend using advanced verification for better accuracy.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}