import axios from "axios";

// Use the Next.js API proxy
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    const response = await axios.get(`${API_URL}/api/users/${userId}`);
    return response.data;
  } catch (error: any) {
    // If user not found, attempt to sync
    if (error.response && error.response.status === 404) {
      try {
        // Attempt to sync user manually
        const syncResponse = await axios.post(
          `${API_URL}/api/users/sync-user`,
          {
            user: { id: userId },
          }
        );
        return syncResponse.data.user;
      } catch (syncError) {
        console.error("Failed to sync user:", syncError);
        throw new Error("Failed to fetch or sync user");
      }
    }
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

    const response = await axios.get(`${API_URL}/api/users`, {
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
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
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
          // Handle file upload
          if (data[key] instanceof File) {
            formData.append(key, data[key]);
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

    const response = await axios.put(
      `${API_URL}/api/users/profile/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

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
      `${API_URL}/api/users/profile/custom`,
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
      `${API_URL}/api/users/type/${userId}`,
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

    const response = await axios.delete(`${API_URL}/api/users/account`, {
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
