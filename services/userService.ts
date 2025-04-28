import axios from "axios";

// Define the API base URL directly in this file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface UserData {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  sellerType: "private" | "company";
  role: "user" | "admin";
  phoneNumbers: string[];
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    website: string;
    linkedin: string;
  };
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  description: string;
  companyName: string;
  blocked: boolean;
}

interface UpdateUserData {
  firstName: string;
  lastName: string;
  description: string;
  companyName: string;
  sellerType: "private" | "company";
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    website: string;
    linkedin: string;
  };
  phoneNumbers: string[];
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  image?: string;
}

// Get user by clerk ID (public route, no token required)
export const getUserById = async (userId: string): Promise<UserData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch user");
  }
};

// Get all users (admin route)
export const getAllUsers = async (
  getToken: () => Promise<string | null>
): Promise<UserData[]> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch users");
  }
};

// Update user profile
export const updateUser = async (formData: any, getToken: () => Promise<string | null>) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const updatedLocation = {
      type: "Point",
      coordinates: [formData.location.coordinates[0], formData.location.coordinates[1]], // [lng, lat]
    };

    const data = new FormData();
    for (const key in formData) {
      if (key === "socialMedia") {
        for (const socialKey in formData.socialMedia) {
          data.append(`socialMedia[${socialKey}]`, formData.socialMedia[socialKey] || "");
        }
      } else if (key === "phoneNumbers") {
        formData.phoneNumbers.forEach((phoneNumber, index) => {
          data.append(`phoneNumbers[${index}]`, phoneNumber.phone || "");
        });
      } else if (key === "location") {
        data.append("location", JSON.stringify(updatedLocation));
      } else if (key === "image") {
        if (formData.image) {
          data.append("image", formData.image);
        }
      } else {
        data.append(key, formData[key] || "");
      }
    }

    const response = await axios.put(`${API_BASE_URL}/api/users/profile/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // Return the updated user data
  } catch (error) {
    console.error("Error updating user:", error);
    throw error; // Re-throw the error to be handled in the calling component
  }
};

// Update user profile (for SellerDetailsPage)
export const updateUserCustom = async (formData, getToken) => {
  try {
    const token = await getToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === "image" && formData[key]) {
        formDataToSend.append("image", formData[key]);
      } else if (typeof formData[key] === "object" && formData[key] !== null) {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    }

    const response = await axios.put(`${API_BASE_URL}/api/users/profile/custom`, formDataToSend, config);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Update seller type for a user
export const updateUserSellerType = async (
  userId: string,
  sellerType: "private" | "company",
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.patch(
      `${API_BASE_URL}/api/users/type/${userId}`,
      { sellerType }, // Payload
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Explicitly set Content-Type
        },
      } // Config
    );
    return response.data;
  } catch (error: any) {
    console.error("Update Seller Type Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error?.response?.data?.message || "Failed to update seller type");
  }
};

// Delete user account
export const deleteUserAccount = async (
  getToken: () => Promise<string | null>
): Promise<{ message: string }> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.delete(`${API_BASE_URL}/api/users/account`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Account deletion failed");
  }
};

// Alias for getUserById to maintain consistency with previous naming
export const fetchUser = getUserById;
