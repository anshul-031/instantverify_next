"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Printer, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";

interface VerificationReport {
  id: string;
  status: string;
  purpose: string;
  documentType: string;
  documentNumber: string;
  personPhoto: string;
  documentImage: string;
  result?: {
    status?: "success" | "failed" | "warning";
    verificationScore?: number;
    personalInfo?: {
      name: string;
      dateOfBirth: string;
      gender: string;
      fatherName: string;
    };
    addressInfo?: {
      current: string;
      permanent: string;
      verified: boolean;
    };
    criminalRecords?: {
      status: "clear" | "found" | "pending";
      details?: string[];
    };
  };
  createdAt: string;
  updatedAt: string;
}

export function VerificationReport({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/report/${reportId}`);
        if (!response.ok) throw new Error("Failed to fetch report");
        const data = await response.json();
        setReport(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load verification report",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, toast]);

  const handleDownload = async () => {
    try {
      await generatePDF(reportId);
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Report Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The requested verification report could not be found.
          </p>
        </div>
      </Card>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon(report.result?.status)}
          <div>
            <h1 className="text-2xl font-bold">Verification Report</h1>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Verification Score</p>
                <p className="text-2xl font-bold">{report.result?.verificationScore || 0}%</p>
              </div>
              <Badge
                variant={
                  report.result?.status === "success"
                    ? "default"
                    : report.result?.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {(report.result?.status || "pending").toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Document Information</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {report.documentType} - {report.documentNumber}
                </p>
                <Badge variant={report.status === "completed" ? "default" : "destructive"}>
                  {report.status === "completed" ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="address">Address Details</TabsTrigger>
          <TabsTrigger value="criminal">Criminal Records</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.result?.personalInfo ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{report.result.personalInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{report.result.personalInfo.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{report.result.personalInfo.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Father's Name</p>
                    <p className="font-medium">{report.result.personalInfo.fatherName}</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Personal information not available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.result?.addressInfo ? (
                <>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium">Current Address</p>
                      <Badge variant={report.result.addressInfo.verified ? "default" : "destructive"}>
                        {report.result.addressInfo.verified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{report.result.addressInfo.current}</p>
                  </div>
                  <div>
                    <p className="mb-2 font-medium">Permanent Address</p>
                    <p className="text-muted-foreground">{report.result.addressInfo.permanent}</p>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">
                  Address information not available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criminal">
          <Card>
            <CardHeader>
              <CardTitle>Criminal Record Check</CardTitle>
            </CardHeader>
            <CardContent>
              {report.result?.criminalRecords ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Status</p>
                    <Badge
                      variant={
                        report.result.criminalRecords.status === "clear"
                          ? "default"
                          : report.result.criminalRecords.status === "found"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {report.result.criminalRecords.status.toUpperCase()}
                    </Badge>
                  </div>
                  {report.result.criminalRecords.details && (
                    <div className="space-y-2">
                      <p className="font-medium">Details</p>
                      <ul className="list-inside list-disc space-y-1">
                        {report.result.criminalRecords.details.map((detail, index) => (
                          <li key={index} className="text-muted-foreground">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Criminal record information not available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}