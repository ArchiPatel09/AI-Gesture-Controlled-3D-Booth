const HINTS = [
  { icon: "🖱️", label: "Drag to rotate" },
  { icon: "🔄", label: "Scroll to zoom" },
  { icon: "👆", label: "Click to select" },
  { icon: "📱", label: "Pinch zoom (mobile)" },
  { icon: "⏸️", label: "Auto-spins when idle" },
];

export default function GestureHints() {
  return (
    <div className="flex flex-col gap-2">
      {HINTS.map(({ icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-xs text-white/50">
          <span className="text-base w-5 text-center">{icon}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}