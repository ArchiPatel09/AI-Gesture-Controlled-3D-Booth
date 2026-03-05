// components/ui/ShapeSelector.tsx
"use client";

import { ShapeType } from "@/types";

const SHAPES: { id: ShapeType; label: string; icon: string; desc: string; color: string }[] = [
  { id: "sphere",   label: "Sphere",   icon: "◉", desc: "Fibonacci spiral", color: "#63a2ff" },
  { id: "cube",     label: "Cube",     icon: "◧", desc: "6-face grid",      color: "#a78bfa" },
  { id: "cylinder", label: "Cylinder", icon: "◫", desc: "Stacked rings",    color: "#34d399" },
  { id: "torus",    label: "Torus",    icon: "◎", desc: "Donut shape",      color: "#f59e0b" },
  { id: "helix",    label: "Helix",    icon: "⌬", desc: "DNA spiral",       color: "#f472b6" },
  { id: "grid",     label: "Grid",     icon: "⊞", desc: "Flat mosaic",      color: "#00deff" },
];

interface Props {
  current: ShapeType;
  onChange: (shape: ShapeType) => void;
}

export default function ShapeSelector({ current, onChange }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {SHAPES.map(({ id, label, icon, desc, color }) => {
        const isActive = current === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              background: isActive ? `${color}18` : "var(--bg-hover)",
              border: `1.5px solid ${isActive ? color : "var(--border-strong)"}`,
              borderRadius: "14px",
              padding: "14px 12px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: isActive ? `0 0 20px ${color}30` : "none",
              transition: "all 0.2s ease",
            }}
            className="group"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
              <span
                style={{
                  fontSize: "18px",
                  lineHeight: 1,
                  color: isActive ? color : "var(--text-muted)",
                  transition: "color 0.2s",
                }}
              >
                {icon}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: isActive ? color : "var(--text-primary)",
                  transition: "color 0.2s",
                }}
              >
                {label}
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 500,
                color: isActive ? color : "var(--text-muted)",
                opacity: 0.8,
                letterSpacing: "0.04em",
              }}
            >
              {desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}