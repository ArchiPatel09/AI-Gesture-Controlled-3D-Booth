export type Position3D = [number, number, number];

// KEY CONCEPT: Each function takes a count and returns an array
// of [x, y, z] positions — one for each photo.

export function getPositions(shape: string, count: number): Position3D[] {
  switch (shape) {
    case "sphere":   return getSpherePositions(count);
    case "cube":     return getCubePositions(count);
    case "cylinder": return getCylinderPositions(count);
    case "torus":    return getTorusPositions(count);
    case "helix":    return getHelixPositions(count);
    case "grid":     return getGridPositions(count);
    default:         return Array(count).fill([0, 0, 0]);
  }
}

// FIBONACCI SPHERE: Most even distribution of points on a sphere surface.
// Used in nature (sunflowers, pinecones). The golden ratio prevents clustering.
function getSpherePositions(count: number): Position3D[] {
  const positions: Position3D[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2; // ≈ 1.618
  const R = 3.5; // radius

  for (let i = 0; i < count; i++) {
    // phi: latitude angle from top (0) to bottom (π)
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    // theta: longitude angle, spaced by golden ratio to avoid patterns
    const theta = (2 * Math.PI * i) / goldenRatio;

    positions.push([
      R * Math.sin(phi) * Math.cos(theta), // x
      R * Math.cos(phi),                   // y
      R * Math.sin(phi) * Math.sin(theta), // z
    ]);
  }
  return positions;
}

// CUBE: Spread photos evenly across 6 faces
function getCubePositions(count: number): Position3D[] {
  const positions: Position3D[] = [];
  const perFace = Math.ceil(count / 6);
  const side = Math.ceil(Math.sqrt(perFace));
  const size = 3.5;

  // Each face has a normal direction and two tangent axes
  const faces: [number, number, number][] = [
    [size, 0, 0], [-size, 0, 0],
    [0, size, 0], [0, -size, 0],
    [0, 0, size], [0, 0, -size],
  ];

  for (const [nx, ny, nz] of faces) {
    for (let i = 0; i < side && positions.length < count; i++) {
      for (let j = 0; j < side && positions.length < count; j++) {
        const u = side > 1 ? (i / (side - 1) - 0.5) * 3 : 0;
        const v = side > 1 ? (j / (side - 1) - 0.5) * 3 : 0;

        if (nx !== 0)      positions.push([nx, u, v]);
        else if (ny !== 0) positions.push([u, ny, v]);
        else               positions.push([u, v, nz]);
      }
    }
  }
  return positions;
}

// CYLINDER: Rings of photos stacked vertically
function getCylinderPositions(count: number): Position3D[] {
  const positions: Position3D[] = [];
  const perRing = 8; // photos per ring
  const rings = Math.ceil(count / perRing);
  const R = 3;

  for (let i = 0; i < count; i++) {
    const ring = Math.floor(i / perRing);
    const angle = ((i % perRing) / perRing) * Math.PI * 2;
    const y = rings > 1 ? (ring / (rings - 1)) * 6 - 3 : 0;

    positions.push([R * Math.cos(angle), y, R * Math.sin(angle)]);
  }
  return positions;
}

// TORUS: Donut shape using parametric equations
// R = major radius (center to tube center), r = tube radius
function getTorusPositions(count: number): Position3D[] {
  const positions: Position3D[] = [];
  const R = 3, r = 1;

  for (let i = 0; i < count; i++) {
    const u = (i / count) * Math.PI * 2; // angle around the ring
    const v = (i / count) * Math.PI * 8; // angle around the tube (winds 4x)

    positions.push([
      (R + r * Math.cos(v)) * Math.cos(u),
      r * Math.sin(v),
      (R + r * Math.cos(v)) * Math.sin(u),
    ]);
  }
  return positions;
}

// HELIX: DNA-like spiral
function getHelixPositions(count: number): Position3D[] {
  const positions: Position3D[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 4; // 2 full rotations
    positions.push([
      2.5 * Math.cos(t),
      (i / count) * 8 - 4, // spread from -4 to +4
      2.5 * Math.sin(t),
    ]);
  }
  return positions;
}

// GRID: Flat 2D grid in 3D space
function getGridPositions(count: number): Position3D[] {
  const positions: Position3D[] = [];
  const cols = Math.ceil(Math.sqrt(count));

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const totalRows = Math.ceil(count / cols);

    positions.push([
      (col - (cols - 1) / 2) * 1.8,
      (row - (totalRows - 1) / 2) * 1.8,
      0,
    ]);
  }
  return positions;
}