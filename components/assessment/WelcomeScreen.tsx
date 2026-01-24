"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Target,
  TrendingUp,
} from "lucide-react";

const generatedImage =
  "/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png";

interface WelcomeScreenProps {
  onStart: (name: string, email: string) => void;
}

const features = [
  {
    icon: Brain,
    title: "Prompt Score (0-100)",
    description: "Measure your AI communication skills",
  },
  {
    icon: Target,
    title: "4-Dimension Analysis",
    description: "Clarity, Constraints, Iteration, Tool Selection",
  },
  {
    icon: TrendingUp,
    title: "Personalized Roadmap",
    description: "Custom improvement recommendations",
  },
];

const normalizeEmail = (email: string) => {
  return email.trim().toLowerCase();
};

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && userEmail.trim()) {
      onStart(userName, normalizeEmail(userEmail));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-slate-50">
      {/* Background Asset */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <img
          src={generatedImage}
          alt="Background"
          className="w-full h-full object-cover opacity-50 blur-2xl"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              {/* <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-gradient-from to-gradient-to shadow-lg shadow-primary/30"
              >
                <Zap className="h-12 w-12 text-white" />
              </motion.div> */}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-slate-600 shadow-sm border-2 border-b-4 border-slate-200"
              >
                <Sparkles className="h-4 w-4 fill-current text-yellow-400" />
                <span>2-Minute Assessment</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
              >
                Discover Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradient-from to-gradient-to">
                  Prompt IQ
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-medium text-slate-500 leading-relaxed max-w-xl mx-auto"
              >
                Take our quick assessment to learn how well you work with AI.
                Get instant insights into your prompting skills!
              </motion.p>
            </div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Form Card */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onSubmit={handleSubmit}
              className="relative overflow-hidden rounded-3xl border-2 border-white bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-indigo-50 opacity-60 pointer-events-none" />

              <div className="relative space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-bold text-slate-700 uppercase tracking-wide"
                    >
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="h-14 text-base rounded-xl border-2 border-slate-200 bg-white/90 focus:border-primary/50 focus:ring-0 transition"
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-bold text-slate-700 uppercase tracking-wide"
                    >
                      Your Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      className="h-14 text-base rounded-xl border-2 border-slate-200 bg-white/90 focus:border-primary/50 focus:ring-0 transition"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-gradient-from to-gradient-to hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                  size="lg"
                  data-testid="button-start-assessment"
                >
                  Start Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-xs text-center text-slate-400 font-medium">
                  No account required. Your results will be saved for you.
                </p>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
