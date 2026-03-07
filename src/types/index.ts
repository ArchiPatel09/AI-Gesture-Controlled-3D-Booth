// types/index.ts

export interface Photo {
  id: string;
  url: string;
  name: string;
}

export type ShapeType =
  | "sphere"
  | "cube"
  | "cylinder"
  | "torus"
  | "helix"
  | "grid";

// ── Phase 2: Gesture types ──────────────────────────────────────

// The 5 gestures we recognize (+ "none" when no hand is visible)
export type GestureType =
  | "open_hand"   // ✋ All fingers extended  → rotate scene
  | "fist"        // 👊 All fingers curled    → rotate scene (grab feel)
  | "pinch"       // 🤏 Thumb + index close   → zoom in/out
  | "point"       // 👆 Only index extended   → cursor/hover
  | "two_fingers" // ✌️ Index + middle up     → reset view
  | "none";       // No hand detected

// The full state object updated every frame by MediaPipe
// Stored in a ref (not useState) to avoid 60fps re-renders
export interface GestureState {
  gesture: GestureType;
  handX: number;         // 0–1 hand center X (0=left, 1=right of camera)
  handY: number;         // 0–1 hand center Y (0=top, 1=bottom of camera)
  pinchDistance: number; // 0–1 distance between thumb and index tip
  indexX: number;        // 0–1 index fingertip X (for cursor)
  indexY: number;        // 0–1 index fingertip Y (for cursor)
  handVisible: boolean;  // is a hand currently in frame?
}