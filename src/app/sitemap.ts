import { MetadataRoute } from "next";
import { blogService } from "@/services/blog";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.pretpourtcf.com";

// ─────────────────────────────────────────────────────────────────────────────
// SITEMAP CONFIG — toggle routes on/off before submitting to Google Search Console
// Set `include: false` to exclude a page from the sitemap.
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_ROUTES: Array<{
  path: string;
  include: boolean;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  // Public pages
  { path: "/", include: true, changeFrequency: "daily", priority: 1.0 },
  { path: "/tarifs", include: true, changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", include: true, changeFrequency: "weekly", priority: 0.8 },
  {
    path: "/contactez-nous",
    include: true,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  { path: "/book", include: true, changeFrequency: "monthly", priority: 0.6 },
  {
    path: "/conditions",
    include: true,
    changeFrequency: "yearly",
    priority: 0.3,
  },

  // Auth pages — excluded (no SEO value, should not be indexed)
  { path: "/login", include: false, changeFrequency: "never", priority: 0 },
  { path: "/signup", include: false, changeFrequency: "never", priority: 0 },
  {
    path: "/forgot-password",
    include: false,
    changeFrequency: "never",
    priority: 0,
  },
  {
    path: "/reset-password",
    include: false,
    changeFrequency: "never",
    priority: 0,
  },
  {
    path: "/verify-email",
    include: false,
    changeFrequency: "never",
    priority: 0,
  },

  // Authenticated / private pages — excluded
  // /compte/* — client account area (requires login)
  // /dashboard/* — admin area (requires admin role)
  // /trainer/* — trainer area (requires trainer role)
];

// Toggle blog post pages on/off globally
const INCLUDE_BLOG_POSTS = true;

// ─────────────────────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.filter(
    (r) => r.include
  ).map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let blogRoutes: MetadataRoute.Sitemap = [];

  if (INCLUDE_BLOG_POSTS) {
    try {
      const response = await blogService.getPublishedBlogs({ limit: 100 });

      if (response.status === "success" && response.data?.blogs) {
        blogRoutes = response.data.blogs.map((blog) => ({
          url: `${baseUrl}/blog/${blog._id}`,
          lastModified: new Date(blog.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
      }
    } catch (error) {
      console.error("Error fetching blogs for sitemap:", error);
    }
  }

  return [...staticRoutes, ...blogRoutes];
}
