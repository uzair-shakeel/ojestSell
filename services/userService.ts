import axios from "axios";

// Use the Next.js API proxy - Fixed to use consistent env var name
const API_URL = "/api";

// Install Axios interceptors for debugging profile update flows (once)
try {
  const w: any = typeof window !== "undefined" ? window : {};
  if (!w.__OJEST_AXIOS_DEBUG_INSTALLED__) {
    axios.interceptors.request.use((config) => {
      try {
        const url = config.url || "";
        const method = (config.method || "").toUpperCase();
        // Log only relevant user endpoints to reduce noise
        if (url.includes("/api/users/")) {
          console.log("[Axios][Request]", {
            method,
            url,
            headers: config.headers,
          });
          // Attempt to log FormData keys for multipart
          if (config.data instanceof FormData) {
            const entries: Record<string, any> = {};
            (config.data as FormData).forEach((v, k) => {
              entries[k] =
                v instanceof File
                  ? { name: v.name, type: v.type, size: v.size }
                  : v;
            });
            console.log("[Axios][Request][FormData]", entries);
          } else if (config.data) {
            console.log("[Axios][Request][Data]", config.data);
          }
        }
      } catch (e) {
        console.warn("[Axios][Request] logging failed:", e);
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => {
        try {
          const url = response.config?.url || "";
          if (url.includes("/api/users/")) {
            console.log("[Axios][Response]", {
              url,
              status: response.status,
              data: response.data,
            });
          }
        } catch (e) {
          console.warn("[Axios][Response] logging failed:", e);
        }
        return response;
      },
      (error) => {
        try {
          const url = error.config?.url || "";
          if (url.includes("/api/users/")) {
            console.error("[Axios][Response][Error]", {
              url,
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            });
          }
        } catch (e) {
          console.warn("[Axios][Response][Error] logging failed:", e);
        }
        return Promise.reject(error);
      }
    );

    w.__OJEST_AXIOS_DEBUG_INSTALLED__ = true;
  }
} catch {}

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

// Get user by ID (requires authentication)
// NOTE: This function can only access the authenticated user's own profile
// For getting public information about other users (e.g., seller info in car listings),
// use getPublicUserInfo() instead.
export const getUserById = async (
  userId: string,
  getToken?: () => string | null | Promise<string | null>
): Promise<UserData> => {
  try {
    console.log("Fetching user with ID:", userId);
    console.log("API URL:", API_URL);

    let headers: Record<string, string> = {};
    if (getToken) {
      const token =
        typeof getToken === "function" ? await getToken() : getToken;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers,
    });
    console.log("User data received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    // Provide helpful error message for 403 errors
    if (error.response?.status === 403) {
      throw new Error(
        "Access denied. You can only access your own profile. For public user information, use getPublicUserInfo() instead."
      );
    }

    throw new Error(error?.response?.data?.message || "Failed to fetch user");
  }
};

// Get public user information (no authentication required)
export const getPublicUserInfo = async (userId: string): Promise<any> => {
  try {
    console.log("Fetching public user info for ID:", userId);
    console.log("API URL:", API_URL);

    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = await axios.get(`${API_URL}/users/public/${userId}`);
    console.log("Public user data received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching public user info:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      userId: userId,
    });

    // Provide more specific error messages
    if (error.response?.status === 404) {
      throw new Error(`User with ID ${userId} not found`);
    } else if (error.response?.status === 500) {
      throw new Error("Server error while fetching user information");
    } else if (!error.response) {
      throw new Error("Network error - could not connect to server");
    }

    throw new Error(
      error?.response?.data?.message || "Failed to fetch public user info"
    );
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

    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch users");
  }
};

// Update user profile
export const updateUser = async (
  data: {
    firstName?: string;
    lastName?: string;
    description?: string;
    companyName?: string;
    email?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      website?: string;
      linkedin?: string;
    };
    sellerType?: "private" | "company";
    phoneNumbers?: string[];
    location?: {
      type: string;
      coordinates: number[];
    };
    image?: File | string;
    brands?: string[]; // Add brands to the type definition
  },
  getToken: () => string | null | Promise<string | null>
) => {
  try {
    const token = typeof getToken === "function" ? await getToken() : getToken;
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Raw input data:", JSON.stringify(data, null, 2));

    // Create a FormData object
    const formData = new FormData();

    // Modify the appendData function
    const appendData = (key: string, value: any) => {
      if (value !== undefined && value !== null) {
        // If it's an array, append each item separately
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        }
        // If it's an object, stringify it
        else if (typeof value === "object" && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    };

    // Append all fields
    Object.keys(data).forEach((key) => {
      switch (key) {
        case "phoneNumbers":
          // Ensure phone numbers are an array of strings
          if (Array.isArray(data[key])) {
            data[key].forEach((phone: any, index: number) => {
              // If phone is an object with phone property, use that
              const phoneValue =
                typeof phone === "object" ? phone.phone : phone;
              appendData(`phoneNumbers[${index}]`, phoneValue);
            });
          }
          break;
        case "socialMedia":
          // Append each social media field
          Object.keys(data[key]).forEach((socialKey) => {
            appendData(`socialMedia[${socialKey}]`, data[key][socialKey]);
          });
          break;
        case "location":
          // Stringify location
          appendData(key, JSON.stringify(data[key]));
          break;
        case "image":
          // Handle file upload - backend expects field name 'image'
          if (data[key] instanceof File) {
            formData.append("image", data[key]);
          }
          break;
        default:
          // Append other fields directly
          appendData(key, data[key]);
      }
    });

    // Log FormData contents
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axios.put(`${API_URL}/users/profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Server response:", JSON.stringify(response.data, null, 2));
    return response.data; // Return the updated user data
  } catch (error) {
    console.error("Error updating user:", error);

    // More detailed error logging
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
      });

      // Throw a more informative error
      throw new Error(
        error.response?.data?.details?.join(", ") ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to update profile"
      );
    }

    throw error; // Re-throw other types of errors
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

    const response = await axios.put(
      `${API_URL}/users/profile/custom`,
      formDataToSend,
      config
    );
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
      `${API_URL}/users/type/${userId}`,
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
    throw new Error(
      error?.response?.data?.message || "Failed to update seller type"
    );
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

    const response = await axios.delete(`${API_URL}/users/account`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Account deletion failed"
    );
  }
};

// Alias for getUserById to maintain consistency with previous naming
export const fetchUser = getUserById;
