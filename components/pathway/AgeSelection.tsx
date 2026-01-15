"use client";

export type AgeGroup = "kid" | "teen" | "adult";

interface AgeSelectionProps {
  onSelect: (ageGroup: AgeGroup) => void;
}

export function AgeSelection({ onSelect }: AgeSelectionProps) {
  return (
    <div className="w-full max-w-3xl mx-auto text-center space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-extrabold uppercase tracking-widest text-blue-500">
          Let&apos;s personalize this for you
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-slate-800">
          How old are you?
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <AgeCard
          title="11-14 years"
          subtitle="Middle School"
          emoji="🌟"
          color="purple"
          onClick={() => onSelect("kid")}
        />
        <AgeCard
          title="15-18 years"
          subtitle="High School"
          emoji="🚀"
          color="blue"
          onClick={() => onSelect("teen")}
        />
        <AgeCard
          title="18+ years"
          subtitle="Adult"
          emoji="💼"
          color="green"
          onClick={() => onSelect("adult")}
        />
      </div>
    </div>
  );
}

interface AgeCardProps {
  title: string;
  subtitle: string;
  emoji: string;
  color: "purple" | "blue" | "green";
  onClick: () => void;
}

const colorClasses = {
  purple: {
    border: "border-purple-200 hover:border-purple-300",
    bg: "bg-white",
    text: "text-purple-600",
    subtitle: "text-purple-400",
  },
  blue: {
    border: "border-blue-200 hover:border-blue-300",
    bg: "bg-white",
    text: "text-blue-600",
    subtitle: "text-blue-400",
  },
  green: {
    border: "border-green-200 hover:border-green-300",
    bg: "bg-white",
    text: "text-green-600",
    subtitle: "text-green-400",
  },
};

function AgeCard({ title, subtitle, emoji, color, onClick }: AgeCardProps) {
  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-b-[6px] ${colors.border} ${colors.bg} text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:border-b-2`}
    >
      {/* Emoji */}
      <span className="text-5xl">{emoji}</span>

      {/* Text */}
      <div className="space-y-1">
        <span className={`text-xl font-black ${colors.text} block`}>
          {title}
        </span>
        <span
          className={`text-sm font-bold uppercase tracking-widest ${colors.subtitle} block`}
        >
          {subtitle}
        </span>
      </div>
    </button>
  );
}
