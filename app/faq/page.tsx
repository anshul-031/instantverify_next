import { Suspense } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

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
    ],
  },
  // Add more FAQ categories as needed
];

export default function FAQPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-3xl font-bold">Frequently Asked Questions</h1>

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
        </div>
      </div>
    </Suspense>
  );
}