"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Edit, Trash2 } from "lucide-react";
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

  // Delete blog mutation
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      published: "default",
      archived: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/blog")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{blog.title}</h1>
            <p className="text-muted-foreground">{blog.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/blog/${blogId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(blog.status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Author</p>
              <p className="mt-1">
                {blog.written_by.first_name} {blog.written_by.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="mt-1">{formatDate(blog.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Published At
              </p>
              <p className="mt-1">
                {blog.published_at ? formatDate(blog.published_at) : "Not published"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cover Image */}
      {blog.cover_image && (
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={`${config.cloudFlarePublicUrl}practices/images/${blog.cover_image}`}
              alt={blog.title}
              className="w-full max-w-2xl rounded-lg border"
            />
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {blog.body}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
