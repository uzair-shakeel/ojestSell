import dynamic from 'next/dynamic';

// Lazy load heavy components to reduce initial bundle size

// Framer Motion components (heavy animation library)
export const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded" />,
  }
);

export const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  { ssr: false }
);

// Google Maps component (very heavy)
export const DynamicGoogleMap = dynamic(
  () => import('../components/dashboard/GoogleMapComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Loading Map...</span>
      </div>
    ),
  }
);

// Image editor (heavy component with canvas operations)
export const DynamicImageEditor = dynamic(
  () => import('../components/dashboard/ImageEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Loading Editor...</span>
      </div>
    ),
  }
);

// Background removal component (very heavy ML library)
export const DynamicBackgroundRemoval = dynamic(
  () => import('../components/dashboard/BackgroundRemoval'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Loading AI Tools...</span>
      </div>
    ),
  }
);

// Phone input component
export const DynamicPhoneInput = dynamic(
  () => import('react-phone-input-2').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-12 bg-gray-200 animate-pulse rounded" />
    ),
  }
);

// Swiper components (carousel library)
export const DynamicSwiper = dynamic(
  () => import('swiper/react').then(mod => ({ default: mod.Swiper })),
  { ssr: false }
);

export const DynamicSwiperSlide = dynamic(
  () => import('swiper/react').then(mod => ({ default: mod.SwiperSlide })),
  { ssr: false }
);

// Chart components (if used)
export const DynamicChart = dynamic(
  () => import('react-chartjs-2'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Loading Chart...</span>
      </div>
    ),
  }
);

// Create a HOC for lazy loading with intersection observer
export const withLazyLoading = (Component, fallback = null) => {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false,
    loading: () => fallback || <div className="animate-pulse bg-gray-200 rounded h-20" />,
  });
};