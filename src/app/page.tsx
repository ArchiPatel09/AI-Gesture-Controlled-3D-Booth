// app/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Trash2, ChevronRight } from "lucide-react";
import { ShapeType } from "@/types";
import { usePhotos } from "@/hooks/usePhotos";
import { useHandGestures } from "@/hooks/useHandGestures";
import { useTheme } from "@/components/ui/ThemeProvider";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import UploadZone from "@/components/ui/UploadZone";
import ShapeSelector from "@/components/ui/ShapeSelector";
import PhotoStrip from "@/components/ui/PhotoStrip";
import GestureHints from "@/components/ui/GestureHints";
import GesturePanel from "@/components/camera/GesturePanel";

const ThreeScene = dynamic(() => import("@/components/three/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4"
      style={{ color: "var(--text-muted)" }}>
      <div className="w-10 h-10 rounded-full border-2 animate-spin"
        style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--accent)" }} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>
        Initializing 3D engine...
      </span>
    </div>
  ),
});

const SIDEBAR_W = 300;

export default function Home() {
  const { photos, selectedIndex, addPhotos, removePhoto, clearAll, selectPhoto } = usePhotos();
  const [shape, setShape] = useState<ShapeType>("sphere");
  const { theme } = useTheme();

  // Phase 2: gesture hook — returns refs + state + controls
  const {
    videoRef,
    canvasRef,
    gestureStateRef,  // ← passed to ThreeScene, read each animation frame
    isLoading: gestureLoading,
    isActive: gestureActive,
    error: gestureError,
    gestureLabel,
    start: startGestures,
    stop: stopGestures,
  } = useHandGestures();

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: "var(--bg-base)", fontFamily: "var(--font-sans)" }}
    >
      <Header photoCount={photos.length} shape={shape} />

      <div className="flex flex-1 relative overflow-hidden">

        {/* Background ambience */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0" style={{
            background: theme === "dark"
              ? `radial-gradient(ellipse at 15% 30%, rgba(99,162,255,0.09) 0%, transparent 55%),
                 radial-gradient(ellipse at 85% 70%, rgba(0,222,255,0.06) 0%, transparent 55%),
                 radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.04) 0%, transparent 60%)`
              : `radial-gradient(ellipse at 20% 20%, rgba(37,99,235,0.07) 0%, transparent 55%),
                 radial-gradient(ellipse at 80% 80%, rgba(0,136,204,0.05) 0%, transparent 55%)`,
          }} />
          {theme === "dark" && (
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(99,162,255,0.04) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(99,162,255,0.04) 1px, transparent 1px)`,
              backgroundSize: "72px 72px",
            }} />
          )}
        </div>

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0">
          {photos.length > 0 ? (
            <ThreeScene
              photos={photos}
              shape={shape}
              selectedIndex={selectedIndex}
              onSelectPhoto={selectPhoto}
              gestureStateRef={gestureStateRef}
            />   
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-5 select-none"
              style={{ paddingLeft: `${SIDEBAR_W}px` }}
            >
              <div style={{ fontSize: "90px", opacity: 0.12, lineHeight: 1, color: "var(--accent)" }}>◉</div>
              <div className="text-center">
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Your 3D scene is empty
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
                  Upload photos from the sidebar to begin
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600 }}>
                <ChevronRight size={16} className="rotate-180" />
                Start by uploading photos
              </div>
            </div>
          )}
        </div>

        {}
        {}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 15,
          }}
        >
          <GesturePanel
            videoRef={videoRef }
            canvasRef={canvasRef}
            isLoading={gestureLoading}
            isActive={gestureActive}
            error={gestureError}
            gestureLabel={gestureLabel}
            onStart={startGestures}
            onStop={stopGestures}
          />
        </div>

        {}
        <aside
          className="relative z-10 flex flex-col overflow-y-auto flex-shrink-0"
          style={{
            width: `${SIDEBAR_W}px`,
            background: "var(--sidebar-bg)",
            borderRight: "1px solid var(--border-strong)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          <SidebarSection label="Upload Photos" icon="↑" accent="var(--accent)">
            <UploadZone onFiles={addPhotos} currentCount={photos.length} />
          </SidebarSection>

          <Divider />

          <SidebarSection label="3D Shape" icon="◈" accent="var(--accent2)">
            <ShapeSelector current={shape} onChange={setShape} />
          </SidebarSection>

          <Divider />

          <SidebarSection label="Mouse Controls" icon="⌘" accent="var(--accent3)">
            <GestureHints />
          </SidebarSection>

          {/* Gesture mode status in sidebar */}
          {gestureActive && (
            <>
              <Divider />
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ color: "#34d399", fontSize: "14px" }}>✋</span>
                  <span className="section-label">Gesture Mode Active</span>
                </div>
                <div
                  style={{
                    background: "rgba(52,211,153,0.08)",
                    border: "1px solid rgba(52,211,153,0.25)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#34d399", fontWeight: 600 }}>
                    Hand controls override mouse rotation. Mouse still works.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex-1" />

          {photos.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border)", padding: "16px" }}>
              <button
                onClick={clearAll}
                style={{
                  width: "100%",
                  background: "var(--danger-dim)",
                  border: "1.5px solid rgba(255,85,119,0.3)",
                  color: "var(--danger)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "12px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                <Trash2 size={15} strokeWidth={2} />
                Clear all {photos.length} photos
              </button>
            </div>
          )}
        </aside>

        {/* Selected photo panel */}
        {selectedIndex !== null && photos[selectedIndex] && (
          <div
            className="absolute top-4 z-10"
            style={{
              right: "16px",
              // Shift up if gesture panel is active (so they don't overlap)
              bottom: gestureActive ? "auto" : undefined,
              width: "220px",
              background: "var(--bg-glass)",
              border: "1.5px solid var(--border-accent)",
              borderRadius: "20px",
              padding: "18px",
              boxShadow: "var(--shadow-accent2)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <img src={photos[selectedIndex].url} alt="selected"
              className="w-full object-cover mb-3"
              style={{ borderRadius: "12px", maxHeight: "150px" }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                Photo #{selectedIndex + 1}
              </p>
              <span style={{ background: "var(--accent-dim)", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px" }}>
                SELECTED
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", wordBreak: "break-all", lineHeight: 1.5, marginBottom: "12px" }}>
              {photos[selectedIndex].name}
            </p>
            <button
              onClick={() => selectPhoto(selectedIndex)}
              style={{ width: "100%", background: "var(--bg-hover)", border: "1px solid var(--border-strong)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500, cursor: "pointer", padding: "8px", borderRadius: "10px" }}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Deselect ✕
            </button>
          </div>
        )}
      </div>

      {/* Bottom gallery strip */}
      {photos.length > 0 && (
        <div style={{ marginLeft: `${SIDEBAR_W}px`, background: "var(--bg-glass)", borderTop: "1px solid var(--border-strong)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "12px 20px 14px", flexShrink: 0, position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span className="section-label">Gallery — {photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>Click to select · Hover to remove</span>
          </div>
          <PhotoStrip photos={photos} selectedIndex={selectedIndex} onSelect={selectPhoto} onRemove={removePhoto} />
        </div>
      )}

      <Footer />
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "var(--border)", margin: "0 16px" }} />;
}

function SidebarSection({ label, icon, accent, children }: { label: string; icon: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <span style={{ color: accent, fontSize: "14px", lineHeight: 1, width: "18px", textAlign: "center" }}>{icon}</span>
        <span className="section-label">{label}</span>
      </div>
      {children}
    </div>
  );
}