"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock } from "@/icons";
import { Blog } from "@/types";
import { formatDate } from "@/lib/date-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { config } from "@/config";

interface PublicBlogDetailProps {
  blog: Blog;
}

export default function PublicBlogDetailScreen({
  blog,
}: PublicBlogDetailProps) {
  return (
    <div className="min-h-screen mt-4 pb-8 pt-16">
      <div className="bg-black  pb-8 pt-24 absolute top-0 left-0 w-full h-100 -z-10" />
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6">
        <article
          className="max-w-4xl mx-auto"
          itemScope
          itemType="https://schema.org/BlogPosting"
        >
          
            {/* Title */}
            <header className="mb-6">
              <h1
                className="text-2xl md:text-4xl font-semibold text-white mb-3"
                itemProp="headline"
              >
                {blog.title}
              </h1>
              {/* Description */}
              <p className="text-gray-300 mb-2" itemProp="description">
                {blog.description}
              </p>
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-4">
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
                  <span>
                    {Math.ceil(blog.body.split(" ").length / 200)} min de
                    lecture
                  </span>
                </div>
              </div>
              {blog.cover_image && (
                <div className="w-full max-h-[540px] max-w-4xl overflow-hidden rounded-4xl mx-auto">
                  <img
                    src={`${config.cloudFlarePublicUrl}practices/images/${blog.cover_image}`}
                    alt={blog.title}
                    className="w-full h-full object-fill"
                  />
                </div>
              )}

              <meta itemProp="dateModified" content={blog.updatedAt} />
              <meta itemProp="author" content="PrêtPourTCF" />
            </header>

          {/* Article Content */}
          <div
            className="article-body prose space-y-2 leading-relaxed prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
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


          {/* Back Button */}
          <div className="mt-6 pb-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 border border-input bg-background px-4 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-content transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à tous les articles
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
