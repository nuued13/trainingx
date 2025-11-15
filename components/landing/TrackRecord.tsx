"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineEntry {
  year: string;
  title: string;
  description: string;
}

const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      id="track-record"
      className="w-full bg-background font-sans md:px-10  py-20"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto items-center justify-center flex flex-col px-4 md:px-8 lg:px-10 mb-8">
        <h2 className="text-center text-3xl sm:text-5xl mb-4 text-foreground max-w-4xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
          The TrainingX.AI Story
        </h2>
        <p className="text-center text-muted-foreground text-base sm:text-lg md:text-xl lg:max-w-2xl">
          From Spiral the Study Buddy to Universal Prompting Zone - a journey of innovation in AI-powered education.
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="mx-auto relative w-full flex justify-center pt-6 md:pt-14 pb-4 md:gap-4"
          >
            <div className="absolute top-0 left-3 md:left-11 lg:left-20 z-40 flex items-center gap-2 md:gap-4 justify-items-center justify-center mx-auto">
              <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border-2 border-gradient-from/30">
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-gradient-from to-gradient-to border-2 border-background p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:text-5xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                {item.year}
              </h3>
            </div>
            <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl pl-24 pr-4 md:pl-4">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                {item.year}
              </h3>
              <Card className="w-full border-2 border-border/50 bg-card backdrop-blur-sm hover:border-gradient-from/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="px-6 py-0 md:px-8">
                  <h4 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        <div
          className="absolute left-8 md:left-16 lg:left-25 top-0 bottom-0 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-border to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              scaleY: scrollYProgress,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 h-full w-[2px] origin-top rounded-full bg-gradient-to-t from-gradient-from via-gradient-to to-transparent from-[0%] via-[10%]"
          />
        </div>
      </div>
    </div>
  );
};

const TrackRecord = () => {
  const timelineData: TimelineEntry[] = [
    {
      year: "2015",
      title: "Spiral the Study Buddy",
      description: "The journey began with Spiral, an innovative study companion designed to help students learn more effectively through interactive AI-powered assistance."
    },
    {
      year: "2018",
      title: "NuuedScore",
      description: "Evolved into NuuedScore, a comprehensive scoring and assessment platform that revolutionized how educational progress is measured and tracked."
    },
    {
      year: "2021",
      title: "TrainingX.AI",
      description: "Launched TrainingX.AI, introducing Reactive Parallelism + Continuous AI to create adaptive learning experiences that fit every individual's unique learning style."
    },
    {
      year: "2023",
      title: "PromptToSuccess.AI",
      description: "Developed PromptToSuccess.AI, focusing on the art and science of prompting to unlock the full potential of AI-human collaboration in learning."
    },
    {
      year: "2024",
      title: "Universal Prompting Zone",
      description: "Established the Universal Prompting Zone, creating a comprehensive ecosystem where learners can master the skills needed for the AI-powered future."
    }
  ];

  return <Timeline data={timelineData} />;
};

export default TrackRecord;
