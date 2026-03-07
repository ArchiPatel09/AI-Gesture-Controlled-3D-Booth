// components/camera/WebcamView.tsx
// This component renders the webcam canvas (video + hand skeleton overlay).
// The hidden <video> feeds into MediaPipe; the <canvas> is what the user sees.
"use client";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function WebcamView({ videoRef, canvasRef }: Props) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "14px",
        overflow: "hidden",
        background: "#0a0e1a",
        border: "1px solid var(--border-accent)",
        boxShadow: "var(--shadow-accent2)",
        aspectRatio: "4/3",
        width: "100%",
      }}
    >
      {/* Hidden video element — MediaPipe reads pixel data from this.
          The user never sees this; they see the canvas drawn on top. */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
        muted
        playsInline
        autoPlay
      />

      {/* Canvas — MediaPipe's onResults() draws webcam + skeleton here */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // Mirror the canvas so it feels like a mirror (natural for users)
          transform: "scaleX(-1)",
          display: "block",
        }}
      />

      {/* Corner decoration */}
      {[
        { top: 0, left: 0, borderTop: "2px solid var(--accent)", borderLeft: "2px solid var(--accent)" },
        { top: 0, right: 0, borderTop: "2px solid var(--accent)", borderRight: "2px solid var(--accent)" },
        { bottom: 0, left: 0, borderBottom: "2px solid var(--accent)", borderLeft: "2px solid var(--accent)" },
        { bottom: 0, right: 0, borderBottom: "2px solid var(--accent)", borderRight: "2px solid var(--accent)" },
      ].map((style, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "14px",
            height: "14px",
            ...style,
          }}
        />
      ))}

      {/* "LIVE" indicator */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(10,14,28,0.8)",
          border: "1px solid rgba(255,85,119,0.4)",
          borderRadius: "6px",
          padding: "3px 8px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#ff5577",
            boxShadow: "0 0 6px #ff5577",
            display: "inline-block",
            animation: "pulse 1.5s infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            fontWeight: 600,
            color: "#ff5577",
            letterSpacing: "0.1em",
          }}
        >
          LIVE
        </span>
      </div>
    </div>
  );
}