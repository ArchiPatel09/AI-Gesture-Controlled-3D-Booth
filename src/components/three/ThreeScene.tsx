// components/three/ThreeScene.tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Photo, ShapeType, GestureState } from "@/types";
import { getPositions } from "./getPositions";

// Tune these to feel natural
const ROTATION_SENSITIVITY = 4.5; // how fast hand movement rotates the scene
const ZOOM_SENSITIVITY      = 18; // how fast pinch distance changes zoom

interface Props {
  photos: Photo[];
  shape: ShapeType;
  selectedIndex: number | null;
  onSelectPhoto: (index: number) => void;
  // Gesture ref — read every frame, no re-renders. undefined = gesture off.
  gestureStateRef?: React.RefObject<GestureState | null>;
}

export default function ThreeScene({
  photos,
  shape,
  selectedIndex,
  onSelectPhoto,
  gestureStateRef,
}: Props) {
  const mountRef    = useRef<HTMLDivElement>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef    = useRef<THREE.Group | null>(null);
  const meshesRef   = useRef<THREE.Mesh[]>([]);
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());
  const animFrameRef = useRef<number>(0);

  // Mouse/touch orbit state (Phase 1 controls — still active)
  const rotRef     = useRef({ x: 0.3, y: 0 });
  const targetRot  = useRef({ x: 0.3, y: 0 });
  const zoomRef    = useRef(10);
  const targetZoom = useRef(10);
  const isDragging = useRef(false);
  const lastMouse  = useRef({ x: 0, y: 0 });

  // Gesture control tracking refs — store previous frame values to compute deltas
  // We use -1 as a sentinel value meaning "no previous reading yet"
  const prevHandPos   = useRef({ x: -1, y: -1 });
  const prevPinchDist = useRef(-1);
  // Cooldown for the reset gesture (✌️) — prevents rapid repeated resets
  const resetCooldown = useRef(0);

  // ── INIT (runs once on mount) ─────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const d1 = new THREE.DirectionalLight(0x88aaff, 0.6);
    d1.position.set(5, 5, 5);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xff88aa, 0.3);
    d2.position.set(-5, -5, -5);
    scene.add(d2);

    // ── Mouse controls ──
    const onDown = (e: MouseEvent) => { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
    const onUp   = () => { isDragging.current = false; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      targetRot.current.y += (e.clientX - lastMouse.current.x) * 0.005;
      targetRot.current.x += (e.clientY - lastMouse.current.y) * 0.005;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e: WheelEvent) => {
      targetZoom.current = Math.max(4, Math.min(20, targetZoom.current + e.deltaY * 0.01));
    };

    // ── Touch controls ──
    let lastPinch = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) { isDragging.current = true; lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
      if (e.touches.length === 2) lastPinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging.current) {
        targetRot.current.y += (e.touches[0].clientX - lastMouse.current.x) * 0.005;
        targetRot.current.x += (e.touches[0].clientY - lastMouse.current.y) * 0.005;
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        targetZoom.current = Math.max(4, Math.min(20, targetZoom.current + (lastPinch - d) * 0.05));
        lastPinch = d;
      }
    };
    const onTouchEnd = () => { isDragging.current = false; };

    mount.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("mousemove", onMove);
    mount.addEventListener("wheel",      onWheel, { passive: true });
    mount.addEventListener("touchstart", onTouchStart);
    mount.addEventListener("touchmove",  onTouchMove);
    mount.addEventListener("touchend",   onTouchEnd);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // ── GESTURE CONTROLS (Phase 2) ──────────────────────────────
      // Read the gesture ref every frame — no React state, no re-renders
      const gs = gestureStateRef?.current;

      if (gs?.handVisible && !isDragging.current) {
        // 🤚 Open hand or 👊 Fist: track hand movement → rotate
        if (gs.gesture === "open_hand" || gs.gesture === "fist") {
          const prev = prevHandPos.current;
          if (prev.x >= 0) {
            // MediaPipe X: 0=left edge, 1=right edge of camera
            // Webcam is mirrored on canvas (scaleX(-1)), so we flip the delta
            const dx = -(gs.handX - prev.x) * ROTATION_SENSITIVITY;
            const dy =  (gs.handY - prev.y) * ROTATION_SENSITIVITY;
            targetRot.current.y += dx;
            targetRot.current.x += dy;
          }
          prevHandPos.current  = { x: gs.handX, y: gs.handY };
          prevPinchDist.current = -1; // reset pinch tracking

        // 🤏 Pinch: track thumb-index distance → zoom
        } else if (gs.gesture === "pinch") {
          const prev = prevPinchDist.current;
          if (prev >= 0) {
            // If fingers move apart (dist increases): zoom out
            // If fingers move together (dist decreases): zoom in
            const delta = (prev - gs.pinchDistance) * ZOOM_SENSITIVITY;
            targetZoom.current = Math.max(4, Math.min(20, targetZoom.current + delta));
          }
          prevPinchDist.current = gs.pinchDistance;
          prevHandPos.current   = { x: -1, y: -1 }; // reset rotation tracking

        // ✌️ Two fingers: reset view (with 2s cooldown so it doesn't keep firing)
        } else if (gs.gesture === "two_fingers") {
          const now = Date.now();
          if (now - resetCooldown.current > 2000) {
            targetRot.current  = { x: 0.3, y: 0 };
            targetZoom.current = 10;
            resetCooldown.current = now;
          }
          prevHandPos.current   = { x: -1, y: -1 };
          prevPinchDist.current = -1;

        // 👆 Point or none: reset prev tracking
        } else {
          prevHandPos.current   = { x: -1, y: -1 };
          prevPinchDist.current = -1;
        }
      } else {
        // No hand visible or mouse is being used — clear gesture tracking
        prevHandPos.current   = { x: -1, y: -1 };
        prevPinchDist.current = -1;
      }

      // ── LERP (smooth chase animation) ────────────────────────────
      // current += (target - current) * speed   ← "ease toward target"
      rotRef.current.x  += (targetRot.current.x - rotRef.current.x)  * 0.08;
      rotRef.current.y  += (targetRot.current.y - rotRef.current.y)  * 0.08;
      zoomRef.current   += (targetZoom.current  - zoomRef.current)   * 0.08;

      if (groupRef.current) {
        groupRef.current.rotation.x = rotRef.current.x;
        groupRef.current.rotation.y = rotRef.current.y;
        // Auto-spin only when nothing is controlling the scene
        const gestureActive = gs?.handVisible && gs.gesture !== "none";
        if (!isDragging.current && !gestureActive) {
          targetRot.current.y += 0.001;
        }
      }
      camera.position.z = zoomRef.current;

      // Animate selected photo (scale + glow)
      meshesRef.current.forEach((mesh, i) => {
        if (!mesh) return;
        const targetScale = i === selectedIndex ? 1.35 : 1.0;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          const targetGlow = i === selectedIndex ? 0.5 : 0.05;
          mesh.material.emissiveIntensity += (targetGlow - mesh.material.emissiveIntensity) * 0.1;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      mount.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mousemove", onMove);
      mount.removeEventListener("wheel",      onWheel);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove",  onTouchMove);
      mount.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("resize",    onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [gestureStateRef]); // gestureStateRef is stable (ref object never changes)

  // ── UPDATE MESHES when photos or shape changes ────────────────
  useEffect(() => {
    if (!groupRef.current) return;
    meshesRef.current.forEach((m) => groupRef.current!.remove(m));
    meshesRef.current = [];
    if (photos.length === 0) return;

    const positions = getPositions(shape, photos.length);
    photos.forEach((photo, i) => {
      if (!textureCache.current.has(photo.id)) {
        const tex = new THREE.TextureLoader().load(photo.url);
        tex.colorSpace = THREE.SRGBColorSpace;
        textureCache.current.set(photo.id, tex);
      }
      const texture = textureCache.current.get(photo.id)!;
      const geo = new THREE.PlaneGeometry(1.2, 0.9);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(0x4488ff),
        emissiveIntensity: 0.05,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);

      // White border frame
      const borderMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.32, 1.02),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      borderMesh.position.z = -0.01;
      mesh.add(borderMesh);

      const [x, y, z] = positions[i];
      mesh.position.set(x, y, z);
      if (shape !== "grid") { mesh.lookAt(0, 0, 0); mesh.rotateY(Math.PI); }

      mesh.userData.photoIndex = i;
      groupRef.current!.add(mesh);
      meshesRef.current[i] = mesh;
    });
  }, [photos, shape]);

  // ── CLICK TO SELECT (Raycasting) ─────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const raycaster = new THREE.Raycaster();
    const mouse2D   = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse2D.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
      mouse2D.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
      raycaster.setFromCamera(mouse2D, cameraRef.current!);
      const hits = raycaster.intersectObjects(meshesRef.current, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && obj.userData.photoIndex === undefined) obj = obj.parent;
        if (obj?.userData.photoIndex !== undefined) onSelectPhoto(obj.userData.photoIndex);
      }
    };

    mount.addEventListener("click", onClick);
    return () => mount.removeEventListener("click", onClick);
  }, [onSelectPhoto]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />;
}