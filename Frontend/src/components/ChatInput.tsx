import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  return (
    <div className="relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_-4px_24px_rgba(0,0,0,0.3)] transition-all duration-200 focus-within:border-primary/30 focus-within:shadow-[0_0_0_1px_rgba(94,106,210,0.2),0_0_30px_rgba(94,106,210,0.08)]">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Plan my trip from Delhi to Goa, budget ₹25,000, Dec 20-25..."
        disabled={disabled}
        rows={1}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted/50 px-4 pt-4 pb-3 pr-24 resize-none outline-none leading-relaxed disabled:opacity-50"
      />
      <div className="absolute right-2 bottom-2 flex items-center gap-1">
        <button
          type="button"
          className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
          aria-label="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="p-2 rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:bg-[#6872D9] active:scale-[0.96] transition-all duration-200 disabled:opacity-30 disabled:shadow-none disabled:hover:bg-primary"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
