import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface GameHeaderProps {
  onBack: () => void;
  levelTitle?: string;
  progress: number;
  answeredCount: number;
  totalCount: number;
}

export function GameHeader({ onBack, levelTitle, progress, answeredCount, totalCount }: GameHeaderProps) {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center gap-3 mb-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="text-emerald-300 hover:bg-white/10 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Brain className="w-10 h-10 text-emerald-300" />
        <div>
          <h1 className="text-4xl font-bold text-white">Practice Level</h1>
          {levelTitle && (
            <p className="text-emerald-200 text-sm font-medium">{levelTitle}</p>
          )}
        </div>
      </div>
      <p className="text-emerald-200 text-lg mb-4 font-medium">Complete challenges to master your skills</p>
      
      <div className="bg-white/10 rounded-full h-3 overflow-hidden border border-white/20 backdrop-blur-sm">
        <motion.div
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full shadow-lg"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-emerald-200 text-sm mt-2 font-semibold">
        Progress: {answeredCount} / {totalCount} cards completed
      </p>
    </div>
  );
}
