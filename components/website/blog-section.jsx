"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../lib/i18n/LanguageContext";

const BLOG_POSTS = [
  {
    id: 1,
    titleKey: "buyCarEasily",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
    categoryKey: "guides",
    dateKey: "march5",
  },
  {
    id: 2,
    titleKey: "bestCars2025",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop",
    categoryKey: "guides",
    dateKey: "march3",
  },
  {
    id: 3,
    titleKey: "sellCarEasily",
    image:
      "https://images.unsplash.com/photo-1471479917193-f00955256257?q=80&w=2831&auto=format&fit=crop",
    categoryKey: "guides",
    dateKey: "march1",
  },
  {
    id: 4,
    titleKey: "financingOptions",
    image:
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=1974&auto=format&fit=crop",
    categoryKey: "guides",
    dateKey: "feb28",
  },
];

export function BlogSection() {
  const { t } = useLanguage();

  return (
    <section className="py-12">
      <div className=" mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">
          {t("homepage.blogSection.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {BLOG_POSTS.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group">
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={t(`homepage.blogSection.posts.${post.titleKey}`)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 text-white bg-blue-600 text-xs font-semibold px-2 py-1 rounded">
                  {t(`homepage.blogSection.categories.${post.categoryKey}`)}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {t(`homepage.blogSection.dates.${post.dateKey}`)}
              </p>
              <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                {t(`homepage.blogSection.posts.${post.titleKey}`)}
              </h3>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
            {t("homepage.blogSection.viewAll")}
          </button>
        </div>
      </div>
    </section>
  );
}
