"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfo } from "./sections/personal-info";
import { DocumentInfo } from "./sections/document-info";
import { BiometricInfo } from "./sections/biometric-info";
import { VerificationSteps } from "./sections/verification-steps";

interface ReportContentProps {
  personPhoto: string;
  documentImage: string;
  result?: any;
}

export function ReportContent({ personPhoto, documentImage, result }: ReportContentProps) {
  return (
    <Tabs defaultValue="personal" className="space-y-4">
      <TabsList>
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="document">Document</TabsTrigger>
        <TabsTrigger value="biometric">Biometric</TabsTrigger>
        <TabsTrigger value="steps">Steps</TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <PersonalInfo data={result?.personalInfo} />
      </TabsContent>

      <TabsContent value="document">
        <DocumentInfo image={documentImage} data={result?.documentInfo} />
      </TabsContent>

      <TabsContent value="biometric">
        <BiometricInfo 
          personPhoto={personPhoto} 
          documentPhoto={result?.documentPhoto}
          matchScore={result?.biometricMatch} 
        />
      </TabsContent>

      <TabsContent value="steps">
        <VerificationSteps steps={result?.steps || []} />
      </TabsContent>
    </Tabs>
  );
}