"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Loading, Trash, ImageIcon, Globe, MessageSquare, FileText, List, Done, Info, AttachFile } from "@/icons";
import { blogService } from "@/services/blog";
import { Blog, BlogStatus } from "@/types";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { uploadService } from "@/services/upload";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
import { config } from "@/config";
import { PageWrapper } from "@/components/molecules/page-wrapper";
import { useAuth } from "@/contexts/auth-context";

const s = { width: 14, height: 14 };

const editorCommands = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.divider,
  { ...commands.link, icon: <AttachFile style={s} /> },
  { ...commands.quote, icon: <MessageSquare style={s} /> },
  { ...commands.code, icon: <FileText style={s} /> },
  { ...commands.image, icon: <ImageIcon style={s} /> },
  commands.divider,
  { ...commands.unorderedListCommand, icon: <List style={s} /> },
  { ...commands.checkedListCommand, icon: <Done style={s} /> },
  commands.divider,
  { ...commands.help, icon: <Info style={s} /> },
];

const editorExtraCommands = [
  { ...commands.codeEdit, icon: <FileText style={s} /> },
  commands.codeLive,
  { ...commands.codePreview, icon: <Globe style={s} /> },
  commands.divider,
  commands.fullscreen,
];

interface BlogFormProps {
  blogId?: string;
  initialData?: Blog;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogFormScreen({ blogId, initialData }: BlogFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditMode = !!blogId;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [status, setStatus] = useState<BlogStatus>(initialData?.status || "draft");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slugPreview = initialData?.slug || slugify(title);

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

  const handleSubmit = (publish?: boolean) => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!description.trim()) { toast.error("Excerpt is required"); return; }
    if (!body.trim()) { toast.error("Content is required"); return; }

    const data: any = {
      title: title.trim(),
      description: description.trim(),
      body: body.trim(),
      status: publish ? "published" : status,
    };

    if (coverImage.trim()) {
      data.cover_image = coverImage.trim();
    }

    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image size should not exceed 10MB"); return; }

    try {
      setIsUploading(true);
      const response = await uploadService.uploadQuestionMedia({
        file,
        practiceTitle: "blog-cover",
        questionNumber: undefined,
      });
      if (response.data?.filename) {
        setCoverImage(response.data.filename);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload succeeded but no filename received");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard/blog")}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        variant="secondary"
        onClick={() => handleSubmit()}
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting ? <Loading className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Draft
      </Button>
      <Button
        onClick={() => handleSubmit(true)}
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting ? <Loading className="mr-2 h-4 w-4 animate-spin" /> : null}
        Publish
      </Button>
    </div>
  );

  return (
    <PageWrapper
      showBack
      title={isEditMode ? "Edit Article" : "Article Page"}
      actions={actions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Left — title + content */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Name your blog"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>
                Content <span className="text-red-500">*</span>
              </Label>
              <div data-color-mode="light">
                <MDEditor
                  value={body}
                  onChange={(val) => setBody(val || "")}
                  preview="edit"
                  height="auto"
                  commands={editorCommands}
                  extraCommands={editorExtraCommands}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right — metadata sidebar */}
        <div className="space-y-4">
          {/* Slug */}
          <div className="bg-white rounded-2xl p-4 space-y-1">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slugPreview}
              readOnly
              className="text-gray-500 bg-gray-50"
              placeholder="Auto-generated from title"
            />
            <p className="text-xs text-gray-400">Auto-generated from title</p>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl p-4 space-y-1">
            <Label htmlFor="description">
              Excerpt <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add a short excerpt to summarize this post"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl p-4 space-y-1">
            <Label>Status</Label>
            <Select
              value={status}
              onChange={(v) => setStatus(v as BlogStatus)}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              className="w-full"
            />
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-2xl p-4 space-y-2">
            <Label>Cover Image</Label>
            {coverImage ? (
              <div className="space-y-2">
                <img
                  src={`${config.cloudFlarePublicUrl}practices/images/${coverImage}`}
                  alt="Cover"
                  className="w-full rounded-xl object-cover aspect-video"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCoverImage("")}
                  className="w-full"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Remove image
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loading className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                )}
                <p className="text-sm text-gray-500">
                  {isUploading ? "Uploading..." : "Drag and Drop Images or"}
                </p>
                {!isUploading && (
                  <button
                    type="button"
                    className="text-sm text-blue-500 hover:underline"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Upload Image
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            )}
          </div>

          {/* Author */}
          {user && (
            <div className="bg-white rounded-2xl p-4 space-y-2">
              <Label>Author</Label>
              <div className="flex items-center gap-3 p-2 border rounded-xl">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.first_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <>
                      {user.first_name?.[0]}
                      {user.last_name?.[0]}
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
