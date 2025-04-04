export interface Car {
  id: number;
  name: string;
  images?: string[];
  price: number;
  rating?: number;
  reviews?: number;
  seats?: number;
  transmission: string;
  fuel: string;
  year: number;
  mileage: number;
  engineSize: string;
  description?: string;
  location?: string;
  dealer?: {
    name?: string;
    logo?: string;
  };
  // Additional fields that might come from an API
  [key: string]: any;
}

export interface ApiResponse {
  cars: Car[];
  totalCount: number;
  page: number;
  pageSize: number;
  // Allow for additional fields from the API response
  [key: string]: any;
}
