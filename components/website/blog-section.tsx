import Image from "next/image";
import Link from "next/link";

const BLOG_POSTS = [
  {
    id: 1,
    title: "How to buy a car easily",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
    category: "Guides",
    date: "March 5, 2025",
  },
  {
    id: 2,
    title: "Best cars to buy in 2025",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop",
    category: "Guides",
    date: "March 3, 2025",
  },
  {
    id: 3,
    title: "How to sell your car easily",
    image:
      "https://images.unsplash.com/photo-1471479917193-f00955256257?q=80&w=2831&auto=format&fit=crop",
    category: "Guides",
    date: "March 1, 2025",
  },
  {
    id: 4,
    title: "Financing options for car buyers",
    image:
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=1974&auto=format&fit=crop",
    category: "Guides",
    date: "February 28, 2025",
  },
];

export function BlogSection() {
  return (
    <section className="py-12">
      <div className=" mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Blog</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {BLOG_POSTS.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group">
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 text-white bg-blue-600 text-xs font-semibold px-2 py-1 rounded">
                  {post.category}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">{post.date}</p>
              <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
            View All Posts
          </button>
        </div>
      </div>
    </section>
  );
}
