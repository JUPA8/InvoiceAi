"use client";

import { DemoSection } from "@/app/components/landing-page-components/SectionDemo";
import { Companies } from "../../components/landing-page-components/SectionCompanies";
import { FAQ } from "../../components/landing-page-components/SectionFAQ";
import { Features } from "../../components/landing-page-components/SectionFeatures";
import { Hero } from "../../components/landing-page-components/SectionHero";
import { HowItWorks } from "../../components/landing-page-components/SectionHowItWorks";
import { Pricing } from "../../components/landing-page-components/SectionPricing";
import { Trial } from "../../components/landing-page-components/SectionTrial";

export default function Home() {
  return (
    <>
      <Hero />
      <Companies />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <DemoSection />
      <Trial />
    </>
  );
}
