"use client";

import { HeroSection } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { UseCasesSection } from "@/components/landing/use-cases";
import { ServicesSection } from "@/components/landing/services";
import { PricingSection } from "@/components/landing/pricing";
import { ContactSection } from "@/components/landing/contact";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <UseCasesSection />
      <ServicesSection />
      <PricingSection />
      <ContactSection />
    </div>
  );
}