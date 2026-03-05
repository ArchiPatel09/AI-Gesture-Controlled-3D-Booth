"use client";

import { ShapeType } from "@/types";

const SHAPES: { id: ShapeType; label: string; icon: string }[] = [
  { id: "sphere",   label: "Sphere",   icon: "🌐" },
  { id: "cube",     label: "Cube",     icon: "📦" },
  { id: "cylinder", label: "Cylinder", icon: "🥫" },
  { id: "torus",    label: "Torus",    icon: "💿" },
  { id: "helix",    label: "Helix",    icon: "🧬" },
  { id: "grid",     label: "Grid",     icon: "⊞" },
];

interface Props {
  current: ShapeType;
  onChange: (shape: ShapeType) => void;
}

export default function ShapeSelector({ current, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SHAPES.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`
            py-2.5 px-2 rounded-xl border text-xs font-medium
            transition-all duration-200 cursor-pointer
            ${current === id
              ? "border-cyan-400/60 bg-gradient-to-br from-blue-500/25 to-cyan-400/15 text-cyan-300 shadow-[0_0_12px_rgba(0,245,255,0.2)]"
              : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/30 hover:text-white/90"
            }
          `}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
}