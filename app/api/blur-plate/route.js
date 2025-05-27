import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create a new FormData to send to the external API
    const apiFormData = new FormData();
    apiFormData.append("file", file);

    // Make the request to the external API
    const response = await fetch("http://209.38.211.146/obscure-plates-info", {
      method: "POST",
      body: apiFormData,
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Return the response from the API
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in blur-plate API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to blur number plate" },
      { status: 500 }
    );
  }
}
