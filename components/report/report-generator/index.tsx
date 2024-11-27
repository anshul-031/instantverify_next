"use client";

import { useState } from "react";
import { ReportHeader } from "./header";
import { ReportContent } from "./content";
import { ReportActions } from "./actions";
import { ReportStatus } from "./status";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";

interface ReportGeneratorProps {
  verificationId: string;
  data: {
    status: string;
    documentType: string;
    documentNumber: string;
    personPhoto: string;
    documentImage: string;
    createdAt: string;
    result?: any;
  };
}

export function ReportGenerator({ verificationId, data }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      setGenerating(true);
      await generatePDF(verificationId);
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="p-6" id="report-content">
      <div className="space-y-6">
        <ReportHeader
          documentType={data.documentType}
          documentNumber={data.documentNumber}
          createdAt={data.createdAt}
        />

        <ReportStatus status={data.status} />
        
        <ReportContent
          personPhoto={data.personPhoto}
          documentImage={data.documentImage}
          result={data.result}
        />

        <ReportActions
          verificationId={verificationId}
          onDownload={handleDownload}
          generating={generating}
        />
      </div>
    </Card>
  );
}