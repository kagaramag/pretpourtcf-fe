"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, Volume2, Image as ImageIcon, Upload, Trash } from "lucide-react";
import {
  questionService,
  CreateQuestionData,
  UpdateQuestionData,
} from "@/services/question";
import { uploadService } from "@/services/upload";
import { PracticeQuestion, QuestionType, CEFRLevel, Practice } from "@/types";
import { toast } from "sonner";

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: PracticeQuestion | null;
  mode: "create" | "edit";
  examId: string;
  practice?: Practice | null;
  onSuccess?: () => void;
}

export function QuestionFormDialog({
  open,
  onOpenChange,
  question,
  mode,
  examId,
  practice,
  onSuccess,
}: QuestionFormDialogProps) {
  const [formData, setFormData] = useState({
    number: 1,
    type: "mcq" as QuestionType,
    text: "",
    options: ["", "", "", ""],
    correct: 0,
    score: 1,
    audioUrl: "",
    imageUrl: "",
    difficulty: "" as CEFRLevel | "",
    tags: "",
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // Reset form when dialog opens/closes or question changes
  useEffect(() => {
    if (open && question && mode === "edit") {
      setFormData({
        number: question.number,
        type: question.type,
        text: question.text,
        options: question.options || ["", "", "", ""],
        correct: question.correct || 0,
        score: question.score,
        audioUrl: question.media?.audio || "",
        imageUrl: question.media?.image || "",
        difficulty: question.difficulty || "",
        tags: question.tags?.join(", ") || "",
      });
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        number: 1,
        type: "mcq",
        text: "",
        options: ["", "", "", ""],
        correct: 0,
        score: 1,
        audioUrl: "",
        imageUrl: "",
        difficulty: "",
        tags: "",
      });
      setAudioFile(null);
      setImageFile(null);
    }
  }, [open, question, mode]);

  // File upload handlers
  const handleAudioFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Audio file must be less than 10MB");
      return;
    }

    setAudioFile(file);

    // Auto-upload
    try {
      setIsUploadingAudio(true);
      const response = await uploadService.uploadQuestionMedia({
        file,
        practiceTitle: practice?.title,
        questionNumber: formData.number,
      });

      if (response.data) {
        setFormData({ ...formData, audioUrl: response.data.url });
        toast.success("Audio uploaded successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload audio");
      setAudioFile(null);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file must be less than 10MB");
      return;
    }

    setImageFile(file);

    // Auto-upload
    try {
      setIsUploadingImage(true);
      const response = await uploadService.uploadQuestionMedia({
        file,
        practiceTitle: practice?.title,
        questionNumber: formData.number,
      });

      if (response.data) {
        setFormData({ ...formData, imageUrl: response.data.url });
        toast.success("Image uploaded successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload image");
      setImageFile(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setFormData({ ...formData, audioUrl: "" });
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setFormData({ ...formData, imageUrl: "" });
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Create question mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateQuestionData) =>
      questionService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["practice"] });
      toast.success("Question created successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create question"
      );
    },
  });

  // Update question mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; data: UpdateQuestionData }) =>
      questionService.updateQuestion(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["practice"] });
      toast.success("Question updated successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update question"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.text) {
      toast.error("Question text is required");
      return;
    }

    if (formData.type === "mcq") {
      const validOptions = formData.options.filter((opt) => opt.trim() !== "");
      if (validOptions.length < 2) {
        toast.error("MCQ questions must have at least 2 options");
        return;
      }
      if (formData.correct >= validOptions.length) {
        toast.error("Please select a valid correct answer");
        return;
      }
    }

    if (formData.score < 1 || formData.score > 100) {
      toast.error("Score must be between 1 and 100");
      return;
    }

    // Prepare submit data
    const media: any = {};
    if (formData.audioUrl) media.audio = formData.audioUrl;
    if (formData.imageUrl) media.image = formData.imageUrl;

    const submitData: any = {
      examId,
      number: formData.number,
      type: formData.type,
      text: formData.text,
      score: formData.score,
    };

    if (formData.type === "mcq") {
      submitData.options = formData.options.filter((opt) => opt.trim() !== "");
      submitData.correct = formData.correct;
    }

    if (Object.keys(media).length > 0) {
      submitData.media = media;
    }

    if (formData.difficulty) {
      submitData.difficulty = formData.difficulty;
    }

    if (formData.tags) {
      submitData.tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
    }

    if (mode === "create") {
      createMutation.mutate(submitData);
    } else if (question) {
      const updateData = { ...submitData };
      delete updateData.examId; // Don't update examId
      updateMutation.mutate({
        id: question._id,
        data: updateData,
      });
    }
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) {
      toast.error("MCQ must have at least 2 options");
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
      correct: formData.correct >= index ? Math.max(0, formData.correct - 1) : formData.correct,
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Question" : "Edit Question"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new question to this practice exam."
              : "Update question details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">
                  Question Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="number"
                  type="number"
                  min="1"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Question Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: QuestionType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="audio">Audio Response</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">
                Question Text <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                placeholder="Enter the question text..."
                rows={3}
                required
              />
            </div>

            {formData.type === "mcq" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Answer Options <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mt-2">
                  <Label htmlFor="correct">
                    Correct Answer <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.correct.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, correct: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.options.map((option, index) =>
                        option.trim() !== "" ? (
                          <SelectItem key={index} value={index.toString()}>
                            Option {index + 1}: {option}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">
                  Score (Points) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="score"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      score: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty || "none"}
                  onValueChange={(value: CEFRLevel | "none") =>
                    setFormData({
                      ...formData,
                      difficulty: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="A1">A1</SelectItem>
                    <SelectItem value="A2">A2</SelectItem>
                    <SelectItem value="B1">B1</SelectItem>
                    <SelectItem value="B2">B2</SelectItem>
                    <SelectItem value="C1">C1</SelectItem>
                    <SelectItem value="C2">C2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Media Attachments (Optional)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload audio and/or image files for this question
              </p>

              <div className="space-y-4">
                {/* Audio Upload */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-blue-600" />
                    <Label>Audio File</Label>
                  </div>

                  {formData.audioUrl ? (
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-blue-50">
                      <Volume2 className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Audio uploaded</p>
                        <a
                          href={formData.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {audioFile?.name || "View file"}
                        </a>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAudio}
                        disabled={isUploadingAudio}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => audioInputRef.current?.click()}
                        disabled={isUploadingAudio}
                        className="w-full"
                      >
                        {isUploadingAudio ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Audio (MP3, WAV, etc.)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Max 10MB. Supported: MP3, WAV, OGG, AAC
                  </p>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-green-600" />
                    <Label>Image File</Label>
                  </div>

                  {formData.imageUrl ? (
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50">
                      <ImageIcon className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Image uploaded</p>
                        <a
                          href={formData.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:underline"
                        >
                          {imageFile?.name || "View file"}
                        </a>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="w-full"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image (JPG, PNG, etc.)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Max 10MB. Supported: JPG, PNG, GIF, WEBP
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="vocab, grammar, listening (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple tags with commas. Maximum 10 tags.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create Question"
              ) : (
                "Update Question"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
