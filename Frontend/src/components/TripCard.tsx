import { Plane, MapPin, Calendar, DollarSign, Sparkles } from "lucide-react";

interface TripCardProps {
  title: string;
  destination: string;
  dates: string;
  budget: string;
  highlights: string[];
  status?: "searching" | "planning" | "complete";
}

const TripCard = ({ title, destination, dates, budget, highlights, status = "complete" }: TripCardProps) => {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] hover:-translate-y-1">
      {/* Status indicator */}
      {status !== "complete" && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-foreground-muted uppercase">
            {status === "searching" ? "Searching..." : "Planning..."}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <h4 className="text-lg font-semibold text-gradient-hero">{title}</h4>
        <div className="p-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]">
          <Plane className="w-4 h-4 text-primary" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <MapPin className="w-3.5 h-3.5 text-primary/70" />
          <span>{destination}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <Calendar className="w-3.5 h-3.5 text-primary/70" />
          <span>{dates}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <DollarSign className="w-3.5 h-3.5 text-primary/70" />
          <span>{budget}</span>
        </div>
      </div>

      {highlights.length > 0 && (
        <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-mono tracking-widest text-foreground-muted uppercase">Highlights</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {highlights.map((h, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-xs border border-primary/20 bg-primary/5 text-primary"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCard;
