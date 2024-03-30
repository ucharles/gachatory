"use client";

import { useState } from "react";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Capsule {
  img: string;
  name: string;
  detail_img: string[];
}

const prepareImageUrl =
  "https://static.gachatory.com/contents/images/prepare.jpg";

export default function CapsuleImageCarousel({ data }: { data: Capsule }) {
  const lastImage =
    data.detail_img.length === 0 && data.img === prepareImageUrl
      ? [prepareImageUrl]
      : data.detail_img;
  const images =
    data.img === prepareImageUrl ? [...lastImage] : [data.img, ...lastImage];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };
  return (
    <div>
      <Carousel opts={{ loop: true }}>
        <CarouselContent
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
          className="-ml-0 flex items-center"
        >
          {images.map((img, i) => (
            <CarouselItem key={i} className="pl-0">
              <div
                className={`flex justify-center overflow-hidden rounded-md border border-gray-300`}
              >
                <Image src={img} alt={data.name + i} width={600} height={600} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && <CarouselPrevious onClick={prevSlide} />}
        {images.length > 1 && <CarouselNext onClick={nextSlide} />}
      </Carousel>
      <div className="mt-4 grid grid-cols-5 gap-2 md:grid-cols-6">
        {images.map((img, i) => (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center overflow-hidden rounded-md border-2 ${
              activeIndex === i ? "border-gigas-700" : "border-gray-300"
            }`}
            onClick={() => setActiveIndex(i)}
          >
            <Image
              priority
              src={img}
              alt={data.name + i}
              width={200}
              height={200}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
