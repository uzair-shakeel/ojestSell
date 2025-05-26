import { NextResponse } from "next/server";
import axios from "axios";

const AUTO_DEV_API_BASE_URL = "https://auto.dev/api/vin";
const AUTO_DEV_API_KEY = process.env.AUTO_DEV_API_KEY;

export async function GET(request) {
  try {
    // Get VIN from URL
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get("vin");

    if (!vin || vin.length !== 17) {
      console.error(`Invalid VIN provided: ${vin}`);
      return NextResponse.json(
        { error: "Invalid VIN. Must be 17 characters." },
        { status: 400 }
      );
    }

    console.log(`Looking up VIN: ${vin}`);

    // Call auto.dev API
    const apiUrl = `${AUTO_DEV_API_BASE_URL}/${encodeURIComponent(vin)}`;
    console.log("Calling auto.dev API:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        "X-API-Key": AUTO_DEV_API_KEY,
        Accept: "application/json",
      },
    });

    console.log("auto.dev API Response:", response.data);

    if (response.data) {
      // Map the auto.dev response to our format
      const carDetails = {
        make: response.data.make.name || "",
        model: response.data.model.name || "",
        year: response.data.years[0]?.year || "",
        engine: response.data.engine || response.data.engineSize || "",
        fuel: response.data.engine?.fuelType || "",
        transmission: response.data.transmission.transmissionType || "",
        driveType: response.data.driveType || "",
        vehicleType: response.data.vehicleType || "",
        bodyClass: response.data.categories.primaryBodyType || "",
        manufacturer: response.data.make.name || "",
        vin: vin,
        // Additional details if available
        trim: response.data.trim || "",
        doors: response.data.numOfDoors?.toString() || "",
        horsepower: response.data.engine?.horsepower.toString() || "",
      };

      return NextResponse.json(carDetails);
    }

    return NextResponse.json(
      { error: "No vehicle data found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in VIN lookup route:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle specific error cases
    if (error.response?.status === 401 || error.response?.status === 403) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: "Vehicle not found in database" },
        { status: 404 }
      );
    }

    if (error.response?.status === 400) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details:
            error.response?.data?.message || "Please check the VIN number",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch vehicle data",
        details: error.response?.data?.message || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
