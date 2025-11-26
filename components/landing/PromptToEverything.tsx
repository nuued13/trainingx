import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { PromptInput } from "./PromptInput";
import { OutputCard } from "./OutputCard";
import {
  Smartphone,
  Film,
  Megaphone,
  Type,
  Palette,
  Sparkles,
} from "lucide-react";

const bgImg = "/images/dark_cybernetic_grid_background.png";

const SCENARIOS = [
  {
    id: "app",
    prompt: "Design a fintech dashboard dark mode...",
    category: "App Generator",
    title: "Nexus Finance",
    imageSrc: "/images/futuristic_mobile_app_interface_dashboard.png",
    icon: Smartphone,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "movie",
    prompt: "Create a sci-fi movie poster on Mars...",
    category: "Movie Maker",
    title: "The Red Horizon",
    imageSrc: "/images/cinematic_sci-fi_movie_poster.png",
    icon: Film,
    color: "from-red-500 to-orange-500",
  },
  {
    id: "ad",
    prompt: "Generate a sneaker product advertisement...",
    category: "Ad Studio",
    title: "Velocity X-1",
    imageSrc: "/images/sleek_sneaker_product_advertisement.png",
    icon: Megaphone,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "blog",
    prompt: "Write a blog layout about minimalism...",
    category: "Blog Engine",
    title: "The Art of Less",
    imageSrc: "/images/modern_editorial_blog_layout.png",
    icon: Type,
    color: "from-gray-500 to-white",
  },
  {
    id: "graphic",
    prompt: "Render abstract neon 3D art...",
    category: "Graphic Suite",
    title: "Neon Dreams",
    imageSrc: "/images/abstract_digital_art_3d_render.png",
    icon: Palette,
    color: "from-green-500 to-emerald-500",
  },
];

export default function PromptToEverything() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Typing effect
  useEffect(() => {
    let currentScenario = SCENARIOS[currentIndex];
    let charIndex = 0;
    let timeoutId: NodeJS.Timeout;

    setIsTyping(true);
    setDisplayText("");

    const typeChar = () => {
      if (charIndex <= currentScenario.prompt.length) {
        setDisplayText(currentScenario.prompt.slice(0, charIndex));
        charIndex++;
        // Random typing speed for realism
        timeoutId = setTimeout(typeChar, 30 + Math.random() * 50);
      } else {
        setIsTyping(false);
        // Wait before switching to next
        timeoutId = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % SCENARIOS.length);
        }, 3000);
      }
    };

    typeChar();

    return () => clearTimeout(timeoutId);
  }, [currentIndex]);

  return (
    <div className="min-h-screen text-[#f8fafc] overflow-hidden font-sans selection:bg-[#00f2ea] selection:text-[#0f172a] relative bg-[#0f172a]">
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-40 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${bgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Hardcoded Dark Gradients */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, hsl(280 100% 60% / 0.15), transparent 40%),
            radial-gradient(circle at 0% 50%, hsl(180 100% 50% / 0.1), transparent 30%)
          `,
        }}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/20 via-[#0f172a]/80 to-[#0f172a] z-0 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-lg shadow-[#00f2ea]/5">
            <Sparkles className="w-4 h-4 text-[#00f2ea] animate-pulse" />
            <span className="text-sm font-mono tracking-wider text-[#00f2ea] uppercase">
              The Era of Generative Everything
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight mb-6 text-white drop-shadow-2xl">
            Your Prompting Skills <br />
            {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ea] via-white to-[#cc33ff] animate-gradient-x"> */}
            <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent animate-gradient-x">
              Infinite Creation.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[hsl(215,20%,65%)] font-light max-w-2xl mx-auto leading-relaxed">
            In 2025, the barrier between idea and reality is a single sentence.
            Experience the unified engine that powers apps, movies, ads, and
            more.
          </p>
        </motion.div>

        {/* Interaction Area */}
        <div className="w-full max-w-6xl space-y-16">
          {/* Input Section */}
          <div className="mb-12">
            <PromptInput currentText={displayText} isActive={!isTyping} />
          </div>

          {/* Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-[500px] items-end">
            {SCENARIOS.map((scenario, index) => (
              <div
                key={scenario.id}
                className={`transition-all duration-700 ease-out ${
                  index === currentIndex
                    ? "lg:-translate-y-8 lg:h-[450px] h-[400px] z-10"
                    : "lg:h-[350px] h-[100px] opacity-50 scale-95 z-0"
                }`}
              >
                <OutputCard {...scenario} isActive={index === currentIndex} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 text-center text-white/30 font-mono text-sm"
        ></motion.div>
      </div>
    </div>
  );
}
