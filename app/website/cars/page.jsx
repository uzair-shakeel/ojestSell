import CarsPageClient from "./CarsPageClient";
import { mapCarsSearchParams, serverSearchCars } from "../../../lib/server/carsApi";

export const revalidate = 30;

export default async function CarsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = mapCarsSearchParams(sp);
  const initialData = await serverSearchCars(filters);
  const cacheKey = JSON.stringify(filters);

  return <CarsPageClient key={cacheKey} initialData={initialData} />;
}
