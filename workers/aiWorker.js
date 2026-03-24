import { pipeline } from "@xenova/transformers";

let model = null;
let loading = false;

async function getModel() {

  if (model) return model;

  if (loading) {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (model) {
          clearInterval(interval);
          resolve(model);
        }
      }, 100);
    });
  }

  loading = true;

  model = await pipeline(
    "image-segmentation",
    "Xenova/modnet",
    { quantized: true }
  );

  loading = false;

  return model;
}

self.onmessage = async (event) => {

  const { id, type, data } = event.data;

  try {

    if (type === "INIT") {

      await getModel();

      self.postMessage({
        id,
        type: "INIT_COMPLETE",
        success: true
      });

      return;
    }

    if (type === "SEGMENT") {

      const model = await getModel();

      const imageData = data.imageData;

      const result = await model(imageData);

      const maskTensor =
        result?.[0]?.mask ??
        result?.masks?.[0];

      if (!maskTensor) {
        throw new Error("Mask tensor missing from model output");
      }

      const maskData = maskTensor.data;
      const maskShape = maskTensor.dims;

      self.postMessage(
        {
          id,
          type: "SEGMENT_COMPLETE",
          success: true,
          data: {
            maskData,
            maskShape
          }
        },
        [maskData.buffer]
      );

    }

  } catch (error) {

    self.postMessage({
      id,
      type: "ERROR",
      success: false,
      error: error.message
    });

  }

};