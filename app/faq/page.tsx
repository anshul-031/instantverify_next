"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const faqs = [
  {
    question: "What is InstantVerify.in?",
    answer:
      "InstantVerify.in is a real-time background verification platform designed for the Indian context. We provide instant verification services including Aadhaar verification, criminal record checks, and police verification reports.",
  },
  {
    question: "How does the verification process work?",
    answer:
      "The verification process involves multiple steps: 1) Upload government ID and photo, 2) Verify through OTP, 3) Our system verifies your Aadhaar with UIDAI, 4) We check criminal records through public databases, 5) Generate a comprehensive verification report.",
  },
  {
    question: "What types of verification do you support?",
    answer:
      "We support various types of verification including Aadhaar verification, driving license verification, voter ID verification, and combinations of these with OTP verification for enhanced security.",
  },
  {
    question: "How long does the verification process take?",
    answer:
      "Most verifications are instant. However, comprehensive background checks might take up to 24-48 hours depending on the type of verification requested.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we follow strict security protocols. Your data is encrypted, stored securely, and only used for verification purposes. We comply with all relevant data protection regulations.",
  },
  {
    question: "What are the charges for verification?",
    answer:
      "Charges vary based on the type of verification and user category (B2C, B2B, or B2G). Please check our pricing section for detailed information.",
  },
  {
    question: "Can I verify someone else?",
    answer:
      "Yes, you can request verification from someone else by sending them a verification link. The link remains valid for 14 days.",
  },
  {
    question: "How can I download my verification report?",
    answer:
      "Once the verification is complete, you can download the report in PDF format from your dashboard or directly from the verification results page.",
  },
];

export default function FAQPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">
          Frequently Asked Questions
        </h1>

        <Card className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </div>
  );
}