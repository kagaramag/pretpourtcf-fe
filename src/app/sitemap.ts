import { MetadataRoute } from "next";
import { blogService } from "@/services/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pretpourtcf.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tarifs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contactez-nous`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Fetch all published blogs dynamically
  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    // Fetch all published blogs (you may need to adjust limit or handle pagination)
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
    // If fetching fails, continue with static routes only
  }

  return [...staticRoutes, ...blogRoutes];
}
