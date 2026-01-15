"use client";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Video,
  Code,
  Music,
  Type,
  MessageSquare,
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  features: string[];
}

const platforms: Platform[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description:
      "OpenAI's conversational AI for text generation, coding, and problem-solving",
    url: "https://chat.openai.com",
    category: "Conversational AI",
    features: [
      "GPT-5.2",
      "GPT Image Gen 1.5",
      "Advanced Multi-modal",
      "SearchGPT Integration",
    ],
  },
  {
    id: "claude",
    name: "Claude",
    description:
      "Anthropic's AI assistant focused on helpful, harmless, and honest conversations",
    url: "https://claude.ai",
    category: "Conversational AI",
    features: [
      "Claude 4.5 Opus",
      "Claude 4.5 Sonnet",
      "Artifacts 2.0",
      "Coding",
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description:
      "Google's most capable AI model, integrated with Google Workspace",
    url: "https://gemini.google.com",
    category: "Conversational AI",
    features: ["Gemini 3", "Nano Banana (Gemini)", "2M Context", "Workspace"],
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    description:
      "AI companion powered by GPT-5.2 and integrated into Windows and Office",
    url: "https://copilot.microsoft.com",
    category: "Conversational AI",
    features: ["Office 365", "Windows 11 Pro", "GPT-5.2 Vision", "Web Search"],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description:
      "AI-powered search engine with real-time web search capabilities",
    url: "https://www.perplexity.ai",
    category: "Search & Research",
    features: [
      "Real-time search",
      "Citations",
      "Pro Search",
      "Source verification",
    ],
  },
  {
    id: "notebook-lm",
    name: "Notebook LM",
    description: "Google's AI-powered note-taking and research assistant",
    url: "https://notebooklm.google.com",
    category: "Search & Research",
    features: [
      "Audio Overviews",
      "Source grounding",
      "Document analysis",
      "Smart citations",
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description: "The world's most widely adopted AI developer tool",
    url: "https://github.com/features/copilot",
    category: "Coding & Tech",
    features: ["Auto-complete", "Chat", "CLI support", "Unit tests"],
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "The AI-first code editor built for pair programming",
    url: "https://cursor.com",
    category: "Coding & Tech",
    features: [
      "Codebase indexing",
      "AI Chat",
      "Autocomplete",
      "Code transforms",
    ],
  },
  {
    id: "antigravity",
    name: "Antigravity",
    description: "Advanced agentic AI coding assistant for complex projects",
    url: "#",
    category: "Coding & Tech",
    features: [
      "Full autonomy",
      "Multi-file edits",
      "Deep reasoning",
      "Agentic",
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    description: "The agentic IDE that flows with your thoughts",
    url: "https://codeium.com/windsurf",
    category: "Coding & Tech",
    features: ["Context-aware", "Flow state", "Project indexing", "Deep AI"],
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    description: "The AI system that translates natural language to code",
    url: "https://openai.com/blog/openai-codex",
    category: "Coding & Tech",
    features: ["Direct API", "Language translation", "Auto-regressive", "Fast"],
  },
  {
    id: "claude-code",
    name: "Claude Code",
    description: "CLI tool for agentic coding with Claude 4.5",
    url: "#",
    category: "Coding & Tech",
    features: ["CLI access", "Agentic loops", "Tool use", "Local index"],
  },
  {
    id: "droid",
    name: "Droid",
    description: "Autonomous AI software engineer for high-speed dev",
    url: "#",
    category: "Coding & Tech",
    features: ["Self-healing", "PR automation", "End-to-end", "Autonomous"],
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Highest quality AI image generation via Discord and Web",
    url: "https://www.midjourney.com",
    category: "Design & Image",
    features: [
      "Artistic styles",
      "V6.5 Engine",
      "In-painting",
      "Nano Banana Mode",
    ],
  },
  {
    id: "leonardo",
    name: "Leonardo.ai",
    description: "Enterprise-grade image generation and creative toolset",
    url: "https://leonardo.ai",
    category: "Design & Image",
    features: ["Character ref", "Motion", "Canvas editor", "GPT Image Gen 1.5"],
  },
  {
    id: "firefly",
    name: "Adobe Firefly",
    description: "Adobe's family of creative generative AI models",
    url: "https://firefly.adobe.com",
    category: "Design & Image",
    features: ["Generative Fill", "Text to Vector", "Text effects", "Recolor"],
  },
  {
    id: "gamma",
    name: "Gamma",
    description: "AI-powered presentation and document creation tool",
    url: "https://gamma.app",
    category: "Content & Writing",
    features: ["Presentations", "Webpages", "One-click styling", "Analytics"],
  },
  {
    id: "jasper",
    name: "Jasper",
    description: "AI marketing platform for enterprise content creation",
    url: "https://jasper.ai",
    category: "Content & Writing",
    features: ["Brand voice", "Campaigns", "SEO mode", "Team collab"],
  },
  {
    id: "runway",
    name: "Runway",
    description: "Professional AI video generation and editing tools",
    url: "https://runwayml.com",
    category: "Video & Motion",
    features: ["Gen-3 Alpha", "Motion brush", "Lip sync", "Video to video"],
  },
  {
    id: "luma",
    name: "Luma Dream Machine",
    description: "High-fidelity video generation from images and text",
    url: "https://lumalabs.ai/dream-machine",
    category: "Video & Motion",
    features: ["Realistic motion", "Fast generation", "Multi-shot", "High res"],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "State-of-the-art AI voice generation and cloning",
    url: "https://elevenlabs.io",
    category: "Audio & Music",
    features: ["Speech to Speech", "Voice Design", "Multilingual", "API"],
  },
  {
    id: "suno",
    name: "Suno",
    description: "Leading AI music generation platform for full songs",
    url: "https://suno.com",
    category: "Audio & Music",
    features: ["Custom lyrics", "Style tags", "V3.5 Engine", "Full songs"],
  },
  {
    id: "heygen",
    name: "HeyGen",
    description: "AI video generation platform for professional avatars",
    url: "https://heygen.com",
    category: "Video & Motion",
    features: ["Custom avatars", "Instant clone", "Translation", "Templates"],
  },
  {
    id: "grok",
    name: "Grok",
    description: "xAI's conversational AI with real-time access to X (Twitter)",
    url: "https://x.ai",
    category: "Conversational AI",
    features: ["Real-time X data", "Unfiltered", "Grok-2", "Coding"],
  },
  {
    id: "phind",
    name: "Phind",
    description: "The AI search engine for developers",
    url: "https://www.phind.com",
    category: "Coding & Tech",
    features: ["Code search", "Pair programming", "Model selection", "Fast"],
  },
  {
    id: "copy-ai",
    name: "Copy.ai",
    description: "AI platform for GTM teams to automate content workflows",
    url: "https://www.copy.ai",
    category: "Content & Writing",
    features: ["Workflows", "Brand voice", "Marketing copy", "Templates"],
  },
  {
    id: "canva",
    name: "Canva Magic Studio",
    description: "All-in-one AI-powered design tools within Canva",
    url: "https://www.canva.com/magic",
    category: "Design & Image",
    features: ["Magic Media", "Magic Expand", "Magic Edit", "Presentations"],
  },
  {
    id: "udio",
    name: "Udio",
    description: "AI music creation for high-fidelity songs and vocals",
    url: "https://www.udio.com",
    category: "Audio & Music",
    features: ["Vocal clarity", "Genre blending", "Remixing", "Full tracks"],
  },
  {
    id: "descript",
    name: "Descript",
    description: "AI-powered video and podcast editing via text",
    url: "https://www.descript.com",
    category: "Audio & Music",
    features: ["Overdub", "Filler word removal", "Studio Sound", "Text-edit"],
  },
  {
    id: "manus",
    name: "Manus",
    description:
      "Multi-purpose AI Agent, which can do extensive research and long running tasks",
    url: "https://manus.im",
    category: "Search & Research",
    features: ["Long running tasks", "Research"],
  },
  {
    id: "pika",
    name: "Pika Labs",
    description: "Idea-to-video platform for high-quality animation",
    url: "https://pika.art",
    category: "Video & Motion",
    features: ["Pika 1.5", "Lip sync", "Sound effects", "Styling"],
  },
  {
    id: "replicate",
    name: "Replicate",
    description: "Cloud API to run open-source AI models",
    url: "https://replicate.com",
    category: "Design & Image",
    features: ["API access", "Model hosting", "Llama 3", "Stable Diffusion"],
  },
];

const categories = Array.from(new Set(platforms.map((p) => p.category)));

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Conversational AI":
      return <MessageSquare className="h-6 w-6 stroke-3" />;
    case "Search & Research":
      return <Sparkles className="h-6 w-6 stroke-3" />;
    case "Coding & Tech":
      return <Code className="h-6 w-6 stroke-3" />;
    case "Design & Image":
      return <ImageIcon className="h-6 w-6 stroke-3" />;
    case "Content & Writing":
      return <Type className="h-6 w-6 stroke-3" />;
    case "Video & Motion":
      return <Video className="h-6 w-6 stroke-3" />;
    case "Audio & Music":
      return <Music className="h-6 w-6 stroke-3" />;
    default:
      return <Zap className="h-6 w-6 stroke-3" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Conversational AI":
      return "text-blue-500 bg-blue-100 border-blue-200";
    case "Search & Research":
      return "text-purple-500 bg-purple-100 border-purple-200";
    case "Coding & Tech":
      return "text-indigo-500 bg-indigo-100 border-indigo-200";
    case "Design & Image":
      return "text-pink-500 bg-pink-100 border-pink-200";
    case "Content & Writing":
      return "text-amber-500 bg-amber-100 border-amber-200";
    case "Video & Motion":
      return "text-orange-500 bg-orange-100 border-orange-200";
    case "Audio & Music":
      return "text-green-500 bg-green-100 border-green-200";
    default:
      return "text-slate-500 bg-slate-100 border-slate-200";
  }
};

export default function PlatformGPTsPage() {
  return (
    <SidebarLayout>
      <div className="h-full overflow-auto bg-slate-50/50">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-b-[6px] border-indigo-200 bg-white text-indigo-500 shadow-sm">
                <Sparkles className="h-8 w-8 stroke-3" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                  AI Directory
                </h1>
                <p className="text-lg font-medium text-slate-500">
                  The ultimate directory of cutting-edge AI platforms.
                </p>
              </div>
            </div>

            <div className="relative flex-1 max-w-sm">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search AI tools..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-b-[5px] border-slate-200 bg-white focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${getCategoryColor(category)}`}
                >
                  {getCategoryIcon(category)}
                </div>
                <h2 className="text-xl font-extrabold text-slate-700">
                  {category}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms
                  .filter((p) => p.category === category)
                  .map((platform) => (
                    <div
                      key={platform.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                            {platform.name}
                          </h3>
                          <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            {platform.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {platform.features.map((feature) => (
                            <span
                              key={feature}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 pt-0 mt-auto">
                        <JuicyButton
                          variant="secondary"
                          className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200"
                          asChild
                        >
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            Visit Platform
                            <ExternalLink className="h-4 w-4 stroke-3" />
                          </a>
                        </JuicyButton>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="mt-8 rounded-3xl border-2 border-b-[6px] border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
                <Zap className="h-6 w-6 stroke-3" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                  Pro Tip
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Maximize your AI skills by practicing with multiple platforms.
                  Each has unique strengths that can enhance different aspects
                  of your workflow. Try combining tools for better results!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
