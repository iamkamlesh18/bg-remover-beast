"use client";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
      </div>
    </div>
  );
}
