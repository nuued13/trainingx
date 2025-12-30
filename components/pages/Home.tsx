"use client";

import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyThisMatters from "@/components/landing/WhyThisMatters";
import TimelineSection from "@/components/landing/TimelineSection";
import SkillsOpportunityHub from "@/components/landing/SkillsOpportunityHub";
import TrainersOrganizationsRevamp from "@/components/landing/TrainersOrganizationsRevamp";
import ComparisonSection from "@/components/landing/ComparisonSection";
import AffiliateProgram from "@/components/landing/AffiliateProgram";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import { TweetSlider } from "../ui/image-auto-slider";
import PromptToEverything from "../landing/PromptToEverything";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex flex-col">
        <Hero />
        <HowItWorks />
        <WhyThisMatters />
        <TweetSlider />

        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-32 md:space-y-40"> */}
        <TimelineSection />
        <PromptToEverything />
        <SkillsOpportunityHub />
        <TrainersOrganizationsRevamp />
        <ComparisonSection />
        {/* </div> */}

        <AffiliateProgram />

        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
