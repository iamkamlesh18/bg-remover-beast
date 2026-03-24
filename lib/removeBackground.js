import { initWorker, segmentImage, isWorkerReady } from "./aiWorkerClient";

let workerInitPromise = null;

function ensureWorkerInit() {

  if (isWorkerReady()) return Promise.resolve();

  if (!workerInitPromise) {
    workerInitPromise = initWorker();
  }

  return workerInitPromise;
}

export default async function removeBackground(imageUrl) {

  await ensureWorkerInit();

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const width = img.width;
  const height = img.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);

  const { maskData, maskShape } = await segmentImage(imageData);

  const maskHeight = maskShape[0];
  const maskWidth = maskShape[1];

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;

  const outCtx = outputCanvas.getContext("2d");
  outCtx.drawImage(img, 0, 0);

  const finalImageData = outCtx.getImageData(0, 0, width, height);
  const pixels = finalImageData.data;

  const scaleX = maskWidth / width;
  const scaleY = maskHeight / height;

  for (let y = 0; y < height; y++) {

    for (let x = 0; x < width; x++) {

      const maskX = Math.floor(x * scaleX);
      const maskY = Math.floor(y * scaleY);

      const maskIndex = maskY * maskWidth + maskX;

      const alpha = maskData[maskIndex] * 255;

      const pixelIndex = (y * width + x) * 4 + 3;

      pixels[pixelIndex] = alpha;

    }

  }

  outCtx.putImageData(finalImageData, 0, 0);

  return outputCanvas.toDataURL("image/png");
}