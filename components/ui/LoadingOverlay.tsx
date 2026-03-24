"use client";

import Spinner from "./Spinner";

export default function LoadingOverlay({ message = "Processing..." }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        <Spinner />
        <p className="mt-4 text-lg font-medium text-slate-200">{message}</p>
      </div>
    </div>
  );
}
