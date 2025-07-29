'use client';

import Image from 'next/image';
import { useState } from 'react';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  const handleImageLoad = (e) => {
    setIsLoading(false);
    onLoad?.(e);
  };

  const handleImageError = (e) => {
    setImageError(true);
    setIsLoading(false);
    onError?.(e);
  };

  if (imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${isLoading ? 'animate-pulse bg-gray-200' : ''} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        sizes={sizes}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        {...props}
      />
    </div>
  );
};

// HOC for responsive images
export const withResponsiveImage = (Component) => {
  return ({ imageSrc, imageAlt, ...props }) => (
    <Component 
      {...props}
      image={
        <OptimizedImage
          src={imageSrc}
          alt={imageAlt}
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      }
    />
  );
};

// Car image specific optimization
export const CarImage = ({ src, alt, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={400}
    height={300}
    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 400px"
    quality={80}
    priority={false}
    {...props}
  />
);

// Avatar image optimization  
export const AvatarImage = ({ src, alt, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={40}
    height={40}
    sizes="40px"
    quality={85}
    priority={false}
    className="rounded-full"
    {...props}
  />
);

// Hero image optimization
export const HeroImage = ({ src, alt, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={1920}
    height={1080}
    sizes="100vw"
    quality={90}
    priority={true}
    {...props}
  />
);

export default OptimizedImage;