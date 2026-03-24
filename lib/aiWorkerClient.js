// Client for communicating with AI Worker
// Falls back to main thread if worker fails

let worker = null;
let messageId = 0;
const pendingMessages = new Map();
let workerAvailable = false;

/**
 * Create worker safely
 */
function createWorker() {
  try {
    return new Worker(
      new URL("../workers/aiWorker.js", import.meta.url),
      { type: "module" }
    );
  } catch (error) {
    console.error("Worker creation failed:", error);
    return null;
  }
}

/**
 * Initialize the AI worker
 */
export async function initWorker() {

  if (workerAvailable) return;
  if (worker) return;

  worker = createWorker();

  if (!worker) {
    throw new Error("Worker not supported in this environment");
  }

  worker.onmessage = (e) => {

    const { id, type, data, error, success } = e.data;

    const pending = pendingMessages.get(id);
    if (!pending) return;

    if (type === "ERROR" || !success) {
      pending.reject(new Error(error || "Worker error"));
    } else {
      pending.resolve(data);
    }

    pendingMessages.delete(id);

  };

  worker.onerror = (error) => {
    console.error("Worker runtime error:", error);
  };

  // Wait for worker init
  return new Promise((resolve, reject) => {

    const id = messageId++;
    let completed = false;

    const timeoutId = setTimeout(() => {

      if (!completed) {

        completed = true;

        pendingMessages.delete(id);

        if (worker) {
          worker.terminate();
          worker = null;
        }

        reject(
          new Error(
            "Worker initialization timeout — falling back to main thread"
          )
        );
      }

    }, 60000);

    pendingMessages.set(id, {

      resolve: () => {

        if (!completed) {

          completed = true;

          clearTimeout(timeoutId);

          workerAvailable = true;

          resolve();

        }

      },

      reject: (err) => {

        if (!completed) {

          completed = true;

          clearTimeout(timeoutId);

          if (worker) {
            worker.terminate();
            worker = null;
          }

          reject(err);

        }

      }

    });

    worker.postMessage({
      id,
      type: "INIT"
    });

  });

}

/**
 * Run segmentation on image data
 */
export async function segmentImage(imageData) {

  if (!worker || !workerAvailable) {
    throw new Error("Worker not available");
  }

  return new Promise((resolve, reject) => {

    const id = messageId++;
    let completed = false;

    const timeoutId = setTimeout(() => {

      if (!completed) {

        completed = true;

        pendingMessages.delete(id);

        reject(new Error("Segmentation timeout"));

      }

    }, 180000);

    pendingMessages.set(id, {

      resolve: (data) => {

        if (!completed) {

          completed = true;

          clearTimeout(timeoutId);

          resolve(data);

        }

      },

      reject: (err) => {

        if (!completed) {

          completed = true;

          clearTimeout(timeoutId);

          reject(err);

        }

      }

    });

    worker.postMessage(
      {
        id,
        type: "SEGMENT",
        data: { imageData }
      },
      imageData instanceof ImageBitmap ? [imageData] : []
    );

  });

}

/**
 * Terminate worker
 */
export function terminateWorker() {

  if (worker) {

    worker.terminate();

    worker = null;

  }

  pendingMessages.clear();

  messageId = 0;

  workerAvailable = false;

}

/**
 * Check if worker ready
 */
export function isWorkerReady() {
  return worker !== null && workerAvailable;
}