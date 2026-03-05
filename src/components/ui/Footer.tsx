"use client";

import { Github, Linkedin, Mail, Layers } from "lucide-react";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/ArchiPatel09",
    icon: Github,
    color: "#e8f0ff",
    bg: "rgba(232,240,255,0.08)",
    border: "rgba(232,240,255,0.15)",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/archi-patel09/",
    icon: Linkedin,
    color: "#63a2ff",
    bg: "rgba(99,162,255,0.1)",
    border: "rgba(99,162,255,0.25)",
  },
  {
    label: "Email",
    href: "mailto:your@gmail.com",
    icon: Mail,
    color: "#f472b6",
    bg: "rgba(244,114,182,0.1)",
    border: "rgba(244,114,182,0.25)",
  },
];

const TECH = [
  { label: "Three.js", color: "#34d399" },
  { label: "WebGL 2.0", color: "#63a2ff" },
  { label: "React 18", color: "#f472b6" },
  { label: "Next.js 14", color: "#a78bfa" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--footer-bg)",
        borderTop: "1px solid var(--border-strong)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 32px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT: Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background:
                "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Layers size={16} color="#fff" strokeWidth={2.2} />
          </div>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.3,
            }}
          >
            PhotoBooth3D
            <span
              style={{
                fontWeight: 400,
                color: "var(--text-secondary)",
                fontSize: "13px",
                marginLeft: "8px",
              }}
            >
              Phase 1 of 4 — Next up: Gesture Controls
            </span>
          </p>
        </div>

        {/* CENTER: Tech stack */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {TECH.map(({ label, color }) => (
            <span
              key={label}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                color,
                background: `${color}14`,
                border: `1px solid ${color}30`,
                padding: "4px 10px",
                borderRadius: "6px",
              }}
            >
              ● {label}
            </span>
          ))}
        </div>

        {/* RIGHT: Social links */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {SOCIAL_LINKS.map(({ label, href, icon: Icon, color, bg, border }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 14px",
                borderRadius: "10px",
                background: bg,
                border: `1px solid ${border}`,
                color,
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              className="hover:scale-105 active:scale-95"
            >
              <Icon size={15} strokeWidth={2} />
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}