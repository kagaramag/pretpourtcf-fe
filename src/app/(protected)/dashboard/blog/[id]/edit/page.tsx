"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogFormScreen from "@/screens/blog/blog-form";
import { blogService } from "@/services/blog";
import { Blog } from "@/types";
import { Loading } from "@/icons";
import { toast } from "sonner";

export default function EditBlogPage() {
  const params = useParams();
  const blogId = params.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await blogService.getBlogById(blogId);
        setBlog(response.data.blog);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch blog");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

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

  return <BlogFormScreen blogId={blogId} initialData={blog} />;
}
