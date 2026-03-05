// components/ui/GestureHints.tsx

const HINTS = [
  { icon: "⤡", label: "Drag",   desc: "Rotate the 3D model", color: "#63a2ff" },
  { icon: "⊕", label: "Scroll", desc: "Zoom in or out",      color: "#00deff" },
  { icon: "⊙", label: "Click",  desc: "Select a photo",      color: "#a78bfa" },
  { icon: "⊗", label: "Pinch",  desc: "Zoom on mobile",      color: "#34d399" },
  { icon: "↻", label: "Idle",   desc: "Auto-rotates slowly", color: "#f59e0b" },
];

export default function GestureHints() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {HINTS.map(({ icon, label, desc, color }) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 10px",
            borderRadius: "10px",
            transition: "background 0.2s",
          }}
          className="hover:bg-[var(--bg-hover)]"
        >
          {/* Colored icon badge */}
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: `${color}18`,
              border: `1px solid ${color}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              color,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: 1.2,
              }}
            >
              {desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}