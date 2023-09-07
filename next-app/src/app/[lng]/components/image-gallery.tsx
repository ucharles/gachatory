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
    <div className="grid grid-cols-4 gap-2 pt-2">
      {detail_img.map((image, index) => (
        <div key={index} className="border border-black rounded-lg p-2">
          <Image
            src={image}
            alt={`Image ${index}`}
            onClick={() => handleImageClick(image)}
            onMouseEnter={() => handleImageHover(image)}
            onMouseLeave={() => handleImageHover(null)}
            className="cursor-pointer hover:scale-105 transform transition ease-in-out"
            width={200}
            height={200}
            unoptimized={true}
          />
        </div>
      ))}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none"
          onClick={handleClose}
        >
          <Image
            src={selectedImage}
            alt="Selected Image"
            className="max-w-full max-h-full"
            width={500}
            height={500}
            unoptimized={true}
          />
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
