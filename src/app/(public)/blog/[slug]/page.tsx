import { cache } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { blogService } from "@/services/blog";
import { config } from "@/config";
import PublicBlogDetailScreen from "@/screens/public-blog/blog-detail";

export const revalidate = 1800; // Revalidate every 30 minutes

interface Props {
  params: Promise<{ slug: string }>;
}

// cache() deduplicates the fetch between generateMetadata and the page
const getBlog = cache(async (slug: string) => {
  const response = await blogService.getPublishedBlogBySlug(slug);
  return response.data.blog;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await getBlog(slug);

    const title = `PrêtPourTCF | ${blog.title}`;
    const description = blog.description || blog.title;
    const imageUrl = blog.cover_image
      ? `${config.cloudFlarePublicUrl}practices/images/${blog.cover_image}`
      : `${config.cloudFlarePublicUrl}og-default.png`;
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://pretpourtcf.com"}/blog/${slug}`;
    const metaDescription =
      description.length > 160 ? description.substring(0, 157) + "..." : description;

    return {
      title,
      description: metaDescription,
      keywords: [
        "TCF",
        "Test de Connaissance du Français",
        "préparation TCF",
        "examen français",
        "apprentissage français",
        blog.title,
      ],
      authors: [{ name: "PrêtPourTCF" }],
      openGraph: {
        title,
        description: metaDescription,
        url,
        siteName: "PrêtPourTCF",
        images: [{ url: imageUrl, width: 1200, height: 630, alt: blog.title }],
        locale: "fr_FR",
        type: "article",
        publishedTime: blog.published_at || blog.createdAt,
        modifiedTime: blog.updatedAt,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: metaDescription,
        images: [imageUrl],
      },
      alternates: { canonical: url },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch {
    return {
      title: "PrêtPourTCF | Article",
      description: "Lisez nos articles sur la préparation au TCF",
    };
  }
}

export default async function PublicBlogDetailPage({ params }: Props) {
  const { slug } = await params;

  let blog;
  try {
    blog = await getBlog(slug);
  } catch {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.description,
    image: blog.cover_image
      ? `${config.cloudFlarePublicUrl}practices/images/${blog.cover_image}`
      : undefined,
    datePublished: blog.published_at || blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      "@type": "Organization",
      name: "PrêtPourTCF",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://pretpourtcf.com",
    },
    publisher: {
      "@type": "Organization",
      name: "PrêtPourTCF",
      logo: {
        "@type": "ImageObject",
        url: `${config.cloudFlarePublicUrl}logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL || "https://pretpourtcf.com"}/blog/${slug}`,
    },
    keywords: [
      "TCF",
      "Test de Connaissance du Français",
      "préparation TCF",
      "examen français",
    ].join(", "),
    wordCount: blog.body.split(" ").length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicBlogDetailScreen blog={blog} />
    </>
  );
}
