"use client";

import { ChevronLeft, GraduationCap, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AdultTypeSelectionProps {
  onSelect: (type: "student" | "professional") => void;
  onBack: () => void;
}

export function AdultTypeSelection({
  onSelect,
  onBack,
}: AdultTypeSelectionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-8">
      {/* Back Button */}
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-extrabold uppercase tracking-widest text-green-500">
          One more thing
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-slate-800">
          What best describes you?
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <TypeCard
          title="I'm a Student"
          subtitle="College or learning"
          icon={GraduationCap}
          color="purple"
          onClick={() => onSelect("student")}
        />
        <TypeCard
          title="I'm a Professional"
          subtitle="Working or career change"
          icon={Briefcase}
          color="blue"
          onClick={() => onSelect("professional")}
        />
      </div>
    </div>
  );
}

interface TypeCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: "purple" | "blue";
  onClick: () => void;
}

const colorClasses = {
  purple: {
    border: "border-purple-200 hover:border-purple-300",
    iconBg: "bg-purple-100",
    iconText: "text-purple-500",
    text: "text-purple-600",
  },
  blue: {
    border: "border-blue-200 hover:border-blue-300",
    iconBg: "bg-blue-100",
    iconText: "text-blue-500",
    text: "text-blue-600",
  },
};

function TypeCard({
  title,
  subtitle,
  icon: Icon,
  color,
  onClick,
}: TypeCardProps) {
  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 border-b-[6px] ${colors.border} bg-white text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:border-b-2`}
    >
      {/* Icon */}
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${colors.iconBg}`}
      >
        <Icon className={`w-8 h-8 ${colors.iconText}`} />
      </div>

      {/* Text */}
      <div className="space-y-1">
        <span className={`text-xl font-black text-slate-800 block`}>
          {title}
        </span>
        <span className="text-sm font-bold text-slate-400 block">
          {subtitle}
        </span>
      </div>
    </button>
  );
}
