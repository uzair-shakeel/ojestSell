import { NextResponse } from "next/server";
import axios from "axios";

const CAR_API_BASE_URL = "https://api.carapi.app/api";
const CAR_API_SECRET =
  process.env.CAR_API_KEY || "3c50aa09d063f9f91759059a99966ff0";

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

    // Call CarAPI with the correct authentication
    const apiUrl = `${CAR_API_BASE_URL}/vehicles/vin/${encodeURIComponent(
      vin
    )}`;
    console.log("Calling CarAPI:", apiUrl);
    console.log("Using API Secret:", CAR_API_SECRET);

    const response = await axios.get(apiUrl, {
      headers: {
        "x-api-key": CAR_API_SECRET,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("CarAPI Response Status:", response.status);
    console.log("CarAPI Response Headers:", response.headers);
    console.log(
      "CarAPI Response Data:",
      JSON.stringify(response.data, null, 2)
    );

    if (response.data) {
      const carData = response.data.data || response.data;

      // Map the CarAPI response to our format
      const carDetails = {
        make: carData.make || carData.make_name || "",
        model: carData.model || carData.model_name || "",
        year: carData.year?.toString() || "",
        engine: carData.engine_displacement || "",
        fuel: carData.fuel_type || "",
        transmission: carData.transmission || "",
        driveType: carData.drive || "",
        vehicleType: carData.vehicle_type || carData.body_type || "",
        bodyClass: carData.body_subtype || "",
        manufacturer: carData.manufacturer || carData.make || "",
        vin: vin,
        // Additional details
        trim: carData.trim || "",
        doors: carData.doors?.toString() || "",
        horsepower: carData.horsepower?.toString() || "",
        torque: carData.torque?.toString() || "",
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
      headers: error.response?.headers,
      config: error.config,
    });

    // Handle specific CarAPI errors
    if (error.response?.status === 401) {
      return NextResponse.json(
        {
          error: "Invalid CarAPI key",
          details: error.response?.data?.message || "Authentication failed",
        },
        { status: 401 }
      );
    }

    if (error.response?.status === 404) {
      return NextResponse.json(
        {
          error: "Vehicle not found in database",
          details: "The provided VIN could not be found in the CarAPI database",
        },
        { status: 404 }
      );
    }

    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: "API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch vehicle data",
        details: error.response?.data?.message || error.message,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}
