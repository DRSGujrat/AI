import { useState, useRef, useEffect, useCallback } from "react";
import { Plane, Sparkles } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import ChatMessage, { Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import SuggestionChips from "@/components/SuggestionChips";

// Simulated agent response — replace with real LangGraph SSE endpoint
const simulateAgentResponse = (userMessage: string): Promise<Message[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
          agentStep: "SEARCH_NODE → Analyzing preferences",
          tripData: undefined,
        },
      ]);
    }, 800);

    setTimeout(() => {
      // This would come from your LangGraph state
    }, 1500);
  });
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = async (text: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate agent steps — replace with real SSE from LangGraph
    await new Promise((r) => setTimeout(r, 1000));

    const stepMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Let me plan that trip for you! Searching for the best options...",
      agentStep: "SEARCH_NODE",
    };
    setMessages((prev) => [...prev, stepMsg]);

    await new Promise((r) => setTimeout(r, 2000));

    const resultMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Here's what I found — a great itinerary based on your preferences:",
      tripData: {
        title: "Goa Beach Getaway",
        destination: "Delhi → Goa",
        dates: "Dec 20 – Dec 25, 2025",
        budget: "₹22,500 estimated",
        highlights: ["Beach Hopping", "Night Markets", "Water Sports", "Old Goa Heritage"],
        status: "complete",
      },
    };
    setMessages((prev) => [...prev, resultMsg]);
    setIsLoading(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="relative min-h-screen flex flex-col">
      <AmbientBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,6,0.8)] backdrop-blur-xl">
        <div className="container max-w-3xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Plane className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm text-foreground tracking-tight">TripAgent</span>
            <span className="text-xs font-mono tracking-widest text-foreground-muted/50 uppercase ml-1">AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
            <span className="text-xs text-foreground-muted">Online</span>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 flex flex-col container max-w-3xl mx-auto px-4">
        {isEmpty ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_40px_rgba(94,106,210,0.15)]">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient-hero">
                Where to next?
              </h1>
              <p className="text-foreground-muted text-base md:text-lg max-w-md leading-relaxed">
                Tell me your trip details in plain English — source, destination, budget, dates, and preferences. I'll handle the rest.
              </p>
            </div>
            <SuggestionChips onSelect={handleSend} />
          </div>
        ) : (
          /* Messages */
          <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}

        {/* Input */}
        <div className="sticky bottom-0 py-4 bg-gradient-to-t from-[#050506] via-[#050506]/95 to-transparent">
          <ChatInput onSend={handleSend} disabled={isLoading} />
          <p className="text-center text-xs text-foreground-muted/40 mt-2">
            Powered by LangGraph Agent · Trip data is simulated
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
