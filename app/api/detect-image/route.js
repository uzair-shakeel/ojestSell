import { NextResponse } from "next/server";

const API_BASE_URL = "https://photo-detect-api-lxbhx.ondigitalocean.app";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Check if we have an image file or image URL
    const imageFile = formData.get("image");
    const imageUrl = formData.get("image_url");

    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Create new FormData for the external API
    const apiFormData = new FormData();

    if (imageFile) {
      // If we have a file, use it directly
      apiFormData.append("image", imageFile);
    } else if (imageUrl) {
      // If we have a URL, fetch it and convert to blob
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        const blob = await imageResponse.blob();
        const filename = imageUrl.split("/").pop() || "image.jpg";
        apiFormData.append("image", blob, filename);
      } catch (fetchError) {
        return NextResponse.json(
          { error: `Failed to fetch image from URL: ${fetchError.message}` },
          { status: 400 }
        );
      }
    }

    // Forward to the detection API
    const response = await fetch(`${API_BASE_URL}/api/detect`, {
      method: "POST",
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Detection API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in detect-image route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image detection" },
      { status: 500 }
    );
  }
}

