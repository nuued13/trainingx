"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function AffiliateProgram() {
  return (
    <section className="py-24 relative overflow-hidden bg-white/50">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1 border-slate-200 text-slate-600 bg-white/80 backdrop-blur-sm"
          >
            <Sparkles className="w-3 h-3 mr-0.5" />
            Coming Soon
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 leading-10">
            Be part of our Mission
            <br />
            {/* <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent tracking-tight inline-block pb-2">
              Be part of our Mission
            </span> */}
          </h2>

          <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
            We’re building this to make AI easy and accessible for everyone.
            Soon, you’ll be able to support that mission by sharing the product
            with others and getting rewarded for it. Affiliate program coming
            soon.
          </p>
          {/* 
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200/50">
            <span>Activating globally on launch date</span>
          </div> */}
        </motion.div>
      </div>
    </section>
  );
}
