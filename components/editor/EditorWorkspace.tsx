"use client";

import { useState } from "react";
import useImageStore from "@/store/imageStore";
import removeBackground from "@/lib/removeBackground";
import { createTransparent, replaceBackgroundWithImage, replaceBackgroundWithColor } from "@/lib/backgroundReplace";
import { BatchQueue } from "@/lib/batchQueue";
import { exportZip, downloadZip } from "@/lib/exportZip";
import CompareSlider from "./CompareSlider";
import BackgroundSelector from "./BackgroundSelector";
import Toolbar from "./Toolbar";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function EditorWorkspace(){

  const image = useImageStore(s=>s.image);
  const result = useImageStore(s=>s.result);
  const setResult = useImageStore(s=>s.setResult);
  const processing = useImageStore(s=>s.processing);
  const setProcessing = useImageStore(s=>s.setProcessing);
  
  // Background management
  const backgroundMode = useImageStore(s=>s.backgroundMode);
  const backgroundColor = useImageStore(s=>s.backgroundColor);
  const backgroundImage = useImageStore(s=>s.backgroundImage);

  // Batch mode
  const batchQueue = useImageStore(s=>s.batchQueue);
  const batchResults = useImageStore(s=>s.batchResults);
  const batchMode = useImageStore(s=>s.batchMode);
  const updateBatchItem = useImageStore(s=>s.updateBatchItem);
  const addBatchResult = useImageStore(s=>s.addBatchResult);

  const [applyingBackground, setApplyingBackground] = useState(false);

  async function processSingle(){
    try {
      setProcessing(true);
      const output = await removeBackground(image);
      setResult(output);
    } finally {
      setProcessing(false);
    }
  }

  async function applyBackground(){
    if (!image || !result) return;
    
    try {
      setApplyingBackground(true);
      let finalResult;

      if (backgroundMode === "color") {
        finalResult = await replaceBackgroundWithColor(image, backgroundColor);
      } else if (backgroundMode === "image") {
        finalResult = await replaceBackgroundWithImage(image, backgroundImage);
      } else {
        finalResult = await createTransparent(image);
      }

      setResult(finalResult);
    } finally {
      setApplyingBackground(false);
    }
  }

  function exportResult(format: "png" | "jpg") {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result;
    link.download = `background-removed-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function processBatch(){
    if (processing) return;
    setProcessing(true);

    const queue = new BatchQueue();
    batchQueue.forEach((item: any, idx: number) => {
      queue.add({ ...item, index: idx });
    });

    const processor = async (task: any) => {
      try {
        updateBatchItem(task.index, { status: "processing" });
        const dataUrl = await removeBackground(task.url);
        updateBatchItem(task.index, { status: "done", result: dataUrl });
        
        return {
          fileName: task.fileName,
          dataUrl: dataUrl,
          status: "done"
        };
      } catch (error) {
        updateBatchItem(task.index, { status: "error", error: (error as Error).message });
        return {
          fileName: task.fileName,
          status: "error",
          error: (error as Error).message
        };
      }
    };

    const results = await queue.process(processor);
    if (results) {
      results.forEach((r: any) => addBatchResult(r));
    }
    setProcessing(false);
  }

  async function downloadBatch(){
    if (batchResults.length === 0) return;
    
    const zip = await exportZip(batchResults);
    downloadZip(zip, `background-removed_${Date.now()}.zip`);
  }

  // Single image mode
  if (!batchMode && image) {
    return(
      <>
        {applyingBackground && <LoadingOverlay message="Applying background..." />}
        
        <div className="flex flex-col gap-8 items-center w-full">
          
          {/* Comparison Slider */}
          <div className="animate-slide-up">
            <CompareSlider original={image} result={result}/>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            
            {/* Left - Background Options */}
            <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <BackgroundSelector />
            </div>

            {/* Center/Right - Action Buttons */}
            <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="flex flex-col gap-4">
                
                {/* Apply Background Button */}
                {result && backgroundMode !== null && (
                  <button
                    onClick={applyBackground}
                    disabled={applyingBackground}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-xl disabled:hover:scale-100"
                  >
                    {applyingBackground ? "⏳ Applying..." : "✨ Apply Background"}
                  </button>
                )}

                {/* Process & Export Buttons */}
                <Toolbar 
                  process={processSingle} 
                  disabled={processing}
                  onExport={exportResult}
                  hasResult={!!result}
                />
              </div>
            </div>

          </div>

        </div>
      </>
    );
  }

  // Batch mode
  if (batchMode) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 shadow-2xl">
          
          <div className="flex items-center gap-4 mb-8">
            <div className="text-5xl">📦</div>
            <div>
              <h2 className="text-3xl font-bold text-blue-400">Batch Processing</h2>
              <p className="text-slate-400">Process multiple images at once</p>
            </div>
          </div>

          {/* Queue display */}
          <div className="mb-8 max-h-96 overflow-y-auto rounded-xl bg-slate-900/50 p-4">
            {batchQueue.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-3 mb-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
                <div className="text-2xl">📄</div>
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{item.fileName}</p>
                  <p className="text-xs text-slate-400">
                    <span className={
                      item.status === "done" ? "text-green-400" :
                      item.status === "processing" ? "text-blue-400 font-semibold" :
                      item.status === "error" ? "text-red-400" :
                      "text-slate-400"
                    }>
                      {item.status === "done" && "✓ Done"}
                      {item.status === "processing" && "⏳ Processing..."}
                      {item.status === "error" && "✗ Error"}
                      {item.status === "pending" && "⏸ Pending"}
                    </span>
                  </p>
                </div>
                {item.result && <span className="text-2xl">✅</span>}
              </div>
            ))}
          </div>

          {/* Stats */}
          {batchResults.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl border border-green-700/50">
              <p className="text-sm font-semibold text-green-300">
                ✓ {batchResults.filter((r: any) => r.status === "done").length} of {batchQueue.length} Processed
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <button
              onClick={processBatch}
              disabled={processing || batchQueue.length === 0}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 rounded-xl hover:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-xl disabled:hover:scale-100"
            >
              {processing ? "⏳ Processing..." : `🚀 Process All (${batchQueue.length})`}
            </button>

            {batchResults.length > 0 && (
              <button
                onClick={downloadBatch}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl hover:rounded-2xl transition-all transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-xl"
              >
                ⬇️ Download ZIP
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}