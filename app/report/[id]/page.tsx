"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Printer } from "lucide-react";
import { IdVerification } from "@/components/report/id-verification";
import { CourtRecords } from "@/components/report/court-records";
import { LocationInfo } from "@/components/report/location-info";
import { generatePDF } from "@/lib/pdf-generator";

interface Report {
  id: string;
  status: string;
  result: any;
  verificationId: string;
  createdAt: string;
}

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/report/${id}`);
        const data = await response.json();
        setReport(data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold">Report Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The requested verification report could not be found.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verification Report</h1>
          <p className="text-sm text-muted-foreground">
            ID: {report.verificationId}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => generatePDF(report.verificationId)}
          >
            <Download className="mr-2 h-4 w-4" />
            Save as PDF
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="id" className="space-y-4">
        <TabsList>
          <TabsTrigger value="id">ID Verification</TabsTrigger>
          <TabsTrigger value="court">Court Records</TabsTrigger>
          <TabsTrigger value="location">Location Info</TabsTrigger>
        </TabsList>

        <TabsContent value="id">
          <IdVerification data={report.result?.idVerification} />
        </TabsContent>

        <TabsContent value="court">
          <CourtRecords data={report.result?.courtRecords} />
        </TabsContent>

        <TabsContent value="location">
          <LocationInfo data={report.result?.location} />
        </TabsContent>
      </Tabs>
    </div>
  );
}