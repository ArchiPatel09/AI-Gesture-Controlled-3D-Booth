// components/ui/UploadZone.tsx
"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, ImagePlus } from "lucide-react";

interface Props {
  onFiles: (files: FileList | File[]) => void;
  currentCount: number;
}

export default function UploadZone({ onFiles, currentCount }: Props) {
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
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
      }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border-strong)"}`,
        background: isDragging
          ? "linear-gradient(135deg, var(--accent-dim), var(--accent2-dim))"
          : "var(--bg-hover)",
        borderRadius: "18px",
        padding: "28px 20px",
        textAlign: "center",
        cursor: "pointer",
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        boxShadow: isDragging ? "var(--shadow-accent)" : "none",
        transition: "all 0.25s ease",
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />

      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: isDragging
            ? "linear-gradient(135deg, var(--accent-dim), var(--accent2-dim))"
            : "var(--bg-elevated)",
          border: `1px solid ${isDragging ? "var(--border-accent)" : "var(--border-strong)"}`,
          color: isDragging ? "var(--accent)" : "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: isDragging ? "var(--shadow-accent)" : "none",
        }}
      >
        {isDragging
          ? <ImagePlus size={26} strokeWidth={1.8} />
          : <UploadCloud size={26} strokeWidth={1.8} />
        }
      </div>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "6px",
        }}
      >
        {isDragging ? "Release to add!" : "Drop photos here"}
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          color: "var(--text-secondary)",
          marginBottom: "16px",
        }}
      >
        or click to browse files
      </p>

      {/* Format chips */}
      <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
        {["JPG", "PNG", "WEBP", "GIF"].map((fmt) => (
          <span
            key={fmt}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 500,
              padding: "3px 10px",
              borderRadius: "6px",
            }}
          >
            {fmt}
          </span>
        ))}
      </div>

      {currentCount > 0 && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--accent)",
            fontWeight: 600,
            marginTop: "14px",
          }}
        >
          ✦ {currentCount} photo{currentCount !== 1 ? "s" : ""} loaded
        </p>
      )}
    </div>
  );
}