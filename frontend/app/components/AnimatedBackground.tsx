"use client";

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_20%_-10%,rgba(15,23,42,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_85%_15%,rgba(29,78,216,0.08),transparent)]" />

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27300%27 viewBox=%270 0 300 300%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%271%27 stitchTiles=%27stitch%27/></filter><rect width=%27300%27 height=%27300%27 filter=%27url(%23n)%27 opacity=%270.4%27/></svg>\")",
        }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-80" />
    </div>
  );
}
