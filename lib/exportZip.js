import JSZip from "jszip";

export async function exportZip(results) {
  const zip = new JSZip();

  // Create main results folder
  const resultsFolder = zip.folder("background-removed");

  results.forEach((result, i) => {
    if (result.error) return; // Skip errors

    const fileName = result.fileName || `image_${i}`;
    const baseName = fileName.split(".")[0];

    // Extract base64 data from data URL
    const base64Data = result.dataUrl.split(",")[1];
    resultsFolder.file(`${baseName}_no_bg.png`, base64Data, { base64: true });
  });

  const blob = await zip.generateAsync({ type: "blob" });
  return blob;
}

export function downloadZip(blob, fileName = "background-removed.zip") {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}