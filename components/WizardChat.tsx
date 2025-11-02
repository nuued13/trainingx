"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWizardContext } from "@/contexts/WizardContextProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function WizardChat() {
  const { context } = useWizardContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [location] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chatMutation = useMutation({
    mutationFn: async (currentMessages: Message[]) => {
      const response = await apiRequest("POST", "/api/wizard/chat", {
        messages: currentMessages,
        context,
      });

      const data = await response.json();
      return data.message;
    },
    onSuccess: (assistantMessage) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    const newMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ] as Message[];
    setMessages(newMessages);
    setInput("");
    chatMutation.mutate(newMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!mounted) return null;

  // Don't show wizard on assessment and quiz pages
  if (location.includes("/assessment") || location.includes("/quiz")) return null;

  return createPortal(
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[9999] bg-gradient-to-r from-[#0074B9] to-[#46BC61] hover:shadow-xl transition-all"
        >
          <span className="text-2xl">🧙‍♂️</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[500px] shadow-2xl z-[9999] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#0074B9] to-[#46BC61]">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧙‍♂️</span>
              <span className="font-semibold text-white">Ask the Wizard</span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              size="icon"
              variant="ghost"
              data-testid="button-close-wizard"
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <span className="text-6xl mb-4">🧙‍♂️</span>
                <h3 className="font-semibold text-lg mb-2">
                  Hi! I'm the Wizard
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about TrainingX.Ai! I can help you understand
                  the platform, explain features, or provide prompting tips.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    data-testid={`message-${msg.role}-${idx}`}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-[#0074B9] to-[#46BC61] text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div
                    className="flex justify-start"
                    data-testid="status-thinking"
                  >
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <p className="text-sm text-muted-foreground">
                        Thinking...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={chatMutation.isPending}
                data-testid="input-wizard-message"
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                data-testid="button-send-message"
                className="bg-gradient-to-r from-[#0074B9] to-[#46BC61]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>,
    document.body,
  );
}
