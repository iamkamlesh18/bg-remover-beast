"use client";

export default function Toolbar({ 
  process, 
  disabled = false, 
  onExport,
  hasResult = false 
}: {
  process: () => void;
  disabled?: boolean;
  onExport?: (format: "png" | "jpg") => void;
  hasResult?: boolean;
}) {

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl">
      
      {/* Process Button */}
      <button
        onClick={process}
        disabled={disabled}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-xl disabled:hover:scale-100"
      >
        {disabled ? "⏳ Processing..." : "🚀 Remove Background"}
      </button>

      {/* Export Buttons */}
      {hasResult && (
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={() => onExport?.("png")}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-xl transition-all transform hover:scale-105 text-base font-semibold shadow-lg hover:shadow-xl"
          >
            💾 Export PNG
          </button>
          <button
            onClick={() => onExport?.("jpg")}
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-6 py-3 rounded-xl transition-all transform hover:scale-105 text-base font-semibold shadow-lg hover:shadow-xl"
          >
            💾 Export JPG
          </button>
        </div>
      )}

    </div>
  );
}