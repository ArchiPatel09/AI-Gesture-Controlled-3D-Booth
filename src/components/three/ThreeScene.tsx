"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Photo, ShapeType } from "@/types";
import { getPositions } from "./getPositions";

interface Props {
  photos: Photo[];
  shape: ShapeType;
  selectedIndex: number | null;
  onSelectPhoto: (index: number) => void;
}

export default function ThreeScene({
  photos,
  shape,
  selectedIndex,
  onSelectPhoto,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  // We store Three.js objects in refs so they persist across renders
  // without triggering re-renders themselves
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef    = useRef<THREE.Group | null>(null);
  const meshesRef   = useRef<THREE.Mesh[]>([]);
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());
  const animFrameRef = useRef<number>(0);

  // Rotation & zoom state stored in refs (not state!) to avoid re-renders
  const rotRef    = useRef({ x: 0.3, y: 0 });
  const targetRot = useRef({ x: 0.3, y: 0 });
  const zoomRef   = useRef(10);
  const targetZoom = useRef(10);
  const isDragging = useRef(false);
  const lastMouse  = useRef({ x: 0, y: 0 });

  // ─── INIT SCENE (runs once on mount) ──────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene: the container for all 3D objects
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera: PerspectiveCamera(fov, aspect, near, far)
    // FOV = 60°, like a normal camera lens
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.z = 10;
    cameraRef.current = camera;

    // Renderer: draws the scene to a <canvas> element
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent background
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Group: parent object — rotating the group rotates all photos together
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Lights: we need lights for MeshStandardMaterial to show
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const d1 = new THREE.DirectionalLight(0x88aaff, 0.6);
    d1.position.set(5, 5, 5);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xff88aa, 0.3);
    d2.position.set(-5, -5, -5);
    scene.add(d2);

    // ── Mouse Controls ──
    const onDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { isDragging.current = false; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      // dx maps to Y-axis rotation, dy maps to X-axis rotation
      targetRot.current.y += dx * 0.005;
      targetRot.current.x += dy * 0.005;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e: WheelEvent) => {
      targetZoom.current = Math.max(4, Math.min(20, targetZoom.current + e.deltaY * 0.01));
    };

    // ── Touch Controls (mobile) ──
    let lastPinchDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging.current) {
        const dx = e.touches[0].clientX - lastMouse.current.x;
        const dy = e.touches[0].clientY - lastMouse.current.y;
        targetRot.current.y += dx * 0.005;
        targetRot.current.x += dy * 0.005;
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        targetZoom.current = Math.max(4, Math.min(20, targetZoom.current + (lastPinchDist - dist) * 0.05));
        lastPinchDist = dist;
      }
    };
    const onTouchEnd = () => { isDragging.current = false; };

    mount.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    mount.addEventListener("wheel", onWheel, { passive: true });
    mount.addEventListener("touchstart", onTouchStart);
    mount.addEventListener("touchmove", onTouchMove);
    mount.addEventListener("touchend", onTouchEnd);

    // Resize handler
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animation Loop ──
    // This runs ~60 times per second. It's the heartbeat of the 3D scene.
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // LERP: smooth interpolation. Think of it as "chase the target slowly"
      // formula: current = current + (target - current) * speed
      rotRef.current.x += (targetRot.current.x - rotRef.current.x) * 0.08;
      rotRef.current.y += (targetRot.current.y - rotRef.current.y) * 0.08;
      zoomRef.current  += (targetZoom.current - zoomRef.current) * 0.08;

      if (groupRef.current) {
        groupRef.current.rotation.x = rotRef.current.x;
        groupRef.current.rotation.y = rotRef.current.y;
        if (!isDragging.current) targetRot.current.y += 0.001; // auto-spin
      }
      camera.position.z = zoomRef.current;

      // Animate selected photo scale
      meshesRef.current.forEach((mesh, i) => {
        if (!mesh) return;
        const targetScale = i === selectedIndex ? 1.35 : 1.0;
        // lerp scale — mesh.scale is a Vector3
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          const targetGlow = i === selectedIndex ? 0.5 : 0.05;
          mesh.material.emissiveIntensity +=
            (targetGlow - mesh.material.emissiveIntensity) * 0.1;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup (runs when component unmounts) ──
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      mount.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove", onTouchMove);
      mount.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []); // empty deps = run once

  // ─── UPDATE MESHES when photos or shape changes ─────────────────
  useEffect(() => {
    if (!groupRef.current) return;

    // Remove all old photo meshes from the group
    meshesRef.current.forEach((m) => groupRef.current!.remove(m));
    meshesRef.current = [];

    if (photos.length === 0) return;

    const positions = getPositions(shape, photos.length);

    photos.forEach((photo, i) => {
      // Reuse texture from cache if already loaded (avoid re-loading)
      if (!textureCache.current.has(photo.id)) {
        const tex = new THREE.TextureLoader().load(photo.url);
        tex.colorSpace = THREE.SRGBColorSpace;
        textureCache.current.set(photo.id, tex);
      }
      const texture = textureCache.current.get(photo.id)!;

      // PlaneGeometry(width, height) — a flat rectangle
      const geo = new THREE.PlaneGeometry(1.2, 0.9);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(0x4488ff),
        emissiveIntensity: 0.05,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide, // visible from both front and back
      });
      const mesh = new THREE.Mesh(geo, mat);

      // White polaroid-style border behind the photo
      const borderGeo = new THREE.PlaneGeometry(1.32, 1.02);
      const borderMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.z = -0.01; // slightly behind the photo
      mesh.add(border);

      // Position from our formula
      const [x, y, z] = positions[i];
      mesh.position.set(x, y, z);

      // Make photo face outward (away from center)
      if (shape !== "grid") {
        mesh.lookAt(0, 0, 0);  // first point toward center
        mesh.rotateY(Math.PI); // then flip 180° to face outward
      }

      mesh.userData.photoIndex = i; // store index for click detection
      groupRef.current!.add(mesh);
      meshesRef.current[i] = mesh;
    });
  }, [photos, shape]);

  // ─── CLICK DETECTION (Raycasting) ───────────────────────────────
  // A ray is fired from the camera through the mouse position.
  // If it hits a mesh, that photo is selected.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const raycaster = new THREE.Raycaster();
    const mouse2D = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      // Convert pixel coords to NDC (Normalized Device Coordinates: -1 to +1)
      mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse2D, cameraRef.current!);
      const hits = raycaster.intersectObjects(meshesRef.current, true);

      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        // Walk up the parent chain to find the mesh with userData
        while (obj && obj.userData.photoIndex === undefined) {
          obj = obj.parent;
        }
        if (obj && obj.userData.photoIndex !== undefined) {
          onSelectPhoto(obj.userData.photoIndex);
        }
      }
    };

    mount.addEventListener("click", onClick);
    return () => mount.removeEventListener("click", onClick);
  }, [onSelectPhoto]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", cursor: "grab" }}
    />
  );
}