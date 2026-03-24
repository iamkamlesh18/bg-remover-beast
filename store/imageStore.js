import { create } from "zustand";

const useImageStore = create((set, get) => ({

  // Single image mode
  image: null,
  result: null,
  processing: false,

  // Batch mode
  batchQueue: [],
  batchResults: [],
  batchMode: false,

  // Background replacement
  backgroundMode: null, // null | "color" | "image"
  backgroundColor: "#ffffff",
  backgroundImage: null,

  setImage: (img) => {
    const state = get();
    if (state.image && state.image.startsWith('blob:')) {
      URL.revokeObjectURL(state.image);
    }
    set({ image: img, result: null, backgroundMode: null });
  },

  setResult: (img) => {
    set({ result: img });
  },

  setProcessing: (processing) => set({ processing }),

  // Background replacement state management
  setBackgroundColor: (color) => {
    set({ backgroundMode: "color", backgroundColor: color });
  },

  setBackgroundImage: (imageUrl) => {
    const state = get();
    if (state.backgroundImage && state.backgroundImage.startsWith('blob:')) {
      URL.revokeObjectURL(state.backgroundImage);
    }
    set({ backgroundMode: "image", backgroundImage: imageUrl });
  },

  clearBackground: () => {
    const state = get();
    if (state.backgroundImage && state.backgroundImage.startsWith('blob:')) {
      URL.revokeObjectURL(state.backgroundImage);
    }
    set({ backgroundMode: null, backgroundImage: null });
  },

  // Batch operations
  addToBatch: (files) => {
    const newQueue = files.map((file) => ({
      file: file,
      fileName: file.name,
      url: URL.createObjectURL(file),
      status: "pending", // pending | processing | done | error
      result: null,
      error: null
    }));
    set((state) => ({
      batchQueue: [...state.batchQueue, ...newQueue],
      batchMode: true
    }));
  },

  updateBatchItem: (index, updates) =>
    set((state) => ({
      batchQueue: state.batchQueue.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
    })),

  addBatchResult: (result) => {
    set((state) => ({
      batchResults: [...state.batchResults, result]
    }));
  },

  clearBatch: () => {
    const state = get();
    // Cleanup all blob URLs
    state.batchQueue.forEach((item) => {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });
    set({
      batchQueue: [],
      batchResults: [],
      batchMode: false
    });
  },

  clearAll: () => {
    const state = get();
    if (state.image && state.image.startsWith('blob:')) {
      URL.revokeObjectURL(state.image);
    }
    if (state.backgroundImage && state.backgroundImage.startsWith('blob:')) {
      URL.revokeObjectURL(state.backgroundImage);
    }
    state.batchQueue.forEach((item) => {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });
    set({
      image: null,
      result: null,
      processing: false,
      batchQueue: [],
      batchResults: [],
      batchMode: false,
      backgroundMode: null,
      backgroundColor: "#ffffff",
      backgroundImage: null
    });
  }

}));

export default useImageStore;