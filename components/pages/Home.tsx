"use client";

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PracticeZone from "@/components/PracticeZone";
import SkillsMastery from "@/components/SkillsMastery";
import LiveMatchPreview from "@/components/LiveMatchPreview";
import CareerHub from "@/components/CareerHub";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

// Default skill values for homepage preview
const defaultSkills = {
  generative_ai: 0,
  agentic_ai: 0,
  synthetic_ai: 0,
  coding: 0,
  agi_readiness: 0,
  communication: 0,
  logic: 0,
  planning: 0,
  analysis: 0,
  creativity: 0,
  collaboration: 0,
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex flex-col gap-24 pb-24">
        <Hero />
        <HowItWorks />
        <PracticeZone />
        <SkillsMastery />
        <LiveMatchPreview
          currentPS={0}
          currentSkills={defaultSkills}
          completedProjects={0}
          completedProjectSlugs={[]}
        />
        <CareerHub />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
