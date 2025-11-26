import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface OutputCardProps {
  title: string;
  category: string;
  imageSrc: string;
  icon: LucideIcon;
  isActive: boolean;
  delay?: number;
}

export function OutputCard({
  title,
  category,
  imageSrc,
  icon: Icon,
  isActive,
  delay = 0,
}: OutputCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5, y: 20 }}
      animate={{
        opacity: isActive ? 1 : 0.3,
        y: isActive ? 0 : 20,
        scale: isActive ? 1.05 : 0.95,
        filter: isActive ? "grayscale(0%)" : "grayscale(100%)",
      }}
      transition={{ duration: 0.5, delay }}
      className={`relative group overflow-hidden rounded-2xl border transition-colors duration-500 ${
        isActive
          ? "border-[#00f2ea]/50 shadow-[0_0_30px_rgba(0,242,234,0.15)]"
          : "border-white/5 bg-white/5"
      }`}
    >
      {/* Image Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-end min-h-[300px]">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider w-fit mb-3 backdrop-blur-md border ${
            isActive
              ? "bg-[#00f2ea]/20 border-[#00f2ea]/50 text-[#00f2ea]"
              : "bg-white/5 border-white/10 text-white/40"
          }`}
        >
          <Icon className="w-3 h-3" />
          {category}
        </div>

        <h3
          className={`font-display text-2xl font-bold leading-tight mb-1 transition-colors duration-300 ${
            isActive ? "text-white text-glow" : "text-white/50"
          }`}
        >
          {title}
        </h3>

        <p
          className={`text-sm transition-all duration-300 ${
            isActive
              ? "text-white/80 translate-y-0 opacity-100"
              : "text-white/0 translate-y-4 opacity-0"
          }`}
        >
          Generated in 0.4s
        </p>
      </div>

      {/* Active Glow Overlay */}
      {isActive && (
        <motion.div
          layoutId="active-glow"
          className="absolute inset-0 rounded-2xl border-2 border-[#00f2ea]/30 pointer-events-none z-20"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.div>
  );
}
