"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading, Edit, Dustbin } from "@/icons";
import { blogService } from "@/services/blog";
import { Blog } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";
import { usePermissions } from "@/contexts/permission-context";
import { PERMISSIONS } from "@/config/permissions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { config } from "@/config";
import { PageWrapper } from "@/components/molecules/page-wrapper";

interface BlogDetailProps {
  blogId: string;
}

export default function BlogDetailScreen({ blogId }: BlogDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const canUpdate = hasPermission(PERMISSIONS.PRACTICES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PRACTICES_DELETE);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog deleted successfully");
      router.push("/dashboard/blog");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete blog");
    },
  });

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      const response = await blogService.getBlogById(blogId);
      setBlog(response.data.blog);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch blog");
      router.push("/dashboard/blog");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deleteMutation.mutate(blogId);
    }
  };

  const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
    draft: "secondary",
    published: "default",
    archived: "outline",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg font-medium">Blog not found</p>
      </div>
    );
  }

  const actions = (
    <div className="flex items-center gap-2">
      {canUpdate && (
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/blog/${blogId}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}
      {canDelete && (
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? (
            <Loading className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Dustbin className="h-4 w-4 mr-2" />
          )}
          Delete
        </Button>
      )}
    </div>
  );

  return (
    <PageWrapper showBack title="Article" actions={actions}>
      <div className="grid grid-cols-[1fr_360px] gap-4 mt-4">
        {/* Left — title + content */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <h1 className="text-2xl font-semibold leading-snug">{blog.title}</h1>
            <div className="article-body prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg">
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
          </div>
        </div>

        {/* Right — metadata sidebar */}
        <div className="space-y-4">
          {/* Slug */}
          <div className="bg-white rounded-2xl p-4 space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Slug</p>
            <p className="text-sm text-gray-700 break-all">{blog.slug}</p>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl p-4 space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Excerpt</p>
            <p className="text-sm text-gray-700 leading-relaxed">{blog.description}</p>
          </div>

          {/* Status & Date */}
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</p>
              <Badge variant={statusVariants[blog.status] || "default"}>
                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Date</p>
              <p className="text-sm text-gray-700">
                {blog.published_at ? formatDate(blog.published_at) : formatDate(blog.createdAt)}
              </p>
            </div>
          </div>

          {/* Cover Image */}
          {blog.cover_image && (
            <div className="bg-white rounded-2xl p-4 space-y-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cover Image</p>
              <img
                src={`${config.cloudFlarePublicUrl}practices/images/${blog.cover_image}`}
                alt={blog.title}
                className="w-full rounded-xl object-cover aspect-video"
              />
            </div>
          )}

          {/* Author */}
          <div className="bg-white rounded-2xl p-4 space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Author</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                {blog.written_by.first_name?.[0]}
                {blog.written_by.last_name?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {blog.written_by.first_name} {blog.written_by.last_name}
                </p>
                <p className="text-xs text-gray-500">{blog.written_by.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
