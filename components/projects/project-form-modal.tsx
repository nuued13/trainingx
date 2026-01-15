"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

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
  const user = useQuery(api.users.currentUser);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFilters>({
    difficulty: "Beginner",
    duration: "Weekend",
    interests: "",
    customDetails: "",
  });

  // Auto-suggest difficulty based on age
  useEffect(() => {
    if (user?.age) {
      if (user.age < 12) {
        setFormData((prev) => ({ ...prev, difficulty: "Beginner" }));
      } else if (user.age < 16) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Project Arcade
          </DialogTitle>
          <DialogDescription>
            Customize your project recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Select Difficulty (
                    {user.age ? `Agreed for age ${user.age}` : "Recommended"})
                  </Label>
                  <RadioGroup
                    value={formData.difficulty}
                    onValueChange={(val) =>
                      setFormData({ ...formData, difficulty: val })
                    }
                    className="grid grid-cols-3 gap-4"
                  >
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <div key={level}>
                        <RadioGroupItem
                          value={level}
                          id={level}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={level}
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                        >
                          {level}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Time Commitment
                  </Label>
                  <RadioGroup
                    value={formData.duration}
                    onValueChange={(val) =>
                      setFormData({ ...formData, duration: val })
                    }
                    className="grid grid-cols-3 gap-4"
                  >
                    {[
                      { val: "Quick", label: "Quick", sub: "< 4h" },
                      { val: "Weekend", label: "Weekend", sub: "4-12h" },
                      { val: "Deep Dive", label: "Deep Dive", sub: "12h+" },
                    ].map((item) => (
                      <div key={item.val}>
                        <RadioGroupItem
                          value={item.val}
                          id={item.val}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={item.val}
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all text-center"
                        >
                          <span className="font-semibold">{item.label}</span>
                          <span className="text-xs text-muted-foreground mt-1">
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
                    className="text-base font-semibold"
                  >
                    Specific Interests / Domain (Optional)
                  </Label>
                  <Input
                    id="interests"
                    placeholder="e.g. Dental, E-commerce, Space Shooter, Finance..."
                    value={formData.interests}
                    onChange={(e) =>
                      setFormData({ ...formData, interests: e.target.value })
                    }
                    className="h-12"
                  />
                  <p className="text-sm text-slate-500">
                    We'll try to find projects matching these keywords.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="custom" className="text-base font-semibold">
                    Anything else? (Optional)
                  </Label>
                  <Textarea
                    id="custom"
                    placeholder="I want to learn React hooks... I like dark mode..."
                    value={formData.customDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customDetails: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between w-full">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <div /> // Spacer
          )}

          {step < 2 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Generate Projects
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
