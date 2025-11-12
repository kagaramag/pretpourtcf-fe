"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, ArrowLeft, Save, Trash, ImageIcon } from "lucide-react";
import { blogService } from "@/services/blog";
import { Blog, BlogStatus } from "@/types";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { uploadService } from "@/services/upload";
import { config } from "@/config";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface BlogFormProps {
  blogId?: string;
  initialData?: Blog;
}

export default function BlogFormScreen({ blogId, initialData }: BlogFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!blogId;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [body, setBody] = useState(initialData?.body || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [status, setStatus] = useState<BlogStatus>(
    initialData?.status || "draft"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Create blog mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => blogService.createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog created successfully");
      router.push("/dashboard/blog");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create blog");
    },
  });

  // Update blog mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => blogService.updateBlog(blogId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", blogId] });
      toast.success("Blog updated successfully");
      router.push("/dashboard/blog");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update blog");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!body.trim()) {
      toast.error("Body content is required");
      return;
    }

    const data: any = {
      title: title.trim(),
      description: description.trim(),
      body: body.trim(),
      status,
    };

    // Handle cover_image: only include if it has a valid URL
    const trimmedCoverImage = coverImage.trim();
    if (trimmedCoverImage) {
      data.cover_image = trimmedCoverImage;
    }

    console.log("Submitting blog data:", data);
    console.log("Cover image state:", coverImage);
    console.log("Trimmed cover image:", trimmedCoverImage);

    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should not exceed 10MB");
      return;
    }

    setImageFile(file);

    // Auto-upload
    try {
      setIsUploading(true);
      const response = await uploadService.uploadQuestionMedia({
        file,
        practiceTitle: "blog-cover",
        questionNumber: undefined,
      });

      console.log("Upload response:", response.data);

      if (response.data?.filename) {
        console.log("Setting cover image to filename:", response.data.filename);
        setCoverImage(response.data.filename);
        toast.success("Image uploaded successfully");
      } else {
        console.error("No filename in response:", response.data);
        toast.error("Upload succeeded but no filename received");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload image");
      setImageFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setCoverImage("");
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/blog")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Blog Post" : "New Blog Post"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update your blog post details"
              : "Create a new blog post"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter a brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as BlogStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Cover Image</Label>
                {coverImage ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50">
                      <ImageIcon className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Image uploaded</p>
                        <a
                          href={`${config.cloudFlarePublicUrl}${coverImage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:underline"
                        >
                          {imageFile?.name || coverImage}
                        </a>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <img
                      src={`${config.cloudFlarePublicUrl}${coverImage}`}
                      alt="Cover preview"
                      className="w-full max-w-md rounded-lg border"
                    />
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                    {isUploading && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Uploading image...
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Max 10MB. Supported: JPG, PNG, WEBP
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Body Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                Content <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div data-color-mode="light">
                <MDEditor
                  value={body}
                  onChange={(val) => setBody(val || "")}
                  height={500}
                  preview="edit"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/blog")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Blog" : "Create Blog"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
