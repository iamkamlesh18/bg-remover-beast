"use client";

import { useRef, useState } from "react";
import useImageStore from "@/store/imageStore";

export default function UploadArea() {

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const setImage = useImageStore(s => s.setImage);
  const addToBatch = useImageStore(s => s.addToBatch);
  const batchMode = useImageStore(s => s.batchMode);
  const clearBatch = useImageStore(s => s.clearBatch);

  function handleSingleFile(file: File) {
    const url = URL.createObjectURL(file);
    setImage(url);
  }

  function handleMultipleFiles(files: FileList | null) {
    if (!files) return;
    const fileArray = Array.from(files);
    addToBatch(fileArray);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    if (e.target.multiple || e.target.files.length > 1) {
      handleMultipleFiles(e.target.files);
    } else {
      handleSingleFile(e.target.files[0]);
    }
  }

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, isMultiple: boolean) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files) {
      if (isMultiple) {
        handleMultipleFiles(e.dataTransfer.files);
      } else {
        handleSingleFile(e.dataTransfer.files[0]);
      }
    }
  }

  function startSingleMode() {
    if (inputRef.current) {
      inputRef.current.multiple = false;
      inputRef.current.click();
    }
  }

  function startBatchMode() {
    if (inputRef.current) {
      inputRef.current.multiple = true;
      inputRef.current.click();
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <input
        type="file"
        hidden
        ref={inputRef}
        accept="image/*"
        onChange={handleInputChange}
      />

      {!batchMode ? (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Single Image Upload */}
          <div
            className={`flex-1 border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
              isDragActive
                ? "border-indigo-400 bg-indigo-500/10"
                : "border-slate-600 hover:border-indigo-500 hover:bg-slate-800/50"
            }`}
            onDragEnter={(e) => handleDrag(e)}
            onDragLeave={(e) => handleDrag(e)}
            onDragOver={(e) => handleDrag(e)}
            onDrop={(e) => handleDrop(e, false)}
            onClick={startSingleMode}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">🖼️</div>
              <h2 className="text-xl font-semibold">Single Image</h2>
              <p className="text-sm text-slate-400 text-center">
                Drop your image here or click to browse
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startSingleMode();
                }}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg transition font-medium text-sm"
              >
                Select Image
              </button>
            </div>
          </div>

          {/* Batch Upload */}
          <div
            className={`flex-1 border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
              isDragActive
                ? "border-blue-400 bg-blue-500/10"
                : "border-slate-600 hover:border-blue-500 hover:bg-slate-800/50"
            }`}
            onDragEnter={(e) => handleDrag(e)}
            onDragLeave={(e) => handleDrag(e)}
            onDragOver={(e) => handleDrag(e)}
            onDrop={(e) => handleDrop(e, true)}
            onClick={startBatchMode}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">📦</div>
              <h2 className="text-xl font-semibold">Batch Process</h2>
              <p className="text-sm text-slate-400 text-center">
                Drop multiple images or click to select
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startBatchMode();
                }}
                className="mt-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition font-medium text-sm"
              >
                Select Images
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-blue-600 bg-blue-500/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl">📦</div>
            <div>
              <h2 className="text-2xl font-bold text-blue-400">Batch Mode</h2>
              <p className="text-slate-400">Ready to process multiple images</p>
            </div>
          </div>
          <button
            onClick={clearBatch}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition font-medium"
          >
            Clear & Start Over
          </button>
        </div>
      )}
    </div>
  );
}