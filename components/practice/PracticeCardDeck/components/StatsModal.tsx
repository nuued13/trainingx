import { motion } from "framer-motion";
import { BarChart } from "lucide-react";

interface StatsModalProps {
  levelDetails: any;
}

export function StatsModal({ levelDetails }: StatsModalProps) {
  if (!levelDetails) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20 shadow-xl"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <BarChart className="w-5 h-5 text-emerald-200" />
        Level Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-emerald-200 text-sm font-bold">Challenges</p>
          <p className="text-2xl font-bold text-white">{levelDetails.challengeCount}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-emerald-200 text-sm font-bold">Completed</p>
          <p className="text-2xl font-bold text-white">{levelDetails.progress?.challengesCompleted || 0}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-emerald-200 text-sm font-bold">Progress</p>
          <p className="text-2xl font-bold text-white">{levelDetails.progress?.percentComplete || 0}%</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-emerald-200 text-sm font-bold">Avg Score</p>
          <p className="text-2xl font-bold text-white">{Math.round(levelDetails.progress?.averageScore || 0)}</p>
        </div>
      </div>
    </motion.div>
  );
}
