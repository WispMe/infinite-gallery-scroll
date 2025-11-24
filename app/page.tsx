"use client";

import Image from "next/image";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";

const images = [
  "/images/image-1.png",
  "/images/image-2.png",
  "/images/image-3.png",
  "/images/image-4.png",
  "/images/image-5.png",
  "/images/image-6.png",
  "/images/image-7.png",
];

export default function Home() {
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);

  // Gap between images in pixels
  const GAP = 100;
  const IMAGE_HEIGHT = 300; // approximate height for positioning
  const SCROLL_COOLDOWN = 600; // milliseconds to wait before allowing next scroll

  useGSAP(() => {
    // Initial setup - position all images
    imgRefs.current.forEach((img, index) => {
      if (img) {
        const offset = index * GAP;
        const distance = Math.abs(index);

        // Calculate scale based on distance from center
        let scale = 1;
        if (distance === 1) scale = 0.8;
        else if (distance === 2) scale = 0.6;
        else if (distance > 2) scale = 0.4;

        // Calculate opacity - disappear if too far
        const opacity = distance > 2 ? 0 : 1;

        gsap.set(img, {
          scale,
          zIndex: images.length - distance,
          opacity,
          position: "absolute",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: offset - IMAGE_HEIGHT / 2,
        });
      }
    });
  }, []);

  const animateToIndex = (newIndex: number) => {
    if (
      isAnimating.current ||
      newIndex < 0 ||
      newIndex >= images.length ||
      newIndex === currentIndex
    ) {
      return;
    }

    isAnimating.current = true;

    imgRefs.current.forEach((img, index) => {
      if (img) {
        const relativePosition = index - newIndex;
        const offset = relativePosition * GAP;
        const distance = Math.abs(relativePosition);
        const newZIndex = images.length - distance;

        // Calculate scale based on distance from center
        let scale = 1;
        if (distance === 1) scale = 0.8;
        else if (distance === 2) scale = 0.7;
        else if (distance > 2) scale = 0.7;

        // Calculate opacity - disappear if too far
        const opacity = distance > 2 ? 0 : 1;

        gsap.to(img, {
          y: offset - IMAGE_HEIGHT / 2,
          scale,
          opacity,
          zIndex: newZIndex,
          duration: 0.35,
          ease: "power2.inOut",
          onComplete: () => {
            if (index === newIndex) {
              isAnimating.current = false;
            }
          },
        });
      }
    });

    setCurrentIndex(newIndex);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const now = Date.now();

    // Check if we're still in cooldown period
    if (now - lastScrollTime.current < SCROLL_COOLDOWN) {
      return;
    }

    if (isAnimating.current) return;

    // Only trigger if scroll is significant enough (prevents tiny accidental scrolls)
    if (Math.abs(e.deltaY) < 10) return;

    lastScrollTime.current = now;

    if (e.deltaY > 0) {
      // Scrolling down - go to next image
      animateToIndex(currentIndex + 1);
    } else {
      // Scrolling up - go to previous image
      animateToIndex(currentIndex - 1);
    }
  };

  return (
    <main>
      <div
        ref={containerRef}
        className="flex h-screen fixed left-0 top-0 max-h-screen overflow-hidden w-full bg-[#EEEEEE]"
        onWheel={handleWheel}
      >
        <div className="w-[275px] mx-auto h-full relative">
          {images.map((src, index) => (
            <div
              key={index}
              className="w-full"
              ref={(el) => {
                imgRefs.current[index] = el;
              }}
            >
              <Image
                src={src}
                width={800}
                height={1200}
                className="w-full aspect-3/4 object-cover shadow-2xl"
                alt={`Image ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
