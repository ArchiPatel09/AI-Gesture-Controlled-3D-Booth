"use client";

import { useState, useCallback } from "react";
import { Photo } from "@/types";

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // processFiles: converts File objects → Photo objects with blob URLs
  // URL.createObjectURL() creates a temporary browser URL like blob://...
  const addPhotos = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );

    const newPhotos: Photo[] = imageFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file), // browser creates a temporary URL
      name: file.name,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      // revoke the old blob URL to free memory — important!
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    setSelectedIndex(null);
  }, []);

  const clearAll = useCallback(() => {
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url)); // free all memory
      return [];
    });
    setSelectedIndex(null);
  }, []);

  const selectPhoto = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  return {
    photos,
    selectedIndex,
    addPhotos,
    removePhoto,
    clearAll,
    selectPhoto,
  };
}