import { NextResponse } from "next/server";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (typeof file.size === "number" && file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const apiFormData = new FormData();
    apiFormData.append("file", file);

    const apiUrl = process.env.BLUR_PLATE_API_URL;
    if (!apiUrl || !/^https:\/\//i.test(apiUrl)) {
      return NextResponse.json(
        { error: "Blur service is not configured" },
        { status: 503 }
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[blur-plate] API error:", errorText.slice(0, 200));
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.image_base64 && !data.processed_image) {
      return NextResponse.json(
        {
          error: "No blur applied - API returned no processed image",
          processed_image: null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[blur-plate] Error in API route:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to blur number plate" },
      { status: 500 }
    );
  }
}
