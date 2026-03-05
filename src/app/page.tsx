// app/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Trash2, ChevronRight } from "lucide-react";
import { ShapeType } from "@/types";
import { usePhotos } from "@/hooks/usePhotos";
import { useTheme } from "@/components/ui/ThemeProvider";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import UploadZone from "@/components/ui/UploadZone";
import ShapeSelector from "@/components/ui/ShapeSelector";
import PhotoStrip from "@/components/ui/PhotoStrip";
import GestureHints from "@/components/ui/GestureHints";

// Load ThreeScene only in browser (no SSR — it uses WebGL APIs)
const ThreeScene = dynamic(() => import("@/components/three/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ color: "var(--text-muted)" }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{
          borderColor: "var(--border-strong)",
          borderTopColor: "var(--accent)",
        }}
      />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
        Initializing 3D engine...
      </span>
    </div>
  ),
});

export default function Home() {
  const { photos, selectedIndex, addPhotos, removePhoto, clearAll, selectPhoto } = usePhotos();
  const [shape, setShape] = useState<ShapeType>("sphere");
  const { theme } = useTheme();

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: "var(--bg-base)", fontFamily: "var(--font-sans)" }}
    >
      {/* ── HEADER ─────────────────────────────────────── */}
      <Header photoCount={photos.length} shape={shape} />

      {/* ── MAIN AREA ──────────────────────────────────── */}
      <div className="flex flex-1 relative overflow-hidden">

        {/* Background ambience — changes with theme */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {theme === "dark" ? (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 15% 25%, rgba(82,152,255,0.07) 0%, transparent 55%),
                               radial-gradient(ellipse at 85% 75%, rgba(0,212,255,0.05) 0%, transparent 55%)`,
                }}
              />
              {/* Grid lines */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(rgba(82,152,255,0.04) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(82,152,255,0.04) 1px, transparent 1px)`,
                  backgroundSize: "64px 64px",
                }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 20% 20%, rgba(59,126,245,0.06) 0%, transparent 55%),
                             radial-gradient(ellipse at 80% 80%, rgba(0,144,200,0.04) 0%, transparent 55%)`,
              }}
            />
          )}
        </div>

        {/* 3D Canvas — fills the whole right area behind sidebar */}
        <div className="absolute inset-0 z-0">
          {photos.length > 0 ? (
            <ThreeScene
              photos={photos}
              shape={shape}
              selectedIndex={selectedIndex}
              onSelectPhoto={selectPhoto}
            />
          ) : (
            /* Empty state */
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-4 select-none"
              style={{ paddingLeft: "280px" }}
            >
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "72px",
                  opacity: 0.25,
                  lineHeight: 1,
                }}
              >
                ◉
              </div>
              <div className="text-center">
                <p
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}
                  className="text-base font-semibold mb-1"
                >
                  Your 3D scene is empty
                </p>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                  }}
                >
                  Upload photos from the sidebar to begin
                </p>
              </div>
              {/* Arrow pointing left */}
              <div
                className="flex items-center gap-2 mt-2"
                style={{ color: "var(--accent)", fontSize: "12px", fontFamily: "var(--font-mono)" }}
              >
                <ChevronRight size={14} className="rotate-180" />
                Start by uploading photos
              </div>
            </div>
          )}
        </div>

        {/* ── LEFT SIDEBAR ─────────────────────────────── */}
        <aside
          className="relative z-10 w-[268px] flex flex-col gap-0 overflow-y-auto flex-shrink-0"
          style={{
            background: "var(--sidebar-bg)",
            borderRight: "1px solid var(--border)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          {/* Upload section */}
          <SidebarSection label="Upload Photos" icon="↑">
            <UploadZone onFiles={addPhotos} currentCount={photos.length} />
          </SidebarSection>

          {/* Divider */}
          <div style={{ height: "1px", background: "var(--border)" }} />

          {/* Shape section */}
          <SidebarSection label="3D Shape" icon="◈">
            <ShapeSelector current={shape} onChange={setShape} />
          </SidebarSection>

          {/* Divider */}
          <div style={{ height: "1px", background: "var(--border)" }} />

          {/* Controls section */}
          <SidebarSection label="Controls" icon="⌘">
            <GestureHints />
          </SidebarSection>

          {/* Spacer pushes clear button to bottom */}
          <div className="flex-1" />

          {/* Clear all */}
          {photos.length > 0 && (
            <div
              style={{ borderTop: "1px solid var(--border)", padding: "12px 16px" }}
            >
              <button
                onClick={clearAll}
                style={{
                  background: "var(--danger-dim)",
                  border: "1px solid rgba(255,77,106,0.25)",
                  color: "var(--danger)",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  width: "100%",
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium hover:opacity-90 transition-opacity"
              >
                <Trash2 size={13} strokeWidth={2} />
                Clear all {photos.length} photos
              </button>
            </div>
          )}
        </aside>

        {/* ── SELECTED PHOTO PANEL (top-right) ─────────── */}
        {selectedIndex !== null && photos[selectedIndex] && (
          <div
            className="absolute top-4 right-4 z-10 w-52"
            style={{
              background: "var(--bg-glass)",
              border: "1px solid var(--border-accent)",
              borderRadius: "20px",
              padding: "16px",
              boxShadow: "var(--shadow-accent2)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <img
              src={photos[selectedIndex].url}
              alt="selected"
              className="w-full object-cover mb-3"
              style={{ borderRadius: "12px", maxHeight: "140px" }}
            />
            <div className="flex items-start justify-between gap-2 mb-1">
              <p
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Photo #{selectedIndex + 1}
              </p>
              <span
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                SELECTED
              </span>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                wordBreak: "break-all",
                lineHeight: 1.5,
              }}
              className="mb-3"
            >
              {photos[selectedIndex].name}
            </p>
            <button
              onClick={() => selectPhoto(selectedIndex)}
              style={{
                width: "100%",
                background: "var(--bg-hover)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                cursor: "pointer",
                padding: "7px",
                borderRadius: "10px",
              }}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Deselect ✕
            </button>
          </div>
        )}
      </div>

      {/* ── BOTTOM STRIP (photo gallery) ─────────────── */}
      {photos.length > 0 && (
        <div
          style={{
            marginLeft: "268px",
            background: "var(--bg-glass)",
            borderTop: "1px solid var(--border)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "10px 16px 12px",
            flexShrink: 0,
            position: "relative",
            zIndex: 10,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="section-label">
              Gallery — {photos.length} photo{photos.length !== 1 ? "s" : ""}
            </span>
            <span
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
              }}
            >
              Click to select · Hover to remove
            </span>
          </div>
          <PhotoStrip
            photos={photos}
            selectedIndex={selectedIndex}
            onSelect={selectPhoto}
            onRemove={removePhoto}
          />
        </div>
      )}

      {/* ── FOOTER ─────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

// ── Sidebar section wrapper ──────────────────────────────────
function SidebarSection({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "16px" }}>
      <div className="flex items-center gap-2 mb-3">
        <span
          style={{
            color: "var(--accent)",
            fontSize: "12px",
            lineHeight: 1,
            width: "16px",
            textAlign: "center",
          }}
        >
          {icon}
        </span>
        <span className="section-label">{label}</span>
      </div>
      {children}
    </div>
  );
}