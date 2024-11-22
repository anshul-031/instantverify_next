"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { useTranslation } from "next-i18next";

const faqs = [
  {
    category: "General",
    questions: [
      {
        question: "What is InstantVerify.in?",
        answer:
          "InstantVerify.in is a real-time background verification platform designed for the Indian context. We provide instant verification services including Aadhaar verification, criminal record checks, and police verification reports.",
      },
      {
        question: "How secure is my data?",
        answer:
          "We follow strict security protocols and industry best practices. Your data is encrypted both in transit and at rest. We comply with all relevant data protection regulations and never share your information with unauthorized parties.",
      },
      {
        question: "Which locations do you cover?",
        answer:
          "We currently provide verification services across all major cities in India. Our criminal record checks cover all state high courts, district courts, and major tribunals.",
      },
    ],
  },
  {
    category: "Verification Process",
    questions: [
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
    ],
  },
  {
    category: "Pricing & Credits",
    questions: [
      {
        question: "What are the charges for verification?",
        answer:
          "Charges vary based on the type of verification and user category (B2C, B2B, or B2G). Please check our pricing section for detailed information.",
      },
      {
        question: "How do credits work?",
        answer:
          "Credits are pre-paid tokens used for verification requests. One verification consumes one credit. You can purchase credits in bulk with special pricing for business accounts.",
      },
      {
        question: "Do credits expire?",
        answer:
          "No, credits do not expire. Once purchased, they remain valid until used.",
      },
    ],
  },
  {
    category: "Account Management",
    questions: [
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
      {
        question: "Can I share my verification results?",
        answer:
          "Yes, you can share your verification results through a secure link that remains valid for 15 days.",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "What if I face technical issues?",
        answer:
          "Our support team is available 24/7. You can reach us through the contact form or email us at support@instantverify.in",
      },
      {
        question: "What browsers are supported?",
        answer:
          "We support all modern browsers including Chrome, Firefox, Safari, and Edge in their latest versions.",
      },
      {
        question: "Is the platform mobile-friendly?",
        answer:
          "Yes, our platform is fully responsive and works seamlessly on mobile devices and tablets.",
      },
    ],
  },
];

export default function FAQPage() {
  const { t } = useTranslation("common");

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">
          {t("faq.title", "Frequently Asked Questions")}
        </h1>

        {faqs.map((category, index) => (
          <Card key={index} className="mb-6">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">{category.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${index}-${faqIndex}`}
                  >
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Card>
        ))}

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            {t("faq.moreQuestions", "Still have questions?")}
          </p>
          <p className="mt-2">
            {t("faq.contactSupport", "Contact our support team at")}{" "}
            <a
              href="mailto:support@instantverify.in"
              className="text-primary hover:underline"
            >
              support@instantverify.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}