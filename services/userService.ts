// frontend/services/userServices.ts
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
  location: [number, number];
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
  location: [number, number];
  image?: File;
}

// Get user by ID
export const getUserById = async (userId: string): Promise<UserData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch user");
  }
};

// Get user profile by ID (public route)
// export const getUserById = async (
//   userId: string,
//   getToken: () => Promise<string | null>
// ): Promise<UserData> => {
//   try {
//     const token = await getToken();
//     if (!token) {
//       throw new Error("No authentication token found");
//     }

//     const response = await axios.get(`${API_BASE_URL}/api/user/${userId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error: any) {
//     throw new Error(error?.response?.data?.message || "User not found");
//   }
// };

// Get all users (admin route)
export const getAllUsers = async (
  getToken: () => Promise<string | null>
): Promise<UserData[]> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_BASE_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch users");
  }
};

// Update user profile
export const updateUser = async (
  data: UpdateUserData,
  getToken: () => Promise<string | null>
): Promise<UserData> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("description", data.description);
    formData.append("companyName", data.companyName);
    formData.append("sellerType", data.sellerType);
    formData.append("socialMedia", JSON.stringify(data.socialMedia));
    formData.append("phoneNumbers", JSON.stringify(data.phoneNumbers));
    formData.append("location", JSON.stringify(data.location));
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await axios.put(`${API_BASE_URL}/api/user/profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Profile update failed");
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

    const response = await axios.delete(`${API_BASE_URL}/api/user/account`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Account deletion failed");
  }
};

// Alias for getUserById to maintain consistency with previous naming
export const fetchUser = getUserById;