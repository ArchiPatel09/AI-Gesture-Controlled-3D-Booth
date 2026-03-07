// components/camera/GesturePanel.tsx
"use client";

import { useState } from "react";
import { Hand, ChevronDown, ChevronUp, Wifi, WifiOff, Loader } from "lucide-react";
import WebcamView from "./WebcamView";
import { GestureType } from "@/types";

const GESTURE_META: Record<GestureType, {
  emoji: string;
  label: string;
  action: string;
  color: string;
}> = {
  open_hand:   { emoji: "✋", label: "Open Hand",   action: "Rotate scene",  color: "#63a2ff" },
  fist:        { emoji: "👊", label: "Fist",         action: "Rotate (grab)", color: "#a78bfa" },
  pinch:       { emoji: "🤏", label: "Pinch",        action: "Zoom in / out", color: "#00deff" },
  point:       { emoji: "👆", label: "Point",        action: "Show cursor",   color: "#34d399" },
  two_fingers: { emoji: "✌️", label: "Two Fingers",  action: "Reset view",    color: "#f59e0b" },
  none:        { emoji: "👋", label: "No Hand",      action: "Show your hand",color: "#4a5878" },
};

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  isActive: boolean;
  error: string | null;
  gestureLabel: GestureType;
  onStart: () => void;
  onStop: () => void;
}

export default function GesturePanel({
  videoRef,
  canvasRef,
  isLoading,
  isActive,
  error,
  gestureLabel,
  onStart,
  onStop,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const meta = GESTURE_META[gestureLabel] || GESTURE_META.none;

  // ── COLLAPSED STATE ──────────────────────────────────────────
  if (!isExpanded) {
    return (
      <>
        {/*
          CRITICAL FIX: WebcamView must ALWAYS be in the DOM — even when
          the panel is collapsed — so that videoRef and canvasRef are attached
          before start() tries to use them. We hide it visually with
          display:none instead of unmounting it with conditional rendering.

          If we used {isActive && <WebcamView />}, the <video> element
          wouldn't exist when start() runs → videoRef.current = null → crash.
        */}
        <div style={{ display: "none" }}>
          <WebcamView
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
            canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
          />
        </div>

        <button
          onClick={() => setIsExpanded(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            background: isActive
              ? "linear-gradient(135deg, rgba(99,162,255,0.2), rgba(0,222,255,0.15))"
              : "var(--bg-glass)",
            border: `1.5px solid ${isActive ? "var(--border-accent)" : "var(--border-strong)"}`,
            borderRadius: "14px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            cursor: "pointer",
            boxShadow: isActive ? "var(--shadow-accent)" : "var(--shadow-md)",
            transition: "all 0.2s ease",
          }}
          className="hover:scale-105 active:scale-95"
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: isActive
                ? "linear-gradient(135deg, var(--accent), var(--accent2))"
                : "var(--bg-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isActive ? "var(--shadow-accent2)" : "none",
            }}
          >
            <Hand size={18} color={isActive ? "#fff" : "var(--text-secondary)"} strokeWidth={2} />
          </div>

          <div style={{ textAlign: "left" }}>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 700,
              color: isActive ? "var(--accent-bright)" : "var(--text-primary)",
              lineHeight: 1.2,
            }}>
              {isActive ? "Gestures ON" : "Gesture Control"}
            </p>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: isActive ? meta.color : "var(--text-muted)",
              lineHeight: 1,
              marginTop: "2px",
            }}>
              {isActive ? `${meta.emoji} ${meta.label}` : "Click to enable"}
            </p>
          </div>

          {isActive && (
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "var(--accent2)", boxShadow: "0 0 8px var(--accent2)",
              display: "inline-block", animation: "pulse 1.5s infinite", marginLeft: "4px",
            }} />
          )}

          <ChevronUp size={14} color="var(--text-muted)" style={{ marginLeft: "4px" }} />
        </button>

        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.8)}}`}</style>
      </>
    );
  }

  // ── EXPANDED STATE ──────────────────────────────────────────
  return (
    <div style={{
      width: "300px",
      background: "var(--bg-glass)",
      border: "1.5px solid var(--border-strong)",
      borderRadius: "20px",
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden",
    }}>

      {/* Panel header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderBottom: "1px solid var(--border)",
        background: isActive
          ? "linear-gradient(135deg, rgba(99,162,255,0.1), rgba(0,222,255,0.07))"
          : "var(--bg-hover)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: isActive
              ? "linear-gradient(135deg, var(--accent), var(--accent2))"
              : "var(--bg-elevated)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isActive ? "var(--shadow-accent)" : "none",
          }}>
            <Hand size={16} color={isActive ? "#fff" : "var(--text-secondary)"} strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
              Gesture Control
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: isActive ? "var(--accent)" : "var(--text-muted)", lineHeight: 1 }}>
              {isActive ? "MediaPipe · Active" : "MediaPipe Hands · v2"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            width: "28px", height: "28px", borderRadius: "8px",
            border: "1px solid var(--border-strong)", background: "var(--bg-elevated)",
            color: "var(--text-muted)", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
          }}
          className="hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>

        {/*
          CRITICAL FIX: Always render WebcamView, control visibility with CSS.
          - When active: display:block — user sees the webcam feed
          - When inactive: display:none — hidden but still in DOM so refs work
        */}
        <div style={{ display: isActive ? "block" : "none" }}>
          <WebcamView
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
            canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
          />
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: "var(--danger-dim)",
            border: "1px solid rgba(255,85,119,0.3)",
            borderRadius: "12px", padding: "12px",
          }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--danger)", lineHeight: 1.5 }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Current gesture display */}
        {isActive && !error && (
          <div style={{
            background: `${meta.color}12`,
            border: `1px solid ${meta.color}35`,
            borderRadius: "12px", padding: "12px 14px",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <span style={{ fontSize: "24px", lineHeight: 1 }}>{meta.emoji}</span>
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 700, color: meta.color, lineHeight: 1.2 }}>
                {meta.label}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.3, marginTop: "2px" }}>
                → {meta.action}
              </p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: gestureLabel === "none" ? "var(--text-muted)" : meta.color,
                boxShadow: gestureLabel !== "none" ? `0 0 8px ${meta.color}` : "none",
                display: "inline-block",
                animation: gestureLabel !== "none" ? "pulse 1.5s infinite" : "none",
              }} />
            </div>
          </div>
        )}

        {/* Enable / Disable button */}
        {!isActive ? (
          <button
            onClick={onStart}
            disabled={isLoading}
            style={{
              width: "100%", padding: "14px", borderRadius: "14px",
              border: "1.5px solid var(--border-accent)",
              background: isLoading
                ? "var(--bg-elevated)"
                : "linear-gradient(135deg, rgba(99,162,255,0.2), rgba(0,222,255,0.15))",
              color: isLoading ? "var(--text-muted)" : "var(--accent-bright)",
              fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 700,
              cursor: isLoading ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              boxShadow: isLoading ? "none" : "var(--shadow-accent)",
              transition: "all 0.2s ease",
            }}
            className="hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader size={17} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
                Loading MediaPipe model...
              </>
            ) : (
              <>
                <Wifi size={17} strokeWidth={2} />
                Enable Gesture Control
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onStop}
            style={{
              width: "100%", padding: "12px", borderRadius: "14px",
              border: "1.5px solid rgba(255,85,119,0.3)",
              background: "var(--danger-dim)", color: "var(--danger)",
              fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            <WifiOff size={15} strokeWidth={2} />
            Disable & Release Camera
          </button>
        )}

        {/* Gesture guide */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
          <p className="section-label" style={{ marginBottom: "10px" }}>Gesture Guide</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {(Object.entries(GESTURE_META) as [GestureType, typeof GESTURE_META[GestureType]][])
              .filter(([key]) => key !== "none")
              .map(([key, info]) => (
                <div
                  key={key}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "8px 10px", borderRadius: "10px",
                    background: gestureLabel === key ? `${info.color}12` : "transparent",
                    border: `1px solid ${gestureLabel === key ? `${info.color}35` : "transparent"}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "18px", lineHeight: 1, width: "24px", textAlign: "center" }}>
                    {info.emoji}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 600,
                    color: gestureLabel === key ? info.color : "var(--text-secondary)",
                    minWidth: "90px",
                  }}>
                    {info.label}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                    → {info.action}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(0.8)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}