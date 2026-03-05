// components/ui/PhotoStrip.tsx
"use client";

import { X } from "lucide-react";
import { Photo } from "@/types";

interface Props {
  photos: Photo[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function PhotoStrip({ photos, selectedIndex, onSelect, onRemove }: Props) {
  if (photos.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
      {photos.map((photo, i) => {
        const isSelected = i === selectedIndex;
        return (
          <div
            key={photo.id}
            onClick={() => onSelect(i)}
            style={{
              border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
              boxShadow: isSelected ? "var(--shadow-accent2)" : "none",
              transform: isSelected ? "scale(1.08)" : "scale(1)",
              transition: "all 0.2s ease",
              cursor: "pointer",
              flexShrink: 0,
            }}
            className="relative w-16 h-12 rounded-lg overflow-hidden group"
          >
            <img
              src={photo.url}
              alt={photo.name}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

            {/* Remove button */}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              style={{ background: "var(--bg-surface)" }}
              className="absolute top-0.5 right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
            >
              <X size={10} strokeWidth={2.5} color="var(--text-secondary)" />
            </button>

            {/* Index number */}
            <div
              style={{
                background: "var(--bg-glass)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "8px",
                backdropFilter: "blur(4px)",
              }}
              className="absolute bottom-0.5 left-0.5 px-1 rounded"
            >
              {i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}