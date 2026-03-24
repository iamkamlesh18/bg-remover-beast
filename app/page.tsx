"use client";

import useImageStore from "@/store/imageStore";
import UploadArea from "@/components/upload/UploadArea";
import EditorWorkspace from "@/components/editor/EditorWorkspace";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function Page() {
  const processing = useImageStore(s => s.processing);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      
      {/* Loading Overlay */}
      {processing && <LoadingOverlay message="Processing your image..." />}

      {/* Header */}
      <header className="border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✨</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  BG Remover Beast
                </h1>
                <p className="text-sm text-slate-400">AI-powered background removal</p>
              </div>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Remove Backgrounds Instantly
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powered by AI. No watermarks. Works in your browser. Process single images or batch process dozens at once.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-16 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <UploadArea />
        </div>

        {/* Editor Section */}
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <EditorWorkspace />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-500">
          <p>Built with Next.js, React, & AI. No data is stored on servers.</p>
        </div>
      </footer>

      {/* Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

    </div>
  );
}