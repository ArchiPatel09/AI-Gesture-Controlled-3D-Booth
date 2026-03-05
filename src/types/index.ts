export interface Photo{
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
| "grid"

export interface PhotoBoothState {
    photos: Photo[];
    shape: ShapeType;
    selectedIndex: number | null;
}
