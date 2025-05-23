import { NextResponse } from "next/server";
import axios from "axios";

const NHTSA_API_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/decodevin";

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

    // Call NHTSA API
    const nhtsaUrl = `${NHTSA_API_BASE_URL}/${encodeURIComponent(
      vin
    )}?format=json`;
    console.log("Calling NHTSA API:", nhtsaUrl);

    const response = await axios.get(nhtsaUrl);
    console.log("NHTSA API Response:", response.data);

    if (response.data && response.data.Results) {
      // Extract relevant information from the response
      const results = response.data.Results;
      const getValue = (variable) => {
        const item = results.find((r) => r.Variable === variable);
        return item ? item.Value : null;
      };

      // Get error information
      const errorCode = getValue("Error Code");
      const errorText = getValue("Error Text");

      // Even if there are errors, try to extract whatever data we can
      const carDetails = {
        make: getValue("Make") || "",
        model: getValue("Model") || "",
        year: getValue("Model Year") || "",
        engine: getValue("Engine Model") || getValue("Displacement (L)") || "",
        fuel: getValue("Fuel Type - Primary") || "",
        transmission: getValue("Transmission Style") || "",
        driveType: getValue("Drive Type") || "",
        vehicleType: getValue("Vehicle Type") || "",
        bodyClass: getValue("Body Class") || "",
        manufacturer: getValue("Manufacturer Name") || "",
        vin: vin,
        errors: errorText
          ? errorText
              .split(";")
              .map((e) => e.trim())
              .filter((e) => e)
          : [],
      };

      // If we got some useful data despite errors, return it with a warning
      if (
        carDetails.make ||
        carDetails.manufacturer ||
        carDetails.vehicleType
      ) {
        const status = errorCode ? 206 : 200; // 206 Partial Content if there were errors
        return NextResponse.json(
          {
            ...carDetails,
            results,
            warning: errorText || null,
          },
          { status }
        );
      }

      // If no useful data and there are errors, return error response
      if (errorText) {
        return NextResponse.json(
          {
            error: "VIN validation failed",
            details: errorText,
            partialData: carDetails,
          },
          { status: 400 }
        );
      }

      // If no data at all
      return NextResponse.json(
        { error: "No vehicle data found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Invalid response from NHTSA API" },
      { status: 502 }
    );
  } catch (error) {
    console.error("Error in VIN lookup route:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch vehicle data",
        details: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
