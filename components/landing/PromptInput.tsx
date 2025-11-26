import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Wand2 } from "lucide-react";

interface PromptInputProps {
  currentText: string;
  isActive: boolean;
}

export function PromptInput({ currentText, isActive }: PromptInputProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto z-20">
      {/* Glow Effect */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r from-[#00f2ea] via-[#cc33ff] to-[#00f2ea] rounded-xl opacity-75 blur transition duration-500 ${
          isActive ? "opacity-100 blur-md" : "opacity-30 blur-sm"
        }`}
      />

      <div className="relative flex items-center bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/5 text-[#00f2ea]">
          <Wand2 className={`w-6 h-6 ${isActive ? "animate-pulse" : ""}`} />
        </div>

        <div className="flex-1 px-4 font-mono text-lg md:text-xl text-white/90 overflow-hidden whitespace-nowrap">
          <span className="mr-2 text-white/40">{">"}</span>
          {currentText}
          <span className="inline-block w-2 h-5 ml-1 align-middle bg-[#00f2ea] animate-pulse" />
        </div>

        <button
          className={`p-3 rounded-lg transition-all duration-300 ${
            isActive
              ? "bg-[#00f2ea] text-[#0f172a] shadow-[0_0_20px_rgba(0,242,234,0.5)]"
              : "bg-white/10 text-white/50 hover:bg-white/20"
          }`}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Connecting Beams (Visual only, positioned absolutely) */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-1/2 top-full w-1 h-20 bg-gradient-to-b from-[#00f2ea] to-transparent -translate-x-1/2 origin-top blur-[1px]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
