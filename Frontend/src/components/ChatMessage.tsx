import { Bot, User } from "lucide-react";
import TripCard from "./TripCard";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tripData?: {
    title: string;
    destination: string;
    dates: string;
    budget: string;
    highlights: string[];
    status?: "searching" | "planning" | "complete";
  };
  agentStep?: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 animate-fade-up ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${
          isUser
            ? "bg-primary/10 border-primary/30"
            : "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-foreground-muted" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[80%] space-y-3 ${isUser ? "items-end" : ""}`}>
        {/* Agent step indicator */}
        {message.agentStep && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono tracking-wider text-primary/70">
              {message.agentStep}
            </span>
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isUser
                ? "bg-primary/15 border border-primary/20 text-foreground ml-auto"
                : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-foreground-muted"
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Trip card */}
        {message.tripData && (
          <TripCard {...message.tripData} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
