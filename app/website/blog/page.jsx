"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "./data";

const BlogPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner Section with Image */}
      <div className="mt-4 mx-4 text-center rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat relative">
        <div
          className="w-full h-[300px] relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/IMG_4467.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="bg-black/20 flex justify-start md:justify-end py-4 md:py-24 px-4 h-full">
            <div className="relative z-10 md:w-1/3 px-6 flex flex-col justify-center">
              <h1 className="text-xl font-extrabold text-white sm:text-4xl">
                Our Blog
              </h1>
              <p className="mt-4 text-white text-lg">
                Discover the latest insights, tips, and trends in the automotive
                world
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2  gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/website/blog/${post.id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600">{post.excerpt}</p>
                <div className="mt-4">
                  <span className="text-blue-600 hover:text-blue-800 font-medium">
                    Read more →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
