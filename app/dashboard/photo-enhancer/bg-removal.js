// Background removal utility with fallback implementation

/**
 * Removes the background from an image using fallback method
 * Note: @imgly/background-removal dependency has been removed for performance
 *
 * @param {string} imageUrl - URL or data URL of the image
 * @param {Object} options - Options for background removal
 * @param {Function} options.onProgress - Progress callback function
 * @returns {Promise<Blob>} - Promise resolving to the processed image blob
 */
export async function removeImageBackground(imageUrl, options = {}) {
  try {
    // Create an image element from the URL
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Use fallback method since @imgly/background-removal is removed
    return removeBackgroundFallback(img);
  } catch (error) {
    console.error("Error in removeImageBackground:", error);
    throw error;
  }
}

/**
 * Fallback background removal using simple color detection
 *
 * @param {HTMLImageElement} imageElement - The image element to process
 * @returns {Promise<Blob>} - Promise resolving to the processed image blob
 */
export async function removeBackgroundFallback(imageElement) {
  if (!imageElement) {
    throw new Error("Image element is required");
  }

  // Create a canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas dimensions to match the image
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;

  // Draw the image onto the canvas
  ctx.drawImage(imageElement, 0, 0);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simple chroma key approach - remove green/blue backgrounds
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is likely to be background
    if ((g > r * 1.2 && g > b * 1.2) || (b > r * 1.2 && b > g * 1.2)) {
      // Make pixel transparent
      data[i + 3] = 0;
    }
  }

  // Put the modified image data back on the canvas
  ctx.putImageData(imageData, 0, 0);

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}
