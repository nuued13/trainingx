"use client";

import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyThisMatters from "@/components/landing/WhyThisMatters";
import PracticeZone from "@/components/landing/PracticeZone";
import AnalyticsCertificates from "@/components/landing/AnalyticsCertificates";
import CareerHub from "@/components/landing/CareerHub";
import SkillsMatchingDemo from "@/components/landing/SkillsMatchingDemo";
import YouthPath from "@/components/landing/YouthPath";
import TrainersOrganizations from "@/components/landing/TrainersOrganizations";
import ComparisonTable from "@/components/landing/ComparisonTable";
import TrackRecord from "@/components/landing/TrackRecord";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex flex-col">
        <Hero />
        <HowItWorks />
        <WhyThisMatters />
        <TrackRecord />
        <PracticeZone />
        {/* <SkillsMastery /> */}
        {/* <AnalyticsCertificates /> */}
        {/* <AppStudio /> */}
        <CareerHub />
        {/* <SkillsMatchingDemo /> */}
        {/* <YouthPath /> */}
        <TrainersOrganizations />
        <ComparisonTable />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
