// Background removal utility using @imgly/background-removal

/**
 * Removes the background from an image using @imgly/background-removal
 *
 * @param {string} imageUrl - URL or data URL of the image
 * @param {Object} options - Options for background removal
 * @param {Function} options.onProgress - Progress callback function
 * @returns {Promise<Blob>} - Promise resolving to the processed image blob
 */
export async function removeImageBackground(imageUrl, options = {}) {
  try {
    // Import the module
    const bgRemoval = await import("@imgly/background-removal");

    // Log what we got
    console.log("Background removal module imported:", bgRemoval);
    console.log("Available exports:", Object.keys(bgRemoval));

    // Determine which function to use
    let removeFunction;

    if (typeof bgRemoval.removeBackground === "function") {
      console.log("Using removeBackground export");
      removeFunction = bgRemoval.removeBackground;
    } else if (typeof bgRemoval.default === "function") {
      console.log("Using default export");
      removeFunction = bgRemoval.default;
    } else {
      throw new Error("Could not find a valid background removal function");
    }

    // Process the image
    const result = await removeFunction(imageUrl, {
      progress: (progress) => {
        console.log(
          `Background removal progress: ${Math.round(progress * 100)}%`
        );
        if (options.onProgress) {
          options.onProgress(progress);
        }
      },
      model: "medium", // Use medium quality model for better balance
      output: {
        format: "image/png",
        quality: 0.8,
      },
    });

    return result;
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
