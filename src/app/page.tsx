"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ShapeType } from "@/types";
import { usePhotos } from "@/hooks/usePhotos";
import Header from "@/components/ui/Header";
import UploadZone from "@/components/ui/UploadZone";
import ShapeSelector from "@/components/ui/ShapeSelector";
import PhotoStrip from "@/components/ui/PhotoStrip";
import GestureHints from "@/components/ui/GestureHints";

const ThreeScene = dynamic(() => import("@/components/three/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
      Loading 3D engine...
    </div>
  ),
});

export default function Home() {
  const { photos, selectedIndex, addPhotos, removePhoto, clearAll, selectPhoto } =
    usePhotos();
  const [shape, setShape] = useState<ShapeType>("sphere");

  // ✅ No <html> or <body> here — just your page content directly
  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a0a1a 0%, #0d1230 50%, #0a0a1a 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 20% 20%, rgba(68,136,255,0.08) 0%, transparent 55%),
                         radial-gradient(ellipse at 80% 80%, rgba(255,68,136,0.06) 0%, transparent 55%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(68,136,255,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(68,136,255,0.04) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Header */}
      <Header photoCount={photos.length} />

      {/* Main content area */}
      <div className="flex flex-1 relative overflow-hidden">

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0">
          {photos.length > 0 ? (
            <ThreeScene
              photos={photos}
              shape={shape}
              selectedIndex={selectedIndex}
              onSelectPhoto={selectPhoto}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/15 select-none">
              <div className="text-8xl opacity-20">🌐</div>
              <p className="text-lg font-semibold">Upload photos to see them in 3D</p>
              <p className="text-sm">Supports JPG, PNG, WebP, GIF</p>
            </div>
          )}
        </div>

        {/* Left Sidebar */}
        <aside className="relative z-10 w-64 flex flex-col gap-3 p-4 overflow-y-auto">
          <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/[0.07] p-4">
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-3">
              Upload Photos
            </p>
            <UploadZone onFiles={addPhotos} />
          </div>

          <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/[0.07] p-4">
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-3">
              3D Shape
            </p>
            <ShapeSelector current={shape} onChange={setShape} />
          </div>

          <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/[0.07] p-4">
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-3">
              Controls
            </p>
            <GestureHints />
          </div>

          {photos.length > 0 && (
            <button
              onClick={clearAll}
              className="w-full py-2.5 rounded-xl border border-red-500/25 bg-red-500/[0.07] text-red-400/70 text-xs font-medium hover:bg-red-500/15 hover:text-red-400 transition-all cursor-pointer"
            >
              🗑️ Clear All Photos
            </button>
          )}
        </aside>

        {/* Selected photo detail */}
        {selectedIndex !== null && photos[selectedIndex] && (
          <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-2xl rounded-2xl border border-cyan-400/30 p-4 w-48 shadow-[0_0_30px_rgba(0,245,255,0.15)]">
            <img
              src={photos[selectedIndex].url}
              alt="selected"
              className="w-full rounded-lg mb-3 object-cover"
            />
            <p className="text-white text-xs font-semibold mb-1">
              📷 Photo #{selectedIndex + 1}
            </p>
            <p className="text-white/35 text-[10px] break-all leading-relaxed mb-3">
              {photos[selectedIndex].name}
            </p>
            <button
              onClick={() => selectPhoto(selectedIndex)}
              className="w-full py-1.5 rounded-lg border border-white/10 bg-white/[0.05] text-white/40 text-[11px] hover:text-white/70 transition-colors cursor-pointer"
            >
              Deselect
            </button>
          </div>
        )}

        {/* Welcome hint */}
        {photos.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
            style={{ paddingLeft: "256px" }}
          >
            <div className="text-center text-white/30 select-none">
              <p className="text-sm mb-2">👈 Upload photos from the left panel</p>
              <p className="text-xs text-white/20">
                Then arrange them in beautiful 3D shapes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom photo strip */}
      {photos.length > 0 && (
        <div
          className="relative z-10 bg-black/60 backdrop-blur-2xl border-t border-white/[0.06] px-4 py-3 flex-shrink-0"
          style={{ marginLeft: "256px" }}
        >
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-2">
            Gallery — {photos.length} photos
          </p>
          <PhotoStrip
            photos={photos}
            selectedIndex={selectedIndex}
            onSelect={selectPhoto}
            onRemove={removePhoto}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between px-6 py-2 border-t border-white/[0.05] bg-black/30 backdrop-blur-xl flex-shrink-0">
        <span className="text-white/20 text-[11px]">
          Phase 1 of 4 — Core 3D Engine ✦ Next: Gesture Controls
        </span>
        <div className="flex gap-4 text-[11px]">
          <span className="text-green-400/60">● Three.js</span>
          <span className="text-blue-400/60">● WebGL 2.0</span>
          <span className="text-pink-400/60">● React 18</span>
        </div>
      </footer>
    </div>
  );
}