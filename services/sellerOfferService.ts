import axios from "axios";
import { BuyerRequest } from "./buyerRequestService";

// Use the Next.js API proxy
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export interface SellerOffer {
  _id: string;
  requestId: string | BuyerRequest;
  sellerId: string;
  carId?: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: string;
  expiryDate: string;
  isCustomOffer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOfferInput {
  title: string;
  description: string;
  price: number;
  carId?: string;
  isCustomOffer?: boolean;
}

export interface SellerOffersResponse {
  offers: SellerOffer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AvailableRequestsResponse {
  buyerRequests: BuyerRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Create a new offer for a buyer request
export const createOffer = async (
  requestId: string,
  offerData: SellerOfferInput,
  getToken: () => Promise<string | null>,
  files?: File[]
): Promise<SellerOffer> => {
  try {
    console.log("Creating offer for request:", requestId);
    console.log("Offer data:", offerData);
    console.log("getToken function available:", !!getToken);

    const token = await getToken();
    console.log("Token available:", !!token);

    if (!token) {
      throw new Error("No authentication token found");
    }

    let formData;

    // If there are files, use FormData
    if (files && files.length > 0) {
      formData = new FormData();

      // Append offer data
      Object.entries(offerData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Append files
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Append requestId to formData
      formData.append("requestId", requestId);

      console.log(
        "Sending offer with files to:",
        `${API_URL}/api/seller-offers`
      );
      const response = await axios.post(
        `${API_URL}/api/seller-offers`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.offer;
    } else {
      // No files, use regular JSON
      const dataToSend = {
        ...offerData,
        requestId,
      };

      console.log(
        "Sending offer without files to:",
        `${API_URL}/api/seller-offers`
      );
      const response = await axios.post(
        `${API_URL}/api/seller-offers`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.offer;
    }
  } catch (error) {
    console.error("Error creating seller offer:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw error;
  }
};

// Get all offers made by a seller
export const getMyOffers = async (
  getToken: () => Promise<string | null>,
  filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<SellerOffersResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_URL}/api/seller-offers/my-offers`, {
      params: filters,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching my offers:", error);
    throw error;
  }
};

// Get available buyer requests for sellers
export const getAvailableBuyerRequests = async (
  getToken: () => Promise<string | null>,
  filters: {
    make?: string;
    model?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<AvailableRequestsResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_URL}/api/seller-offers/available-requests`,
      {
        params: filters,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching available buyer requests:", error);
    throw error;
  }
};

// Get a single offer by ID
export const getOfferById = async (
  offerId: string,
  getToken: () => Promise<string | null>
): Promise<SellerOffer> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_URL}/api/seller-offers/${offerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.offer;
  } catch (error) {
    console.error(`Error fetching offer with ID ${offerId}:`, error);
    throw error;
  }
};

// Update an offer
export const updateOffer = async (
  offerId: string,
  updateData: Partial<SellerOfferInput>,
  getToken: () => Promise<string | null>,
  files?: File[]
): Promise<SellerOffer> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    let formData;

    // If there are files, use FormData
    if (files && files.length > 0) {
      formData = new FormData();

      // Append offer data
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Append files
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.put(
        `${API_URL}/api/seller-offers/${offerId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.offer;
    } else {
      // No files, use regular JSON
      const response = await axios.put(
        `${API_URL}/api/seller-offers/${offerId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.offer;
    }
  } catch (error) {
    console.error(`Error updating offer with ID ${offerId}:`, error);
    throw error;
  }
};

// Delete/cancel an offer
export const deleteOffer = async (
  offerId: string,
  getToken: () => Promise<string | null>
): Promise<void> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    await axios.delete(`${API_URL}/api/seller-offers/${offerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(`Error deleting offer with ID ${offerId}:`, error);
    throw error;
  }
};

// Accept an offer (buyer only)
export const acceptOffer = async (
  offerId: string,
  getToken: () => Promise<string | null>
): Promise<void> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    await axios.post(
      `${API_URL}/api/seller-offers/${offerId}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(`Error accepting offer with ID ${offerId}:`, error);
    throw error;
  }
};

// Reject an offer (buyer only)
export const rejectOffer = async (
  offerId: string,
  getToken: () => Promise<string | null>
): Promise<void> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    await axios.post(
      `${API_URL}/api/seller-offers/${offerId}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(`Error rejecting offer with ID ${offerId}:`, error);
    throw error;
  }
};
