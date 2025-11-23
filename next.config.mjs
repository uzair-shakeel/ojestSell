import dotenv from "dotenv";
dotenv.config();

let userConfig = undefined;
try {
  userConfig = await import("./v0-user-next.config");
} catch (e) {
  // ignore error
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_URL || !API_BASE_URL) {
  throw new Error(
    "❌ Missing required API environment variables in .env file."
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_API_URL: API_URL,
    NEXT_PUBLIC_API_BASE_URL: API_BASE_URL,
  },

  images: {
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com",
      "img.clerk.com",
      "localhost",
    ],
    unoptimized: true,
  },

  async rewrites() {
    return [
      // Exclude detect-image from rewrites - it's a Next.js API route
      // All other /api/* routes will be proxied to the backend
      {
        source: "/api/:path((?!detect-image).*)",
        destination: `${API_BASE_URL}/api/:path`,
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  output: "standalone",

  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

mergeConfig(nextConfig, userConfig);

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return;
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === "object" &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }
}

export default nextConfig;
