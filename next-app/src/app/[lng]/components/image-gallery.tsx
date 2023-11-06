"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  detail_img: string[];
}

function ImageGallery({ detail_img }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  let hoverTimeout: NodeJS.Timeout | null = null; // Stores the timeout ID

  const handleImageClick = useCallback((image: string) => {
    setSelectedImage(image);
  }, []);

  const handleImageHover = useCallback((image: string | null) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    // Set a new timeout to trigger the event after a delay
    hoverTimeout = setTimeout(() => {
      setSelectedImage(image);
    }, 100); // Adjust the delay as needed (in milliseconds)
  }, []);

  const handleClose = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return (
    <div className="grid grid-cols-6 gap-2 pt-6">
      {detail_img.map((image, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-gray-300 p-1 shadow-sm"
        >
          <Image
            src={image}
            alt={`Image ${index}`}
            onClick={() => handleImageClick(image)}
            onMouseEnter={() => handleImageHover(image)}
            onMouseLeave={() => handleImageHover(null)}
            className="transform cursor-pointer transition ease-in-out hover:scale-105"
            width={200}
            height={200}
          />
        </div>
      ))}
      {selectedImage && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClose}
        >
          <Image
            src={selectedImage}
            alt="Selected Image"
            className="max-h-full max-w-full"
            width={500}
            height={500}
          />
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
