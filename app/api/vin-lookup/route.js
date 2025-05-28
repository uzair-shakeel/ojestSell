import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";

const API_PREFIX = "https://api.vindecoder.eu/3.2";
const API_KEY = process.env.VIN_DECODER_API_KEY;
const SECRET_KEY = process.env.VIN_DECODER_SECRET_KEY;

// Helper function to map transmission types
const mapTransmission = (value) => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("manual") || lower.includes("standard")) return "Manual";
  if (lower.includes("automatic")) return "Automatic";
  if (lower.includes("semi")) return "Semi-Automatic";
  return "";
};

// Helper function to map fuel types
const mapFuelType = (value) => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("gasoline")) return "Petrol";
  if (lower.includes("diesel")) return "Diesel";
  if (lower.includes("hybrid")) return "Hybrid";
  if (lower.includes("electric")) return "Electric";
  return "";
};

// Helper function to map drive types
const mapDriveType = (value) => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("front-wheel")) return "FWD";
  if (lower.includes("rear-wheel")) return "RWD";
  if (lower.includes("all-wheel") || lower.includes("all wheel")) return "AWD";
  if (lower.includes("4x4") || lower === "4wd") return "4WD";
  if (lower.includes("2wd")) return "2WD";
  return "";
};

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

    if (!API_KEY || !SECRET_KEY) {
      console.error("Missing API credentials");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    console.log(`Looking up VIN: ${vin}`);

    // Generate controlSum using Node's crypto
    const id = "decode";
    const stringToHash = `${vin}|${id}|${API_KEY}|${SECRET_KEY}`;
    const hash = crypto.createHash("sha1").update(stringToHash).digest("hex");
    const controlSum = hash.substring(0, 10);

    // Make API request
    const url = `${API_PREFIX}/${API_KEY}/${controlSum}/decode/${vin}.json`;
    console.log("Calling VIN decoder API:", url);

    const response = await axios.get(url);
    console.log("VIN decoder API Response:", response.data);

    if (response.data && response.data.decode) {
      const data = response.data.decode;

      // Helper function to find value by label
      const getValue = (label) => {
        const item = data.find((item) => item.label === label);
        return item ? item.value : "";
      };

      // Map the API response to our format
      const carDetails = {
        make: getValue("Make"),
        model: getValue("Model"),
        year: getValue("Model Year")?.toString(),
        engine: getValue("Engine Displacement (ccm)")?.toString(),
        fuel: mapFuelType(getValue("Fuel Type - Primary")),
        transmission: mapTransmission(getValue("Transmission")),
        driveType: mapDriveType(getValue("Drive")),
        bodyClass: getValue("Body"),
        vin: getValue("VIN"),
        manufacturer: getValue("Manufacturer"),
        trim: getValue("Series"),
        horsepower: getValue("Engine Power (HP)")?.toString(),
        engineDetails: getValue("Engine (full)"),
        color: "", // Not provided by API
        mileage: "", // Not provided by API
        country: getValue("Plant Country"),
        accidentHistory: "", // Not provided by API
        serviceHistory: "", // Not provided by API
        type: getValue("Body"), // Using Body as type
        // Additional technical details
        engineCode: getValue("Engine Code"),
        engineCylinders: getValue("Engine Cylinders")?.toString(),
        enginePosition: getValue("Engine Position"),
        engineTorque: getValue("Engine Torque (RPM)")?.toString(),
        fuelCapacity: getValue("Fuel Capacity (l)")?.toString(),
        fuelConsumption: getValue(
          "Fuel Consumption Combined (l/100km)"
        )?.toString(),
        transmission_gears: getValue("Number of Gears")?.toString(),
        weight: getValue("Weight Empty (kg)")?.toString(),
        maxSpeed: getValue("Max Speed (km/h)")?.toString(),
        acceleration: getValue("Acceleration 0-100 km/h (s)")?.toString(),
      };

      return NextResponse.json(carDetails, { status: 200 });
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

    // Handle specific API errors
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API credentials" },
        { status: 401 }
      );
    }

    if (error.response?.status === 402) {
      return NextResponse.json(
        { error: "API quota exceeded" },
        { status: 402 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch vehicle data",
        details: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
