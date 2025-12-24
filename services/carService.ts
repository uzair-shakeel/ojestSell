// frontend/services/carService.ts
import axios from "axios";

// Define the API base URL - prefer same-origin, else use NEXT_PUBLIC_API_BASE_URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
// If API_BASE is empty, use relative /api. If it has /api at the end, don't double it.
const API_BASE_URL = API_BASE
  ? (API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`)
  : "/api";

console.log("Using API URL:", API_BASE_URL);

// Backend base for admin endpoints (bypass Next API if no proxies exist)
const BACKEND_BASE = API_BASE_URL;

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
  countryOfManufacturer?: string;
  isFeatured?: boolean;
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
  warranties?: {
    years?: number;
    mileageLimit?: number;
    extraPrice?: number;
    description?: string;
  }[];
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
  countryOfManufacturer?: string;
  isFeatured?: boolean;
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
  warranties?: {
    years?: number;
    mileageLimit?: number;
    extraPrice?: number;
    description?: string;
  }[];
}



// Upload a batch of images and return their URLs
export const uploadImageBatch = async (
  images: File[],
  onProgress?: (progress: number) => void,
  getToken?: () => Promise<string | null>
): Promise<{ success: boolean; urls: string[]; errors: any[] }> => {
  try {
    const token = getToken ? await getToken() : null;
    if (!token) throw new Error("No authentication token found");

    const formData = new FormData();
    images.forEach((file) => formData.append("images", file));

    const response = await axios.post(`${API_BASE_URL}/cars/upload-images`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return {
      success: true,
      urls: response.data.urls || [],
      errors: [],
    };
  } catch (error: any) {
    console.error("Batch upload failed:", error);
    return {
      success: false,
      urls: [],
      errors: [error.message || "Upload failed"],
    };
  }
};

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
    // Primary attempt: Next proxy or same-origin API
    try {
      const response = await axios.post(`${API_BASE_URL}/cars`, carData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (primaryError: any) {
      // Log details and try backend fallback
      console.error("addCar primary endpoint failed", {
        url: `${API_BASE_URL}/cars`,
        status: primaryError?.response?.status,
        data: primaryError?.response?.data,
        message: primaryError?.message,
      });
      try {
        const fb = await axios.post(`${BACKEND_BASE}/cars`, carData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        return fb.data;
      } catch (fallbackError: any) {
        console.error("addCar backend fallback failed", {
          url: `${BACKEND_BASE}/cars`,
          status: fallbackError?.response?.status,
          data: fallbackError?.response?.data,
          message: fallbackError?.message,
        });
        // Prefer server message if provided
        const serverMsg =
          fallbackError?.response?.data?.message ||
          primaryError?.response?.data?.message;
        throw new Error(serverMsg || "Server error");
      }
    }
  } catch (error: any) {
    // Last resort error path
    throw new Error(
      error?.response?.data?.message || error?.message || "Failed to add car"
    );
  }
};

// Get all cars (public route, no token required)
export const getAllCars = async (): Promise<CarData[]> => {
  const maxRetries = 3;
  let retryCount = 0;

  const tryFetch = async (): Promise<CarData[]> => {
    try {
      console.log(
        `Attempt ${retryCount + 1} to fetch cars from:`,
        `${API_BASE_URL}/cars`
      );

      const response = await axios.get(`${API_BASE_URL}/cars`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      });

      if (!response.data) {
        throw new Error("No data received from API");
      }

      // Handle both array and object responses
      const cars = Array.isArray(response.data)
        ? response.data
        : response.data.cars || [];

      if (!Array.isArray(cars)) {
        throw new Error("Invalid data format received from API");
      }

      return cars;
    } catch (error: any) {
      // Enhanced error logging
      const errorDetails = {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: `${API_BASE_URL}/cars`,
        isAxiosError: axios.isAxiosError(error),
        isNetworkError: error.message === "Network Error",
        attempt: retryCount + 1,
      };

      console.error("getAllCars error details:", errorDetails);

      // If we haven't reached max retries, try again
      if (
        retryCount < maxRetries - 1 &&
        (error.message === "Network Error" || error.code === "ECONNABORTED")
      ) {
        retryCount++;
        // Add exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
        return tryFetch();
      }

      if (error.message === "Network Error") {
        throw new Error(
          `Unable to connect to the API at ${API_BASE_URL}. Please check if the API is running and accessible.`
        );
      }

      throw new Error(
        error?.response?.data?.message ||
        `Failed to fetch cars: ${error.message}`
      );
    }
  };

  return tryFetch();
};

// Get car by ID
export const getCarById = async (carId: string): Promise<CarData> => {
  try {
    console.log(
      `Calling API: ${API_BASE_URL}/cars/${carId} with carId:`,
      carId
    ); // Debug log
    const response = await axios.get(`${API_BASE_URL}/cars/${carId}`);
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

    const response = await axios.put(`${API_BASE_URL}/cars/${carId}`, carData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
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

    const response = await axios.delete(`${API_BASE_URL}/cars/${carId}`, {
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
      `${API_BASE_URL}/cars/status/${carId}`,
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
  countryOfManufacturer?: string;
  location?: [number, number]; // [longitude, latitude]
  radius?: number; // in kilometers
}): Promise<CarData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cars/search`, {
      params: queryParams,
    });
    // Handle both array and object responses
    const cars = Array.isArray(response.data)
      ? response.data
      : response.data.cars || [];

    return cars;
  } catch (error: any) {
    console.error("searchCars error:", error);
    throw new Error(error?.response?.data?.message || "Failed to search cars");
  }
};

// Get cars by user ID (for user's own cars)
export const getCarsByUserId = async (
  userId: string,
  getToken: () => Promise<string | null>
): Promise<CarData[]> => {
  try {
    console.log("Getting cars for authenticated user");
    console.log("getToken function available:", !!getToken);

    const token = await getToken();
    console.log("Token available:", !!token);

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_BASE_URL}/cars/my-cars/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Cars response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user cars:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw new Error(
      error?.response?.data?.message || "Failed to fetch user cars"
    );
  }
};

// Get recommended cars
export const getRecommendedCars = async (carId: string): Promise<CarData[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/cars/recommended/${carId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch recommended cars"
    );
  }
};

// Get featured cars
export const getFeaturedCars = async (): Promise<CarData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cars/featured`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch featured cars"
    );
  }
};

// =================== Admin helpers ===================
export const getAdminCars = async (params: {
  page?: number;
  limit?: number;
  make?: string;
  model?: string;
  status?: string;
  search?: string;
} = {}): Promise<{
  cars: any[];
  currentPage: number;
  totalPages: number;
  totalCars: number;
  hasNext: boolean;
  hasPrev: boolean;
}> => {
  try {
    const res = await axios.get(`${BACKEND_BASE}/cars/admin/all`, { params });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to load admin cars");
  }
};

export const setAdminCarStatus = async (
  carId: string,
  status: "Pending" | "Approved" | "Rejected",
  getToken?: () => Promise<string | null>
): Promise<any> => {
  try {
    const headers: any = {};
    if (getToken) {
      const token = await getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await axios.patch(
      `${BACKEND_BASE}/cars/admin/${carId}/status`,
      { status },
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update car status");
  }
};

export const deleteAdminCar = async (
  carId: string,
  getToken?: () => Promise<string | null>
): Promise<any> => {
  try {
    const headers: any = {};
    if (getToken) {
      const token = await getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await axios.delete(`${BACKEND_BASE}/cars/admin/${carId}`, { headers });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete car");
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
