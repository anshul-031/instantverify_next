"use client";

import { useParams } from "next/navigation";
import { VerificationReport } from "@/components/report/verification-report";

export default function ReportPage() {
  const { id } = useParams();

  return <VerificationReport reportId={id as string} />;
}