// frontend/services/carService.ts
import axios from "axios";

// Define the API base URL directly in this file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Interface for the Car data as returned by the backend
interface CarData {
  _id: string;
  title: string;
  description: string;
  images: string[];
  make: string;
  model: string;
  trim?: string;
  type: string;
  year?: string;
  color?: string;
  condition: "New" | "Used";
  mileage?: string;
  drivetrain?: "FWD" | "RWD" | "AWD" | "4WD" | "2WD";
  transmission?: "Manual" | "Automatic" | "Semi-Automatic";
  fuel?: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  engine?: string;
  horsepower?: string;
  accidentHistory?: "Yes" | "No";
  serviceHistory?: "Yes" | "No";
  vin?: string;
  country?: string;
  carCondition?: {
    interior?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
    mechanical?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
    paintandBody?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
    frameandUnderbody?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
    overall?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
  };
  financialInfo: {
    sellOptions: ("Long term rental" | "Financing" | "Lease" | "Cash")[];
    invoiceOptions: ("Invoice" | "Selling Agreement" | "Invoice VAT")[];
    sellerType: "private" | "company";
    priceNetto: number;
    priceWithVat?: number;
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  status: "Pending" | "Approved" | "Rejected";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for adding/updating a car (used for documentation)
interface AddCarData {
  title: string;
  description: string;
  images: File[];
  make: string;
  model: string;
  trim?: string;
  type: string;
  year?: string;
  color?: string;
  condition: "New" | "Used";
  mileage?: string;
  drivetrain?: "FWD" | "RWD" | "AWD" | "4WD" | "2WD";
  transmission?: "Manual" | "Automatic" | "Semi-Automatic";
  fuel?: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  engine?: string;
  horsepower?: string;
  accidentHistory?: "Yes" | "No";
  serviceHistory?: "Yes" | "No";
  vin?: string;
  country?: string;
  carCondition?: {
    interior?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
    mechanical?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
    paintandBody?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
    frameandUnderbody?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
    overall?: "New" | "Very Good" | "Good" | "Normal" | "Bad";
  };
  financialInfo: {
    sellOptions: ("Long term rental" | "Financing" | "Lease" | "Cash")[];
    invoiceOptions: ("Invoice" | "Selling Agreement" | "Invoice VAT")[];
    sellerType: "private" | "company";
    priceNetto: number;
  };
}

// Add a new car
export const addCar = async (
  carData: FormData,
  getToken: () => Promise<string | null>
): Promise<AddCarData> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(`${API_BASE_URL}/api/cars/`, carData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to add car");
  }
};

// Get all cars (public route, no token required)
export const getAllCars = async (): Promise<CarData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cars`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch cars");
  }
};

// Get car by ID
export const getCarById = async (carId: string): Promise<CarData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cars/${carId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch car");
  }
};

// Update a car
export const updateCar = async (
  carId: string,
  carData: FormData,
  getToken: () => Promise<string | null>
): Promise<CarData> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(
      `${API_BASE_URL}/api/cars/${carId}`,
      carData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update car");
  }
};

// Delete a car
export const deleteCar = async (
  carId: string,
  getToken: () => Promise<string | null>
): Promise<{ message: string }> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.delete(`${API_BASE_URL}/api/cars/${carId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete car");
  }
};

// Update car status (e.g., 'Pending', 'Approved', 'Rejected')
export const updateCarStatus = async (
  carId: string,
  status: "Pending" | "Approved" | "Rejected",
  getToken: () => Promise<string | null>
): Promise<CarData> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(
      `${API_BASE_URL}/api/cars/status/${carId}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update car status"
    );
  }
};

// Search cars with filters
export const searchCars = async (queryParams: {
  make?: string;
  model?: string;
  yearFrom?: string;
  yearTo?: string;
  type?: string;
  condition?: "New" | "Used";
  mileageMin?: number;
  mileageMax?: number;
  drivetrain?: "FWD" | "RWD" | "AWD" | "4WD" | "2WD";
  transmission?: "Manual" | "Automatic" | "Semi-Automatic";
  fuel?: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  engine?: string;
  serviceHistory?: "Yes" | "No";
  accidentHistory?: "Yes" | "No";
  location?: [number, number]; // [longitude, latitude]
  radius?: number; // in kilometers
}): Promise<CarData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cars/search`, {
      params: queryParams,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to search cars");
  }
};

// Get cars by user ID (for user's own cars)
export const getCarsByUserId = async (
  userId: string,
  getToken: () => Promise<string | null>
): Promise<CarData[]> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/cars/my-cars/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch cars by user"
    );
  }
};

// Get recommended cars
export const getRecommendedCars = async (carId: string): Promise<CarData[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/cars/recommended/${carId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch recommended cars"
    );
  }
};

// Get car details from VIN using vindecoder.eu API
export const getCarDetailsByVin = async (
  vin: string,
  getToken: () => Promise<string | null>
): Promise<{
  make?: string;
  model?: string;
  year?: string;
  engine?: string;
  fuel?: string;
  transmission?: string;
  driveType?: string;
  bodyClass?: string;
  vin: string;
  manufacturer?: string;
  trim?: string;
  horsepower?: string;
  engineDetails?: string;
}> => {
  try {
    console.log(`Fetching car details for VIN: ${vin}`);
    const apiUrl = `/api/vin-lookup?vin=${encodeURIComponent(vin)}`;
    console.log(`Making request to: ${apiUrl}`);

    const response = await axios.get(apiUrl);
    console.log("VIN lookup response:", response.data);

    if (!response.data) {
      throw new Error("No vehicle data found");
    }

    return response.data;
  } catch (error: any) {
    console.error("VIN lookup error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response?.status === 404) {
      throw new Error("Vehicle not found");
    }

    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to fetch car details by VIN"
    );
  }
};
