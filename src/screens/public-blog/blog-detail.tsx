"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loading, ArrowLeft, Calendar, User, Clock } from "@/icons";
import { blogService } from "@/services/blog";
import { Blog } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { config } from "@/config";

interface PublicBlogDetailProps {
  blogId: string;
}

export default function PublicBlogDetailScreen({
  blogId,
}: PublicBlogDetailProps) {
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      const response = await blogService.getPublishedBlogById(blogId);
      setBlog(response.data.blog);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Article introuvable"
      );
      router.push("/blog");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg font-medium">Article introuvable</p>
        <Button
          variant="link"
          onClick={() => router.push("/blog")}
          className="mt-4"
        >
          Retour au blog
        </Button>
      </div>
    );
  }

  // Generate JSON-LD structured data for SEO
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
      "@id": `${process.env.NEXT_PUBLIC_APP_URL || "https://pretpourtcf.com"}/blog/${blogId}`,
    },
    keywords: [
      "TCF",
      "Test de Connaissance du Français",
      "préparation TCF",
      "examen français",
    ].join(", "),
    wordCount: blog.body.split(" ").length,
    articleBody: blog.body,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen mt-4">
        {/* Cover Image */}
        {blog.cover_image && (
          <div className="w-full max-h-[540px] max-w-4xl overflow-hidden rounded-4xl mx-auto">
            <img
              src={`${config.cloudFlarePublicUrl}practices/images/${blog.cover_image}`}
              alt={blog.title}
              className="w-full h-full object-fill"
            />
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 pt-6">
        <article className="max-w-4xl mx-auto" itemScope itemType="https://schema.org/BlogPosting">
          {/* Title */}
          <header>
            <h1 className="text-2xl md:text-4xl font-semibold mb-4" itemProp="headline">
              {blog.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-2" itemProp="description">
              {blog.description}
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time
                  dateTime={blog.published_at || blog.createdAt}
                  itemProp="datePublished"
                >
                  {blog.published_at
                    ? formatDate(blog.published_at)
                    : formatDate(blog.createdAt)}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{Math.ceil(blog.body.split(" ").length / 200)} min de lecture</span>
              </div>
            </div>
            <meta itemProp="dateModified" content={blog.updatedAt} />
            <meta itemProp="author" content="PrêtPourTCF" />
          </header>
          <Separator className="mb-4" />
          {/* Article Content */}
          <div
            className="article-body prose leading-relaxed prose-lg prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
            itemProp="articleBody"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {blog.body}
            </ReactMarkdown>
          </div>

          <Separator className="my-8" />

          {/* Back Button */}
          <div className="mt-6 pb-12 text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/blog")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à tous les articles
            </Button>
          </div>
        </article>
        </div>
      </div>
    </>
  );
}
