const TypingIndicator = () => {
  return (
    <div className="flex gap-3 animate-fade-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]">
        <div className="w-4 h-4 rounded-full bg-primary/30 animate-pulse" />
      </div>
      <div className="rounded-2xl px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground-muted animate-typing-1" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground-muted animate-typing-2" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground-muted animate-typing-3" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
