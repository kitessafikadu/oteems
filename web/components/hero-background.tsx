"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  "/images/office-photo-1.jpg",
  "/images/office-photo-2.jpg",
  "/images/office-photo-3.jpeg",
];

export default function HeroBackground() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, index) => {
        const previous = (current - 1 + images.length) % images.length;

        return (
          <div
            key={image}
            className={`absolute inset-0 transition-transform duration-[1500ms] ease-in-out ${
              index === current
                ? "translate-x-0"
                : index === previous
                  ? "-translate-x-full"
                  : "translate-x-full"
            }`}
          >
            <Image
              src={image}
              alt=""
              fill
              priority={index === 0}
              loading="eager"
              sizes="100vw"
              className="object-cover blur-[2px] scale-105"
            />
          </div>
        );
      })}

      {/* Readability overlay – slightly stronger */}
      <div className="absolute inset-0 bg-white/40" />
    </div>
  );
}
