// hooks/useHandGestures.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GestureType, GestureState } from "@/types";

// ── Default state when no hand is detected ──────────────────────
const DEFAULT_GESTURE_STATE: GestureState = {
  gesture: "none",
  handX: 0.5,
  handY: 0.5,
  pinchDistance: 1,
  indexX: 0.5,
  indexY: 0.5,
  handVisible: false,
};

// ── MediaPipe hand landmark indices ─────────────────────────────
// MediaPipe gives us 21 landmarks per hand (numbered 0–20).
// Key ones we use:
//   0  = Wrist
//   4  = Thumb tip
//   8  = Index tip        ← "pointing" fingertip
//   12 = Middle tip
//   16 = Ring tip
//   20 = Pinky tip
//   6  = Index PIP (2nd knuckle — used to detect if finger is "up")
//   10 = Middle PIP
//   14 = Ring PIP
//   18 = Pinky PIP

// Hand bone connections for drawing the skeleton manually
// Each pair [a, b] draws a line between landmark[a] and landmark[b]
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],      // thumb
  [0,5],[5,6],[6,7],[7,8],      // index finger
  [0,9],[9,10],[10,11],[11,12], // middle finger
  [0,13],[13,14],[14,15],[15,16],// ring finger
  [0,17],[17,18],[18,19],[19,20],// pinky
  [5,9],[9,13],[13,17],         // palm connections
];

// Fingertip indices (rendered larger/brighter)
const FINGERTIPS = [4, 8, 12, 16, 20];

// ── Classify gesture from 21 landmark positions ──────────────────
// KEY CONCEPT: MediaPipe coords have Y=0 at TOP, Y=1 at BOTTOM.
// A finger is "up" (extended) when its TIP has a SMALLER Y than its PIP.
// Think of it as: tip is higher on screen = lower Y value = finger is up.
function classifyGesture(lm: Array<{ x: number; y: number; z: number }>): GestureType {
  const thumbTip  = lm[4];
  const indexTip  = lm[8];
  const middleTip = lm[12];
  const ringTip   = lm[16];
  const pinkyTip  = lm[20];

  const indexPIP  = lm[6];  // 2nd knuckle of index
  const middlePIP = lm[10];
  const ringPIP   = lm[14];
  const pinkyPIP  = lm[18];

  // Is each finger extended? tip.y < pip.y means finger points up
  // We add a small threshold (0.02) to reduce false positives
  const indexUp  = indexTip.y  < indexPIP.y  - 0.02;
  const middleUp = middleTip.y < middlePIP.y - 0.02;
  const ringUp   = ringTip.y   < ringPIP.y   - 0.02;
  const pinkyUp  = pinkyTip.y  < pinkyPIP.y  - 0.02;

  // Pinch detection: 3D Euclidean distance between thumb tip and index tip
  // Both x and y are in 0–1 range, z is depth (small numbers)
  const pinchDist = Math.hypot(
    thumbTip.x - indexTip.x,
    thumbTip.y - indexTip.y,
    (thumbTip.z || 0) - (indexTip.z || 0)
  );

  // Classify in priority order:
  if (pinchDist < 0.07) return "pinch";                        // 🤏 thumb+index touching
  if (!indexUp && !middleUp && !ringUp && !pinkyUp) return "fist"; // 👊 all curled
  if (indexUp && !middleUp && !ringUp && !pinkyUp) return "point"; // 👆 only index up
  if (indexUp && middleUp && !ringUp && !pinkyUp) return "two_fingers"; // ✌️
  if (indexUp && middleUp && ringUp && pinkyUp) return "open_hand";    // ✋

  return "open_hand"; // default for ambiguous poses
}

// ── Dynamically inject a CDN script tag ─────────────────────────
// We use this instead of npm install because MediaPipe + Next.js
// has complex webpack/wasm compatibility issues. CDN is much more reliable.
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Don't load the same script twice
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

// ── The main hook ────────────────────────────────────────────────
export function useHandGestures() {
  // Refs for DOM elements (passed to WebcamView for rendering)
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // THIS IS THE CRITICAL REF — ThreeScene reads from this every animation frame
  // We use a ref (not state) so gesture updates DON'T cause React re-renders.
  // Updating this 60 times/second with setState would destroy performance.
  const gestureStateRef = useRef<GestureState>({ ...DEFAULT_GESTURE_STATE });

  // MediaPipe + stream refs for cleanup
  const handsRef   = useRef<any>(null);
  const cameraRef  = useRef<any>(null);
  const streamRef  = useRef<MediaStream | null>(null);

  // Gesture smoothing: prevent flicker by requiring a gesture
  // to appear in 3 consecutive frames before registering it
  const gestureBuffer = useRef<GestureType[]>([]);
  const BUFFER_SIZE = 3;

  // React state (UI-level only — loading indicator, error, current label)
  const [isLoading, setIsLoading]     = useState(false);
  const [isActive, setIsActive]       = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [gestureLabel, setGestureLabel] = useState<GestureType>("none");

  // ── onResults: called by MediaPipe every frame ─────────────────
  // This is where we: draw skeleton + classify gesture + update ref
  const onResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Clear canvas and draw the webcam frame
    ctx.clearRect(0, 0, W, H);
    if (results.image) {
      ctx.drawImage(results.image, 0, 0, W, H);
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // We only use the first detected hand
      const lm: Array<{ x: number; y: number; z: number }> = results.multiHandLandmarks[0];

      // ── Draw hand skeleton ──────────────────────────────────────
      // Draw bone connections (lines)
      ctx.strokeStyle = "rgba(99, 162, 255, 0.75)";
      ctx.lineWidth   = 2.5;
      HAND_CONNECTIONS.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * W, lm[a].y * H);
        ctx.lineTo(lm[b].x * W, lm[b].y * H);
        ctx.stroke();
      });

      // Draw landmark dots (fingertips bigger + cyan)
      lm.forEach((point, i) => {
        const isTip = FINGERTIPS.includes(i);
        ctx.beginPath();
        ctx.arc(point.x * W, point.y * H, isTip ? 6 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? "#00deff" : "rgba(99, 162, 255, 0.8)";
        ctx.fill();
        // White outline on fingertips for visibility
        if (isTip) {
          ctx.strokeStyle = "rgba(255,255,255,0.6)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // ── Classify gesture with smoothing ────────────────────────
      const rawGesture = classifyGesture(lm);

      // Add to rolling buffer and find the most common recent gesture
      gestureBuffer.current.push(rawGesture);
      if (gestureBuffer.current.length > BUFFER_SIZE) {
        gestureBuffer.current.shift(); // remove oldest
      }
      // Mode of buffer (most frequent gesture)
      const freq: Partial<Record<GestureType, number>> = {};
      for (const g of gestureBuffer.current) freq[g] = (freq[g] || 0) + 1;
      const smoothed = (Object.entries(freq) as [GestureType, number][])
        .sort((a, b) => b[1] - a[1])[0][0];

      // ── Update gesture state ref ────────────────────────────────
      const wrist    = lm[0];
      const midMCP   = lm[9]; // middle finger base
      const thumbTip = lm[4];
      const indexTip = lm[8];

      // Hand center = midpoint of wrist and middle knuckle
      const handX = (wrist.x + midMCP.x) / 2;
      const handY = (wrist.y + midMCP.y) / 2;
      const pinchDistance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

      // Write to the ref — ThreeScene reads this in its RAF loop
      gestureStateRef.current = {
        gesture: smoothed,
        handX,
        handY,
        pinchDistance,
        indexX: indexTip.x,
        indexY: indexTip.y,
        handVisible: true,
      };

      // Update React label (for UI display only — low freq is fine)
      setGestureLabel(smoothed);

      // ── Draw gesture label badge on canvas ──────────────────────
      const BADGE_LABELS: Record<GestureType, string> = {
        open_hand:   "✋ ROTATE",
        fist:        "👊 ROTATE",
        pinch:       "🤏 ZOOM",
        point:       "👆 CURSOR",
        two_fingers: "✌️ RESET",
        none:        "DETECTING...",
      };
      const label = BADGE_LABELS[smoothed] || smoothed;
      ctx.fillStyle = "rgba(10,14,28,0.82)";
      ctx.beginPath();
      ctx.roundRect(8, 8, 130, 30, 8);
      ctx.fill();
      ctx.fillStyle = "#63a2ff";
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      ctx.fillText(label, 16, 28);

      // Draw index cursor dot for point gesture
      if (smoothed === "point") {
        ctx.beginPath();
        ctx.arc(indexTip.x * W, indexTip.y * H, 12, 0, Math.PI * 2);
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = "rgba(52,211,153,0.2)";
        ctx.fill();
      }

    } else {
      // No hand in frame → reset state
      gestureStateRef.current = { ...DEFAULT_GESTURE_STATE };
      gestureBuffer.current   = [];
      setGestureLabel("none");
    }
  }, []);

  // ── start(): load MediaPipe and begin tracking ─────────────────
  const start = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Load MediaPipe scripts from CDN (browser only — no SSR)
      // These inject global variables: window.Hands, window.Camera
      await Promise.all([
        loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"),
        loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"),
      ]);

      // Step 2: Request webcam access
      // facingMode: "user" = front-facing camera (selfie camera)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
      }

      // Step 3: Initialize MediaPipe Hands model
      // locateFile tells it where to find the .wasm and .tflite model files
      const Hands = (window as any).Hands;
      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,               // track 1 hand (better performance)
        modelComplexity: 1,           // 0 = lite/fast, 1 = full/accurate
        minDetectionConfidence: 0.7,  // how confident to initially detect a hand
        minTrackingConfidence: 0.6,   // how confident to keep tracking it
      });

      // Register our result handler
      hands.onResults(onResults);
      handsRef.current = hands;

      // Step 4: Start the Camera processing loop
      // Camera from camera_utils handles the requestAnimationFrame loop,
      // captures frames from the video, and sends them to the Hands model.
      const Camera = (window as any).Camera;
      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      cam.start();
      cameraRef.current = cam;
      setIsActive(true);

    } catch (err: any) {
      // Handle common webcam errors with clear messages
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Click the camera icon in your browser's address bar to allow access.");
      } else if (err.name === "NotFoundError") {
        setError("No webcam found. Please connect a camera and try again.");
      } else if (err.name === "NotSupportedError") {
        setError("Webcam not supported. Use a modern browser (Chrome/Firefox/Edge) over HTTPS.");
      } else {
        setError(err.message || "Failed to start gesture detection. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [onResults]);

  // ── stop(): clean up all resources ────────────────────────────
  const stop = useCallback(() => {
    cameraRef.current?.stop();
    cameraRef.current = null;

    // Stop webcam stream (releases the camera hardware)
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    handsRef.current?.close();
    handsRef.current = null;

    gestureStateRef.current = { ...DEFAULT_GESTURE_STATE };
    gestureBuffer.current   = [];
    setIsActive(false);
    setGestureLabel("none");
  }, []);

  // Cleanup on unmount (component removed from DOM)
  useEffect(() => () => stop(), [stop]);

  return {
    videoRef,
    canvasRef,
    gestureStateRef, // ← passed to ThreeScene
    isLoading,
    isActive,
    error,
    gestureLabel,
    start,
    stop,
  };
}