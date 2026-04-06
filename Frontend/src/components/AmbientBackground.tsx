const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]" />

      {/* Noise texture */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.015]">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Animated blobs */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[1400px] rounded-full bg-[#5E6AD2]/20 blur-[150px] animate-float-1" />
      <div className="absolute top-[10%] left-[-10%] w-[600px] h-[800px] rounded-full bg-[#7C3AED]/10 blur-[120px] animate-float-2" />
      <div className="absolute top-[30%] right-[-5%] w-[500px] h-[700px] rounded-full bg-[#4F46E5]/8 blur-[100px] animate-float-3" />
      <div className="absolute bottom-[-10%] left-1/3 w-[700px] h-[500px] rounded-full bg-[#5E6AD2]/10 blur-[130px] animate-pulse-glow" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
};

export default AmbientBackground;
