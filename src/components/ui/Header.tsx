// components/ui/Header.tsx
"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Image from "next/image";

interface Props {
  photoCount: number;
  shape: string;
}

export default function Header({ photoCount, shape }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header
      style={{
        background: "var(--header-bg)",
        borderBottom: "1px solid var(--header-border)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        position: "relative",
        zIndex: 20,
      }}
      className="w-full"
    >
      {/* Glow line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent2) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-4">

        {/* LEFT SECTION: Logo + Name + Phase */}
        <div className="flex items-center gap-4">
          {/* Logo + Website Name */}
          <div className="flex items-center gap-3">
            <Image
              src="/app_logo.png"
              alt="PhotoBooth3D"
              width={70}
              height={20}
              priority
              style={{
                objectFit: "contain",
                borderRadius: "12px", 
                margin: "7px",        
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              PhotoBooth3D
            </span>
          </div>

          {/* Phase badge */}
          <span
            style={{
              background:
                "linear-gradient(135deg,var(--accent-dim),var(--accent2-dim))",
              border: "1px solid var(--border-accent)",
              borderRadius: "8px",
              padding: "4px 10px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--accent-bright)",
              letterSpacing: "0.08em",
            }}
          >
            PHASE 1 / 4
          </span>
        </div>

        {/* CENTER STATS */}
        {photoCount > 0 && (
          <div
            className="hidden md:flex items-center gap-8"
            style={{
              background: "var(--bg-glass)",
              border: "1px solid var(--border-strong)",
              borderRadius: "12px",
              padding: "8px 18px",
              backdropFilter: "blur(10px)",
            }}
          >
            <StatPill label="Photos" value={String(photoCount)} color="var(--accent)" />
            <Divider />
            <StatPill label="Shape" value={shape.toUpperCase()} color="var(--accent2)" />
            <Divider />
            <StatPill label="Engine" value="WebGL2" color="var(--accent3)" />
          </div>
        )}

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">

          {/* LIVE badge */}
          <div
            style={{
              background:
                "linear-gradient(135deg,var(--accent2-dim),rgba(0,222,255,0.05))",
              border: "1px solid var(--accent2-glow)",
              borderRadius: "999px",
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--accent2)",
                boxShadow: "0 0 8px var(--accent2)",
                animation: "pulse 2s infinite",
              }}
            />

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--accent2-bright)",
                letterSpacing: "0.08em",
              }}
            >
              LIVE 3D
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-strong)",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            className="hover:scale-105 active:scale-95 transition-transform"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.6; transform:scale(0.8); }
        }
      `}</style>
    </header>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: "1px",
        height: "22px",
        background: "var(--border-strong)",
      }}
    />
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </span>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color: "var(--text-muted)",
          letterSpacing: "0.12em",
        }}
      >
        {label.toUpperCase()}
      </span>
    </div>
  );
}