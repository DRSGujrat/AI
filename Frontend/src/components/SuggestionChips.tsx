import { MapPin, Compass, Globe } from "lucide-react";

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

const suggestions = [
  { icon: MapPin, text: "Delhi to Goa, ₹20k budget, 5 days in December" },
  { icon: Compass, text: "Weekend trip from Mumbai to Lonavala, budget ₹5,000" },
  { icon: Globe, text: "Plan a 7-day Europe trip from Bangalore, ₹2L budget" },
];

const SuggestionChips = ({ onSelect }: SuggestionChipsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.text)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-left text-sm text-foreground-muted hover:bg-[rgba(255,255,255,0.06)] hover:border-primary/20 hover:text-foreground transition-all duration-200"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <s.icon className="w-4 h-4 flex-shrink-0 text-primary/50 group-hover:text-primary transition-colors duration-200" />
          <span className="line-clamp-1">{s.text}</span>
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;
