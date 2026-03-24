"use client";

import { useRef, useState, useEffect } from "react";

export default function CompareSlider({ original, result }: { original: string; result: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  if (!original) return null;

  // Update container width on mount and window resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

    setSliderPos(percent);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-3xl bg-slate-800 rounded-2xl overflow-hidden cursor-col-resize select-none shadow-2xl hover:shadow-3xl transition-shadow"
      style={{ aspectRatio: "16 / 9" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isDragging && setIsDragging(false)}
    >
      {/* Original Image (Full) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
        <img
          src={original}
          alt="Original image"
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Processed Image (Clipped by slider) */}
      {result && (
        <div
          className="absolute inset-0 overflow-hidden transition-opacity"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={result}
            alt="Processed image"
            className="w-full h-full object-cover pointer-events-none"
            style={{
              width: containerRef.current ? `${(100 / sliderPos) * 100}%` : "100%",
            }}
          />
        </div>
      )}

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-white to-purple-400 cursor-col-resize shadow-lg transition-opacity"
        style={{
          left: `${sliderPos}%`,
          opacity: isDragging ? 1 : 0.8,
          transform: "translateX(-50%)",
          boxShadow: isDragging ? "0 0 20px rgba(59, 130, 246, 0.8)" : "none",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Grip Visual */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform">
          <div className="flex gap-1">
            <div className="w-0.5 h-5 bg-slate-800 rounded" />
            <div className="w-0.5 h-5 bg-slate-800 rounded" />
            <div className="w-0.5 h-5 bg-slate-800 rounded" />
          </div>
        </div>
      </div>

      {/* Labels with Background */}
      <div className="absolute top-4 left-4 flex gap-2 items-center">
        <div className="px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-sm font-semibold border border-white/20">
          Original
        </div>
      </div>
      <div className="absolute top-4 right-4 flex gap-2 items-center">
        <div className="px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-sm font-semibold border border-white/20">
          {result ? "Processed" : "Processing..."}
        </div>
      </div>

      {/* Hint for Desktop */}
      {result && !isDragging && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 bg-black/40 px-3 py-1 rounded-full opacity-0 hover:opacity-100 transition-opacity">
          Drag to compare
        </div>
      )}
    </div>
  );
}