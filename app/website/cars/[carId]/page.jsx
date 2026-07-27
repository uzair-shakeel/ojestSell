import { notFound } from "next/navigation";
import CarDetailClient from "./CarDetailClient";
import {
  serverGetCarById,
  serverGetPublicUser,
} from "../../../../lib/server/carsApi";

export const revalidate = 15;

export default async function CarDetailPage({ params }) {
  const { carId } = await params;
  const car = await serverGetCarById(carId);

  if (!car) {
    notFound();
  }

  const seller = car?.createdBy
    ? await serverGetPublicUser(car.createdBy)
    : null;

  return <CarDetailClient key={carId} initialCar={car} initialSeller={seller} />;
}
