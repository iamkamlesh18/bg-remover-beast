"use client";

import { useRef } from "react";
import useImageStore from "@/store/imageStore";

export default function BackgroundSelector() {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const backgroundMode = useImageStore(s => s.backgroundMode);
  const backgroundColor = useImageStore(s => s.backgroundColor);
  const setBackgroundColor = useImageStore(s => s.setBackgroundColor);
  const setBackgroundImage = useImageStore(s => s.setBackgroundImage);
  const clearBackground = useImageStore(s => s.clearBackground);

  function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBackgroundColor(e.target.value);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const url = URL.createObjectURL(e.target.files[0]);
    setBackgroundImage(url);
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>🎨</span>
        Background Options
      </h3>

      <div className="flex flex-col gap-3">
        {/* Remove Background */}
        <button
          onClick={clearBackground}
          className={`p-4 rounded-xl transition-all transform hover:scale-105 text-left ${
            backgroundMode === null
              ? "bg-linear-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/30"
              : "bg-slate-700/50 hover:bg-slate-600/50"
          }`}
        >
          <div className="font-semibold">✨ Remove Background</div>
          <div className="text-sm opacity-75">Transparent background</div>
        </button>

        {/* Color Background */}
        <div className="flex gap-2 items-stretch">
          <button
            onClick={() => colorInputRef.current?.click()}
            className={`flex-1 p-4 rounded-xl transition-all transform hover:scale-105 text-left ${
              backgroundMode === "color"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30"
                : "bg-slate-700/50 hover:bg-slate-600/50"
            }`}
          >
            <div className="font-semibold">🎨 Solid Color</div>
            <div className="text-sm opacity-75">Custom background</div>
          </button>
          <button
            onClick={() => colorInputRef.current?.click()}
            className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
              backgroundMode === "color"
                ? "bg-linear-to-r from-blue-600 to-blue-500"
                : "bg-slate-700/50 hover:bg-slate-600/50"
            }`}
            title="Pick a color"
          >
            <div
              className="w-10 h-10 rounded-lg border-2 border-white/30 shadow-lg"
              style={{ backgroundColor }}
            />
          </button>
          <input
            type="color"
            hidden
            ref={colorInputRef}
            value={backgroundColor}
            onChange={handleColorChange}
          />
        </div>

        {/* Image Background */}
        <button
          onClick={() => imageInputRef.current?.click()}
          className={`p-4 rounded-xl transition-all transform hover:scale-105 text-left ${
            backgroundMode === "image"
              ? "bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/30"
              : "bg-slate-700/50 hover:bg-slate-600/50"
          }`}
        >
          <div className="font-semibold">🖼️ Image Background</div>
          <div className="text-sm opacity-75">Custom image</div>
        </button>
        <input
          type="file"
          hidden
          ref={imageInputRef}
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  );
}
