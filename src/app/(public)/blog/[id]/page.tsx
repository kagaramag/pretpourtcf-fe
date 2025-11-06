import PublicBlogDetailScreen from "@/screens/public-blog/blog-detail";
import { Metadata } from "next";
import { blogService } from "@/services/blog";
import { config } from "@/config";

interface PublicBlogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PublicBlogDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await blogService.getPublishedBlogById(id);
    const blog = response.data.blog;

    const title = `${blog.title} | Pret Pour TCF`;
    const description = blog.description || blog.title;
    const imageUrl = blog.cover_image
      ? `${config.cloudFlarePublicUrl}practices/images/${blog.cover_image}`
      : `${config.cloudFlarePublicUrl}og-default.png`;
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pretpourtcf.com'}/blog/${id}`;

    // Extract first 160 characters for meta description if needed
    const metaDescription = description.length > 160
      ? description.substring(0, 157) + '...'
      : description;

    return {
      title,
      description: metaDescription,
      keywords: [
        'TCF',
        'Test de Connaissance du Français',
        'préparation TCF',
        'examen français',
        'apprentissage français',
        blog.title,
      ],
      authors: [{ name: 'Pret Pour TCF' }],
      openGraph: {
        title,
        description: metaDescription,
        url,
        siteName: 'Pret Pour TCF',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        locale: 'fr_FR',
        type: 'article',
        publishedTime: blog.published_at || blog.createdAt,
        modifiedTime: blog.updatedAt,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: metaDescription,
        images: [imageUrl],
        creator: '@PretPourTCF',
      },
      alternates: {
        canonical: url,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    // Fallback metadata if blog fetch fails
    return {
      title: "Article | Pret Pour TCF",
      description: "Lisez nos articles sur la préparation au TCF",
    };
  }
}

export default async function PublicBlogDetailPage({
  params,
}: PublicBlogDetailPageProps) {
  const { id } = await params;
  return <PublicBlogDetailScreen blogId={id} />;
}
