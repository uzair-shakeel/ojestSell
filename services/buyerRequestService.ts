import axios from "axios";

// Use the Next.js API proxy
const API_URL = "/api";

export interface BuyerRequest {
  _id: string;
  buyerId: string;
  title: string;
  description: string;
  make?: string;
  model?: string;
  type?: string;
  budgetMin?: number;
  budgetMax: number;
  preferredCondition?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  preferredFeatures?: string[];
  status: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerRequestInput {
  title: string;
  description: string;
  make?: string;
  model?: string;
  type?: string;
  budgetMin?: number;
  budgetMax: number;
  preferredCondition?: string;
  preferredFeatures?: string[];
  location?: {
    coordinates: number[];
  };
}

export interface BuyerRequestsResponse {
  buyerRequests: BuyerRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Create a new buyer request
export const createBuyerRequest = async (
  requestData: BuyerRequestInput,
  getToken: () => Promise<string | null>
): Promise<BuyerRequest> => {
  try {
    const token = await getToken();
    if (!token) {
      console.error("No token available from getToken function");
      throw new Error("No authentication token found");
    }

    console.log("Creating buyer request with data:", requestData);
    console.log("API URL:", API_URL);
    console.log("Token available:", !!token);

    const response = await axios.post(
      `${API_URL}/buyer-requests`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Buyer request created successfully:", response.data);
    return response.data.buyerRequest;
  } catch (error) {
    console.error("Error creating buyer request:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      console.error("Response headers:", error.response?.headers);
    }
    throw error;
  }
};

// Get all buyer requests (for sellers to browse)
export const getAllBuyerRequests = async (
  filters: {
    make?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
    budgetMin?: number;
    budgetMax?: number;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<BuyerRequestsResponse> => {
  try {
    const response = await axios.get(`${API_URL}/buyer-requests`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching buyer requests:", error);
    throw error;
  }
};

// Get buyer requests by user ID (for buyer's dashboard)
export const getMyBuyerRequests = async (
  filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {},
  getToken: () => Promise<string | null>
): Promise<BuyerRequestsResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_URL}/buyer-requests/my-requests`,
      {
        params: filters,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching my buyer request:", error);
    throw error;
  }
};

// Get a single buyer request by ID
export const getBuyerRequestById = async (
  requestId: string
): Promise<BuyerRequest> => {
  try {
    const response = await axios.get(
      `${API_URL}/buyer-requests/${requestId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching buyer request with ID ${requestId}:`, error);
    throw error;
  }
};

// Update a buyer request
export const updateBuyerRequest = async (
  requestId: string,
  updateData: Partial<BuyerRequestInput>,
  getToken: () => Promise<string | null>
): Promise<BuyerRequest> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(
      `${API_URL}/buyer-requests/${requestId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.buyerRequest;
  } catch (error) {
    console.error(`Error updating buyer request with ID ${requestId}:`, error);
    throw error;
  }
};

// Delete/cancel a buyer request
export const deleteBuyerRequest = async (
  requestId: string,
  getToken: () => Promise<string | null>
): Promise<void> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    await axios.delete(`${API_URL}/buyer-requests/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(`Error deleting buyer request with ID ${requestId}:`, error);
    throw error;
  }
};

// Get offers for a specific buyer request
export const getOffersForRequest = async (
  requestId: string,
  getToken: () => Promise<string | null>
): Promise<any[]> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_URL}/buyer-requests/${requestId}/offers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching offers for request with ID ${requestId}:`,
      error
    );
    throw error;
  }
};
