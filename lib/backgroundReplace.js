import { initWorker, segmentImage, isWorkerReady } from "./aiWorkerClient";

// Initialize worker on first import
let workerInitPromise = null;

function ensureWorkerInit() {
  if (isWorkerReady()) {
    return Promise.resolve();
  }
  if (workerInitPromise) {
    return workerInitPromise;
  }
  workerInitPromise = initWorker();
  return workerInitPromise;
}

/**
 * Create transparent background by removing detected subject background
 */
export async function createTransparent(imageUrl) {
  await ensureWorkerInit();

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const imgWidth = img.width;
  const imgHeight = img.height;

  const canvas = document.createElement("canvas");
  canvas.width = imgWidth;
  canvas.height = imgHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

  let imageBitmap;
  try {
    imageBitmap = await createImageBitmap(canvas);
  } catch {
    imageBitmap = canvas;
  }

  const { maskData, maskShape } = await segmentImage(imageBitmap);

  const maskHeight = maskShape[0];
  const maskWidth = maskShape[1];

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = imgWidth;
  finalCanvas.height = imgHeight;

  const finalCtx = finalCanvas.getContext("2d", { willReadFrequently: true });
  finalCtx.drawImage(img, 0, 0, imgWidth, imgHeight);

  const imageData = finalCtx.getImageData(0, 0, imgWidth, imgHeight);
  const data = imageData.data;

  const scaleX = maskWidth / imgWidth;
  const scaleY = maskHeight / imgHeight;

  for (let y = 0; y < imgHeight; y++) {
    for (let x = 0; x < imgWidth; x++) {
      const maskX = Math.floor(x * scaleX);
      const maskY = Math.floor(y * scaleY);
      const maskIndex = maskY * maskWidth + maskX;

      const alpha = maskData[maskIndex] * 255;
      const pixelIndex = (y * imgWidth + x) * 4 + 3;
      data[pixelIndex] = Math.round(alpha);
    }
  }

  finalCtx.putImageData(imageData, 0, 0);
  const pngDataUrl = finalCanvas.toDataURL("image/png");

  img.src = "";
  canvas.width = 0;
  canvas.height = 0;
  finalCanvas.width = 0;
  finalCanvas.height = 0;

  if (imageBitmap && imageBitmap !== canvas) {
    try {
      imageBitmap.close?.();
    } catch {
      // ImageBitmap close might not be available
    }
  }

  return pngDataUrl;
}

/**
 * Replace background with another image
 */
export async function replaceBackgroundWithImage(imageUrl, backgroundImageUrl) {
  await ensureWorkerInit();

  // Load subject image
  const subjectImg = new Image();
  subjectImg.crossOrigin = "anonymous";
  subjectImg.src = imageUrl;

  await new Promise((resolve, reject) => {
    subjectImg.onload = resolve;
    subjectImg.onerror = reject;
  });

  // Load background image
  const bgImg = new Image();
  bgImg.crossOrigin = "anonymous";
  bgImg.src = backgroundImageUrl;

  await new Promise((resolve, reject) => {
    bgImg.onload = resolve;
    bgImg.onerror = reject;
  });

  const imgWidth = subjectImg.width;
  const imgHeight = subjectImg.height;

  // Get segmentation mask
  const canvas = document.createElement("canvas");
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(subjectImg, 0, 0, imgWidth, imgHeight);

  let imageBitmap;
  try {
    imageBitmap = await createImageBitmap(canvas);
  } catch {
    imageBitmap = canvas;
  }

  const { maskData, maskShape } = await segmentImage(imageBitmap);

  const maskHeight = maskShape[0];
  const maskWidth = maskShape[1];

  // Create output canvas
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = imgWidth;
  outputCanvas.height = imgHeight;
  const outCtx = outputCanvas.getContext("2d");

  // Draw background (scaled to fit)
  outCtx.drawImage(bgImg, 0, 0, imgWidth, imgHeight);

  // Draw subject on top using mask
  outCtx.drawImage(subjectImg, 0, 0, imgWidth, imgHeight);

  // Get image data and apply mask
  const imageData = outCtx.getImageData(0, 0, imgWidth, imgHeight);
  const data = imageData.data;

  const scaleX = maskWidth / imgWidth;
  const scaleY = maskHeight / imgHeight;

  for (let y = 0; y < imgHeight; y++) {
    for (let x = 0; x < imgWidth; x++) {
      const maskX = Math.floor(x * scaleX);
      const maskY = Math.floor(y * scaleY);
      const maskIndex = maskY * maskWidth + maskX;

      const alpha = maskData[maskIndex];
      const pixelIndex = (y * imgWidth + x) * 4;

      if (alpha < 0.5) {
        // Background area - keep background
        // (already drawn)
      } else {
        // Subject area - draw subject
        const subjectPixel = getPixelAt(subjectImg, x, y, imgWidth, imgHeight);
        data[pixelIndex] = subjectPixel.r;
        data[pixelIndex + 1] = subjectPixel.g;
        data[pixelIndex + 2] = subjectPixel.b;
        data[pixelIndex + 3] = subjectPixel.a;
      }
    }
  }

  outCtx.putImageData(imageData, 0, 0);
  const jpgDataUrl = outputCanvas.toDataURL("image/jpeg", 0.95);

  // Cleanup
  subjectImg.src = "";
  bgImg.src = "";
  canvas.width = 0;
  canvas.height = 0;
  outputCanvas.width = 0;
  outputCanvas.height = 0;

  if (imageBitmap && imageBitmap !== canvas) {
    try {
      imageBitmap.close?.();
    } catch {
      // ImageBitmap close might not be available
    }
  }

  return jpgDataUrl;
}

/**
 * Replace background with solid color
 */
export async function replaceBackgroundWithColor(imageUrl, color) {
  await ensureWorkerInit();

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const imgWidth = img.width;
  const imgHeight = img.height;

  // Get segmentation mask
  const canvas = document.createElement("canvas");
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

  let imageBitmap;
  try {
    imageBitmap = await createImageBitmap(canvas);
  } catch {
    imageBitmap = canvas;
  }

  const { maskData, maskShape } = await segmentImage(imageBitmap);

  const maskHeight = maskShape[0];
  const maskWidth = maskShape[1];

  // Create output canvas
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = imgWidth;
  outputCanvas.height = imgHeight;
  const outCtx = outputCanvas.getContext("2d");

  // Fill with color
  outCtx.fillStyle = color;
  outCtx.fillRect(0, 0, imgWidth, imgHeight);

  // Draw original image
  outCtx.drawImage(img, 0, 0, imgWidth, imgHeight);

  // Apply mask to composite
  const imageData = outCtx.getImageData(0, 0, imgWidth, imgHeight);
  const data = imageData.data;

  const scaleX = maskWidth / imgWidth;
  const scaleY = maskHeight / imgHeight;

  for (let y = 0; y < imgHeight; y++) {
    for (let x = 0; x < imgWidth; x++) {
      const maskX = Math.floor(x * scaleX);
      const maskY = Math.floor(y * scaleY);
      const maskIndex = maskY * maskWidth + maskX;

      const alpha = maskData[maskIndex];
      const pixelIndex = (y * imgWidth + x) * 4 + 3;

      // Use mask as alpha - subject opaque, background alpha=0
      data[pixelIndex] = alpha < 0.5 ? 0 : 255;
    }
  }

  outCtx.putImageData(imageData, 0, 0);
  const jpgDataUrl = outputCanvas.toDataURL("image/jpeg", 0.95);

  // Cleanup
  img.src = "";
  canvas.width = 0;
  canvas.height = 0;
  outputCanvas.width = 0;
  outputCanvas.height = 0;

  if (imageBitmap && imageBitmap !== canvas) {
    try {
      imageBitmap.close?.();
    } catch {
      // ImageBitmap close might not be available
    }
  }

  return jpgDataUrl;
}

/**
 * Helper to get pixel color at a specific location
 */
function getPixelAt(img, x, y, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, -x, -y, width, height);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return {
    r: data[0],
    g: data[1],
    b: data[2],
    a: data[3]
  };
}
