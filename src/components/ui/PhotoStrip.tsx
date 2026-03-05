"use client";

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
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          onClick={() => onSelect(i)}
          className={`
            relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden cursor-pointer
            transition-all duration-200
            ${i === selectedIndex
              ? "ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.5)] scale-105"
              : "ring-1 ring-white/15 hover:ring-white/40 hover:scale-105"
            }
          `}
        >
          <img
            src={photo.url}
            alt={photo.name}
            className="w-full h-full object-cover"
          />
          {/* Remove button — stopPropagation prevents triggering onSelect */}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full text-white text-[9px] flex items-center justify-center hover:bg-red-500/80 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}