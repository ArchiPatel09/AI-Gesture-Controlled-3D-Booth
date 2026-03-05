"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface Props {
  onFiles: (files: FileList | File[]) => void;
}

export default function UploadZone({ onFiles }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    onFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFiles(e.target.files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
        transition-all duration-300 select-none
        ${isDragging
          ? "border-cyan-400 bg-cyan-500/10 scale-[1.02]"
          : "border-white/20 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.06]"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <div className="text-4xl mb-3">{isDragging ? "🎯" : "📸"}</div>
      <p className="text-white font-semibold text-sm mb-1">
        {isDragging ? "Drop your photos!" : "Upload Photos"}
      </p>
      <p className="text-white/40 text-xs">
        Drag & drop or click • JPG, PNG, WebP, GIF
      </p>
    </div>
  );
}