import { useState, useRef, useEffect, useCallback } from "react";
import { Plane, Sparkles } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import ChatMessage, { Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import SuggestionChips from "@/components/SuggestionChips";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cumulativeQuery, setCumulativeQuery] = useState("");
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

    const newQuery = cumulativeQuery ? `${cumulativeQuery}. ${text}` : text;
    setCumulativeQuery(newQuery);

    const stepMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Analyzing your request and talking to the Gemini Travel Planner...",
      agentStep: "COMMUNICATING WITH BACKEND",
    };

    // We append the typing indicator message that will stay in the log
    setMessages((prev) => [...prev, stepMsg]);

    try {
      const response = await fetch("http://localhost:8000/api/travel/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: newQuery }),
      });

      const data = await response.json();

      if (data.status === "missing_info") {
        const fields = data.missing_fields.join(", ");
        const missingMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `I'm still missing some necessary details to plan your trip. Could you please provide: **${fields}**?`,
          agentStep: "ASK_USER WAITING",
        };
        setMessages((prev) => [...prev, missingMsg]);
      } else if (data.status === "success") {
        const startDate = data.itinerary?.[0]?.date || "Date Unspecified";
        const totalDays = data.itinerary?.length || 0;
        const endDate = data.itinerary?.[totalDays - 1]?.date || "";
        const dateString = endDate && startDate !== endDate ? `${startDate} to ${endDate}` : startDate;

        let minFlight = "N/A";
        if (data.flight_cost) {
          minFlight = Math.min(...Object.values(data.flight_cost as Record<string, number>)).toString();
        }

        let minHotel = "N/A";
        if (data.hotel_cost) {
          minHotel = Math.min(...Object.values(data.hotel_cost as Record<string, number>)).toString();
        }

        const highlights = data.itinerary?.map((day: any) => `Day ${day.day_number}: ${day.theme}`) || [];

        const resultMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Here's what I found! AI has finalized a great itinerary based on your preferences:",
          tripData: {
            title: "Your Custom Setup",
            destination: "AI Generated Itinerary",
            dates: dateString,
            budget: `Est. Min Flights: ₹${minFlight} | Est. Min Hotel: ₹${minHotel}/night`,
            highlights: highlights,
            status: "complete",
          },
        };

        setMessages((prev) => [...prev, resultMsg]);
        setCumulativeQuery(""); // Reset chain for the next completely new request
      }
    } catch (e) {
      console.error(e);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I could not connect to the backend API (`http://localhost:8000`). Please ensure it is running.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

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
            Powered by LangGraph Agent
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
