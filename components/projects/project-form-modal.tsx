"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ChevronLeft, Rocket } from "lucide-react";

interface ProjectFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (filters: ProjectFilters) => void;
}

export interface ProjectFilters {
  difficulty: string;
  duration: string;
  interests: string;
  customDetails: string;
}

export function ProjectFormModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: ProjectFormModalProps) {
  const user = useQuery(api.users.viewer);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFilters>({
    difficulty: "Beginner",
    duration: "Weekend",
    interests: "",
    customDetails: "",
  });

  // Auto-suggest difficulty based on age
  useEffect(() => {
    if ((user as any)?.age) {
      if ((user as any).age < 12) {
        setFormData((prev) => ({ ...prev, difficulty: "Beginner" }));
      } else if ((user as any).age < 16) {
        setFormData((prev) => ({ ...prev, difficulty: "Intermediate" }));
      }
    }
  }, [user]);

  const handleSubmit = () => {
    onSubmit(formData);
    onOpenChange(false);
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  if (!user) return null;

  const difficultyOptions = [
    {
      val: "Beginner",
      emoji: "🌱",
      color: "bg-green-100 border-green-500 text-green-700",
    },
    {
      val: "Intermediate",
      emoji: "🔥",
      color: "bg-orange-100 border-orange-500 text-orange-700",
    },
    {
      val: "Advanced",
      emoji: "🚀",
      color: "bg-purple-100 border-purple-500 text-purple-700",
    },
  ];

  const durationOptions = [
    { val: "Quick", label: "Quick", sub: "< 4h", emoji: "⚡" },
    { val: "Weekend", label: "Weekend", sub: "4-12h", emoji: "🏖️" },
    { val: "Deep Dive", label: "Deep Dive", sub: "12h+", emoji: "🌊" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-100">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Project Arcade
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {step === 1
              ? "Choose your challenge level"
              : "Tell us what you like"}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 py-4 bg-slate-50">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                s === step ? "bg-blue-500 scale-110" : "bg-slate-300"
              }`}
            />
          ))}
        </div>

        <div className="p-6 bg-white">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Difficulty */}
                <div className="space-y-3">
                  <Label className="text-lg font-bold text-slate-800">
                    🎯 Select Difficulty
                  </Label>
                  <RadioGroup
                    value={formData.difficulty}
                    onValueChange={(val) =>
                      setFormData({ ...formData, difficulty: val })
                    }
                    className="grid grid-cols-3 gap-3"
                  >
                    {difficultyOptions.map((item) => (
                      <div key={item.val}>
                        <RadioGroupItem
                          value={item.val}
                          id={item.val}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={item.val}
                          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-b-4 p-4 cursor-pointer transition-all
                            ${
                              formData.difficulty === item.val
                                ? item.color
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                        >
                          <span className="text-2xl mb-1">{item.emoji}</span>
                          <span className="font-bold text-sm">{item.val}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <Label className="text-lg font-bold text-slate-800">
                    ⏱️ Time Commitment
                  </Label>
                  <RadioGroup
                    value={formData.duration}
                    onValueChange={(val) =>
                      setFormData({ ...formData, duration: val })
                    }
                    className="grid grid-cols-3 gap-3"
                  >
                    {durationOptions.map((item) => (
                      <div key={item.val}>
                        <RadioGroupItem
                          value={item.val}
                          id={item.val}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={item.val}
                          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-b-4 p-3 cursor-pointer transition-all text-center
                            ${
                              formData.duration === item.val
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                        >
                          <span className="text-xl mb-1">{item.emoji}</span>
                          <span className="font-bold text-sm">
                            {item.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {item.sub}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label
                    htmlFor="interests"
                    className="text-lg font-bold text-slate-800"
                  >
                    💡 Specific Interests
                  </Label>
                  <Input
                    id="interests"
                    placeholder="e.g. Dental, E-commerce, Space..."
                    value={formData.interests}
                    onChange={(e) =>
                      setFormData({ ...formData, interests: e.target.value })
                    }
                    className="h-12 text-base rounded-xl border-2 border-slate-200 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="custom"
                    className="text-lg font-bold text-slate-800"
                  >
                    ✍️ Anything else?
                  </Label>
                  <Textarea
                    id="custom"
                    placeholder="I want to learn React hooks..."
                    value={formData.customDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customDetails: e.target.value,
                      })
                    }
                    className="min-h-[100px] text-base rounded-xl border-2 border-slate-200 focus:border-blue-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 flex justify-between items-center gap-4">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-bold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <button
              onClick={nextStep}
              className="ml-auto px-8 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg shadow-lg border-b-4 border-blue-600 active:border-b-0 active:translate-y-[4px] transition-all"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="ml-auto flex items-center gap-2 px-8 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg border-b-4 border-green-600 active:border-b-0 active:translate-y-[4px] transition-all"
            >
              <Rocket className="w-5 h-5" />
              Generate!
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
