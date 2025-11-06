"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Calendar, User, Clock } from "lucide-react";
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

  return (
    <div className="min-h-screen bg-background mt-4">
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
        <article className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-semibold mb-4">
            {blog.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-2">
            {blog.description}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {blog.published_at
                  ? formatDate(blog.published_at)
                  : formatDate(blog.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{Math.ceil(blog.body.split(" ").length / 200)} min de lecture</span>
            </div>
          </div>
          <Separator className="mb-4" />
          {/* Article Content */}
          <div className="prose leading-relaxed prose-lg prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {blog.body}
            </ReactMarkdown>
          </div>

          <Separator className="my-8" />

          {/* Back Button */}
          <div className="mt-12 text-center">
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
  );
}
