export interface Car {
  id: number;
  name: string;
  images: string[];
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
}

export interface ApiResponse {
  cars: Car[];
  totalCount: number;
  page: number;
  pageSize: number;
}
