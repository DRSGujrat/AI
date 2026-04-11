import { Calendar, MapPin, Clock } from "lucide-react";

interface Activity {
  time: string;
  description: string;
  location: string;
}

interface DayPlan {
  day_number: number;
  date: string;
  theme: string;
  activities: Activity[];
}

interface ItineraryCardProps {
  itinerary: DayPlan[];
  totalCost?: number;
}

const ItineraryCard = ({ itinerary, totalCost }: ItineraryCardProps) => {
  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] hover:-translate-y-1">
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-[rgba(255,255,255,0.06)]">
        <h3 className="text-lg font-semibold text-gradient-hero mb-2">Day-by-Day Itinerary</h3>
        {totalCost && (
          <p className="text-sm text-foreground-muted">Total Estimated Cost: ₹{totalCost.toLocaleString()}</p>
        )}
      </div>

      {/* Days */}
      <div className="space-y-4">
        {itinerary.map((day, dayIndex) => (
          <div
            key={dayIndex}
            className="rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] p-4 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
          >
            {/* Day Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 font-semibold text-sm text-primary">
                  {day.day_number}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{day.theme}</h4>
                  <div className="flex items-center gap-1 text-xs text-foreground-muted mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{day.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities */}
            {day.activities && day.activities.length > 0 && (
              <div className="space-y-2 ml-11">
                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-primary/80">
                      <Clock className="w-3 h-3" />
                      <span>{activity.time}</span>
                    </div>
                    <p className="text-sm text-foreground-muted leading-relaxed">{activity.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-foreground-muted/70 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                    </div>
                    {actIndex < day.activities.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.03)] to-transparent my-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryCard;
