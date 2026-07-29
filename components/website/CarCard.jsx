"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getGeocodingData } from "../../lib/geocode";
import { optimizeCloudinaryUrl } from "../../lib/imageUtils";
import { useCarImageTransition } from "../../lib/carImageTransition/CarImageTransitionContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export default function CarCard({ car, viewMode = "grid" }) {
  const href = `/website/cars/${car._id}`;
  const router = useRouter();
  const { startTransition } = useCarImageTransition();
  const imageWrapRef = useRef(null);
  const [locationDetails, setLocationDetails] = useState({
    city: car?.city || car?.location?.city || "",
    state: car?.location?.state || "",
  });

  const translateFuelType = (fuel) => {
    const translations = {
      Petrol: "Benzyna",
      Diesel: "Diesel",
      Hybrid: "Hybryda",
      Electric: "Elektryk",
      LPG: "LPG",
      Wodór: "Wodór",
    };
    return translations[fuel] || fuel;
  };

  const toTitleCase = (text) =>
    text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const translateTransmission = (transmission) => {
    const translations = {
      Automatic: "Automat",
      Manual: "Manual",
    };
    return translations[transmission] || transmission;
  };

  const formatCarImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500";
    let finalUrl;
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
      finalUrl = imagePath;
    } else {
      finalUrl = `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
    }
    return optimizeCloudinaryUrl(finalUrl, 800);
  };

  useEffect(() => {
    const existingCity = car?.city || car?.location?.city;
    if (existingCity) {
      setLocationDetails({
        city: existingCity,
        state: car?.location?.state || "",
      });
      return;
    }

    if (!car?.location?.coordinates) return;

    let cancelled = false;
    const [longitude, latitude] = car.location.coordinates;

    getGeocodingData(latitude, longitude).then((details) => {
      if (!cancelled) setLocationDetails(details);
    });

    return () => {
      cancelled = true;
    };
  }, [car?._id, car?.city, car?.location?.city, car?.location?.coordinates]);

  const firstImage =
    car?.images && car?.images?.length > 0
      ? formatCarImage(car.images[0])
      : "https://via.placeholder.com/500";

  const handleNavigate = useCallback(
    (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      // Morph from the exact collage tile under the click (not the full card frame)
      const started = startTransition({
        carId: car._id,
        href,
        imageSrc: firstImage,
        sourceEl: imageWrapRef.current,
        clientX: event.clientX,
        clientY: event.clientY,
      });

      if (!started) return;

      event.preventDefault();
      router.push(href);
    },
    [car?._id, firstImage, href, router, startTransition]
  );

  if (viewMode === "grid") {
    return (
      <Link
        href={href}
        prefetch={true}
        data-skip-nav-overlay
        onClick={handleNavigate}
        className="group cursor-pointer focus:outline-none block"
      >
        <div className="mx-2 bg-transparent rounded-2xl overflow-hidden relative transition-all duration-300">
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300 z-10 pointer-events-none rounded-2xl" />
          <div
            ref={imageWrapRef}
            className="relative h-[260px] md:h-48 lg:h-[220px] overflow-hidden rounded-2xl [&_[data-car-morph-source]]:opacity-0"
          >
            {car?.isFeatured && (car?.images?.length ?? 0) >= 3 ? (
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                <div data-car-tile className="relative col-span-2 row-span-1">
                  <Image
                    src={formatCarImage(car.images[0])}
                    alt={`${car.year} ${car.make} ${car.model} - 1`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div data-car-tile className="relative col-start-1 col-end-2 row-start-2 row-end-3">
                  <Image
                    src={formatCarImage(car.images[1])}
                    alt={`${car.year} ${car.make} ${car.model} - 2`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div data-car-tile className="relative col-start-2 col-end-3 row-start-2 row-end-3">
                  {(car?.images?.length ?? 0) >= 4 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 h-full">
                      <div data-car-tile className="relative min-h-0">
                        <Image
                          src={formatCarImage(car.images[2])}
                          alt={`${car.year} ${car.make} ${car.model} - 3`}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <div data-car-tile className="relative min-h-0 hidden md:block">
                        <Image
                          src={formatCarImage(car.images[3])}
                          alt={`${car.year} ${car.make} ${car.model} - 4`}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="25vw"
                        />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={formatCarImage(car.images[2])}
                      alt={`${car.year} ${car.make} ${car.model} - 3`}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div data-car-tile className="absolute inset-0">
                <Image
                  src={firstImage}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  className="object-cover transition-transform duration-500"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/10">
              <div className="text-sm font-semibold  text-white">
                {car.financialInfo?.priceNetto
                  ? `${car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł`
                  : "Cena do negocjacji"}
              </div>
            </div>

            {car?.isFeatured && (
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/30 to-transparent pointer-events-none z-20 flex items-start justify-end p-3 rounded-tr-2xl">
                <Image
                  src="/logooo.png"
                  alt="Premium"
                  width={32}
                  height={32}
                  className="object-contain brightness-0 invert opacity-70"
                />
              </div>
            )}
          </div>

          <div className="py-4 px-1 bg-transparent">
            <div className="mb-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[21px] font-bold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary leading-tight group-hover:text-blue-600 transition-colors">
                  {toTitleCase(`${car.year} ${car.make} ${car.model}`)}
                </h3>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[15px] text-gray-600 dark:text-dark-text-secondary line-clamp-2 leading-snug">
                {[
                  car.mileage
                    ? `${car.mileage.toLocaleString("pl-PL")} km`
                    : null,
                  translateTransmission(car.transmission),
                  car.engine ? `${car.engine} cm3` : null,
                  translateFuelType(car.fuel),
                ]
                  .filter(Boolean)
                  .join(", ")}
                . Stan techniczny i wizualny oceniany jako wzorowy.
              </p>

              <div className="text-[15px] text-gray-600 dark:text-dark-text-secondary line-clamp-2 leading-snug">
                {locationDetails.city || "POLSKA"}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      prefetch={true}
      data-skip-nav-overlay
      onClick={handleNavigate}
      className="group cursor-pointer focus:outline-none block"
    >
      <div className="mx-2 bg-transparent rounded-2xl overflow-hidden transition-all duration-500 flex flex-row h-[140px] xs:h-[160px] sm:h-[200px] md:h-[260px] relative">
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 dark:hover:bg-dark-raised/20 transition-all duration-300 z-10 pointer-events-none rounded-2xl" />
        <div
          ref={imageWrapRef}
          className="relative w-[120px] xs:w-[150px] sm:w-[200px] md:w-[400px] h-full flex-shrink-0 overflow-hidden rounded-2xl [&_[data-car-morph-source]]:opacity-0"
        >
          {car?.isFeatured && (car?.images?.length ?? 0) >= 3 ? (
            <div className="flex h-full w-full gap-0.5">
              <div data-car-tile className="relative w-2/3 h-full">
                <Image
                  src={formatCarImage(car.images[0])}
                  alt={`${car.year} ${car.make} ${car.model} - 1`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 30vw, 20vw"
                />
              </div>
              <div className="w-1/3 flex flex-col gap-0.5 h-full">
                <div data-car-tile className="relative h-1/2">
                  <Image
                    src={formatCarImage(car.images[1])}
                    alt={`${car.year} ${car.make} ${car.model} - 2`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 15vw, 10vw"
                  />
                </div>
                <div data-car-tile className="relative h-1/2">
                  <Image
                    src={formatCarImage(car.images[2])}
                    alt={`${car.year} ${car.make} ${car.model} - 3`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 15vw, 10vw"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div data-car-tile className="absolute inset-0">
              <Image
                src={firstImage}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover transition-transform duration-700"
                loading="lazy"
                sizes="(max-width: 768px) 40vw, 30vw"
              />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {car?.isFeatured && (
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-bl from-black/50 to-transparent pointer-events-none z-20 flex items-start justify-end p-2 sm:p-4">
              <Image
                src="/logooo.png"
                alt="Premium"
                width={32}
                height={32}
                className="object-contain brightness-0 invert opacity-70"
              />
            </div>
          )}
        </div>

        <div className="flex-1 p-3 xs:p-4 md:p-8 flex flex-col justify-center bg-transparent min-w-0">
          <div className="flex flex-col gap-1 md:gap-3">
            <h3 className="text-sm xs:text-base sm:text-lg md:text-3xl font-bold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary group-hover:text-blue-600 transition-colors leading-tight truncate">
              {car.year} {car.make} {car.model}
            </h3>

            <p className="text-[10px] xs:text-xs md:text-[17px] text-gray-600 dark:text-dark-text-secondary line-clamp-2 md:line-clamp-none leading-snug">
              {[
                car.mileage
                  ? `${car.mileage.toLocaleString("pl-PL")} km`
                  : null,
                translateTransmission(car.transmission),
                car.engine ? `${car.engine} cm3` : null,
                translateFuelType(car.fuel),
              ]
                .filter(Boolean)
                .join(", ")}
              . Stan techniczny i wizualny oceniany jako wzorowy.
            </p>

            <div className="flex flex-row justify-between items-center mt-1 md:mt-4">
              <div className="text-[10px] md:text-[16px] text-gray-400 dark:text-dark-text-muted font-bold uppercase tracking-tight">
                {locationDetails.city || "POLSKA"}
              </div>

              <div className="text-sm xs:text-base sm:text-xl md:text-4xl font-black text-gray-900 dark:text-gray-200 dark:text-dark-text-primary tracking-tighter">
                {car.financialInfo?.priceNetto
                  ? `${car.financialInfo.priceNetto.toLocaleString("pl-PL")} zł`
                  : "Cena do negocjacji"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
