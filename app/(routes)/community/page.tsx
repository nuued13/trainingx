"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Bookmark,
  Clock,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Share2,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/contexts/UserStatsContext";
import { api } from "convex/_generated/api";

interface CommunityPost {
  _id: string;
  authorId: string;
  author: {
    name: string;
    avatar?: string;
    level: string;
    badge?: string;
  };
  content: string;
  title: string;
  category: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  bookmarks: number;
  trending?: boolean;
}

type MediaKind = "image" | "video";

interface MediaItem {
  id: string;
  file: File;
  previewUrl: string;
  kind: MediaKind;
  name: string;
  sizeMb: number;
  compressed: boolean;
  flagged?: boolean;
  flagReason?: string;
}

const TOPICS = [
  { id: "all", name: "All Posts", icon: Sparkles },
  { id: "prompts", name: "Prompt Tips", icon: MessageSquare },
  { id: "projects", name: "Projects", icon: Users },
  { id: "achievements", name: "Achievements", icon: TrendingUp },
  { id: "questions", name: "Q&A", icon: MessageSquare },
];

const POST_CATEGORIES = [
  { id: "general", name: "General Discussion" },
  { id: "prompts", name: "Prompt Tips & Tricks" },
  { id: "projects", name: "Project Showcase" },
  { id: "achievements", name: "Achievements & Milestones" },
  { id: "questions", name: "Questions & Help" },
  { id: "resources", name: "Resources & Learning" },
  { id: "feedback", name: "Feedback & Suggestions" },
];

const AI_REVIEW_RULES = [
  {
    title: "Keep it respectful",
    description:
      "No harassment, hate speech, personal attacks, or targeted insults.",
  },
  {
    title: "Stay helpful",
    description:
      "Share learnings, context, and sources so others can reproduce results.",
  },
  {
    title: "Avoid spam",
    description: "No unsolicited promos or repetitive low-effort content.",
  },
  {
    title: "Mind safety & privacy",
    description:
      "Skip sensitive personal info and tag any edge cases for human review.",
  },
];

const MAX_IMAGE_FILES = 3;
const MAX_VIDEO_FILES = 1;
const MAX_IMAGE_MB = 4;
const MAX_VIDEO_MB = 20;
const MAX_IMAGE_DIMENSION = 1600;
const NSFW_SKIN_THRESHOLD = 0.35;
const NSFW_MIN_PIXELS = 10_000;
const NSFW_MODEL_FLAG = 0.35;
const NSFW_SEXY_FLAG = 0.65;

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

// Compute author level based on their total upvotes (proxy for reputation)
function getAuthorLevel(upvotes: number): string {
  if (upvotes >= 100) return "Community Champion";
  if (upvotes >= 50) return "Top Contributor";
  if (upvotes >= 25) return "Active Helper";
  if (upvotes >= 10) return "Rising Voice";
  if (upvotes >= 5) return "Contributor";
  return "Member";
}

// Get author badge based on upvotes
function getAuthorBadge(upvotes: number): string {
  if (upvotes >= 100) return "⭐ Champion";
  if (upvotes >= 50) return "🌟 Top";
  return "";
}

function CommentSection({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId?: string;
}) {
  const [content, setContent] = useState("");
  const comments = useQuery(api.posts.getComments, {
    postId: postId as Id<"posts">,
  });
  const createComment = useMutation(api.posts.createComment);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      await createComment({
        postId: postId as Id<"posts">,
        authorId: currentUserId as Id<"users">,
        content: content.trim(),
      });
      setContent("");
      toast({ title: "Comment added" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  if (comments === undefined) {
    return (
      <div className="p-8 text-center bg-slate-50/50 border-t-2 border-slate-100">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
        <p className="text-slate-400 font-medium text-sm">
          Loading comments...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/80 border-t-2 border-slate-100 p-6 space-y-6">
      {/* Input */}
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
          <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
            You
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 gap-3 flex flex-col">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-white min-h-[80px] text-base resize-none"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="font-bold"
            >
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-4 group">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={comment.author?.image} />
              <AvatarFallback className="bg-slate-200 text-slate-500 font-bold">
                {comment.author?.name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-sm text-slate-700">
                  {comment.author?.name}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  • {formatTimestamp(comment.createdAt)}
                </span>
              </div>
              <p className="text-slate-600 text-[15px] leading-relaxed break-words">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-8 text-slate-400 font-medium italic">
            No comments yet. Be the first to start the conversation!
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({
  post,
  userVote,
  onVote,
  onDelete,
  currentUserId,
}: {
  post: CommunityPost;
  userVote: "up" | "down" | null;
  onVote: (postId: string, voteType: "up" | "down") => void;
  onDelete: (postId: string) => void;
  currentUserId?: string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const netScore = post.upvotes - post.downvotes;
  const isCurrentUser = post.authorId === currentUserId;

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/community?post=${post._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch {
      // User cancelled or share failed, ignore
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 border-2 border-slate-200">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="font-bold text-slate-400 bg-slate-100">
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className="font-extrabold text-slate-700"
                  data-testid={`text-post-author-${post._id}`}
                >
                  {post.author.name}
                  {isCurrentUser && (
                    <span className="ml-2 rounded-lg bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-600">
                      You
                    </span>
                  )}
                </h4>
                {post.author.badge && (
                  <span className="rounded-lg bg-yellow-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-yellow-600">
                    {post.author.badge}
                  </span>
                )}
                {post.trending && (
                  <span className="flex items-center gap-1 rounded-lg bg-orange-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-orange-600">
                    <TrendingUp className="h-3 w-3 stroke-3" />
                    Trending
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">
                <span>{post.author.level}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.timestamp}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-wide">
            {POST_CATEGORIES.find((c) => c.id === post.category)?.name ||
              post.category}
          </div>
        </div>

        {post.title && (
          <h3
            className="text-xl font-extrabold text-slate-800 mb-2"
            data-testid={`text-post-title-${post._id}`}
          >
            {post.title}
          </h3>
        )}

        <p
          className="text-base font-medium text-slate-600 leading-relaxed mb-6"
          data-testid={`text-post-content-${post._id}`}
        >
          {post.content}
        </p>

        <div className="flex items-center gap-2 pt-4 border-t-2 border-slate-100">
          <div className="flex items-center gap-1 rounded-xl border-2 border-slate-200 bg-slate-50 p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-lg hover:bg-slate-200",
                userVote === "up" &&
                  "text-green-600 bg-green-100 hover:bg-green-200"
              )}
              onClick={() => onVote(post._id, "up")}
              data-testid={`button-upvote-${post._id}`}
            >
              <ArrowUp className="h-5 w-5 stroke-3" />
            </Button>
            <span
              className={cn(
                "font-black min-w-[2rem] text-center text-sm",
                netScore > 0 && "text-green-600",
                netScore < 0 && "text-red-600",
                netScore === 0 && "text-slate-500"
              )}
              data-testid={`text-vote-score-${post._id}`}
            >
              {netScore > 0 ? `+${netScore}` : netScore}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-lg hover:bg-slate-200",
                userVote === "down" &&
                  "text-red-600 bg-red-100 hover:bg-red-200"
              )}
              onClick={() => onVote(post._id, "down")}
              data-testid={`button-downvote-${post._id}`}
            >
              <ArrowDown className="h-5 w-5 stroke-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl h-10 px-3",
              showComments && "text-blue-600 bg-blue-50"
            )}
            onClick={() => setShowComments(!showComments)}
            data-testid={`button-comment-${post._id}`}
          >
            <MessageSquare className="h-5 w-5 stroke-3" />
            <span>{post.replyCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 font-bold text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl h-10 px-3",
              isBookmarked && "text-yellow-600 bg-yellow-50"
            )}
            onClick={() => setIsBookmarked(!isBookmarked)}
            data-testid={`button-bookmark-${post._id}`}
          >
            <Bookmark
              className={cn("h-5 w-5 stroke-3", isBookmarked && "fill-current")}
            />
            <span>{post.bookmarks}</span>
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-600 rounded-xl h-10 w-10 p-0"
            onClick={handleShare}
            data-testid={`button-share-${post._id}`}
          >
            <Share2 className="h-5 w-5 stroke-3" />
          </Button>

          {isCurrentUser && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-10 w-10 p-0"
              onClick={() => onDelete(post._id)}
              data-testid={`button-delete-${post._id}`}
            >
              <Trash2 className="h-5 w-5 stroke-3" />
            </Button>
          )}
        </div>
      </div>
      {showComments && (
        <CommentSection postId={post._id} currentUserId={currentUserId} />
      )}
    </div>
  );
}

export default function Community() {
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("general");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const mediaRef = useRef<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nsfwModelRef = useRef<any>(null);
  const nsfwLoadPromiseRef = useRef<Promise<any> | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const postsData = useQuery(api.posts.getPosts, {
    category: selectedTopic === "all" ? undefined : selectedTopic,
    limit: 50,
  });

  // Fetch user votes for all visible posts
  const postIds = (postsData || []).map((p) => p._id);
  const userVotes = useQuery(
    api.posts.getUserVotes,
    user?._id && postIds.length > 0
      ? { postIds: postIds as any, userId: user._id as any }
      : "skip"
  );

  const { userStats } = useUserStats();

  const createPostMutation = useMutation(api.posts.createPost);
  const votePostMutation = useMutation(api.posts.votePost);
  const deletePostMutation = useMutation(api.posts.deletePost);

  useEffect(() => {
    mediaRef.current = mediaItems;
  }, [mediaItems]);

  useEffect(() => {
    return () => {
      mediaRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const loadTinyNsfwModel = async () => {
    if (typeof window === "undefined") return null;
    if (nsfwModelRef.current) return nsfwModelRef.current;
    if (!nsfwLoadPromiseRef.current) {
      nsfwLoadPromiseRef.current = (async () => {
        try {
          const tf = await import("@tensorflow/tfjs");
          try {
            await import("@tensorflow/tfjs-backend-wasm");
            await tf.setBackend("wasm");
          } catch {
            await tf.setBackend("webgl");
          }
          await tf.ready();
          const nsfwjs = await import("nsfwjs");
          const model = await nsfwjs.load(undefined, { size: 224 });
          nsfwModelRef.current = model;
          return model;
        } catch (error) {
          console.warn("NSFW model failed to load", error);
          return null;
        }
      })();
    }
    return nsfwLoadPromiseRef.current;
  };

  const runTinyNsfwCheck = async (canvas: HTMLCanvasElement) => {
    try {
      const model = await loadTinyNsfwModel();
      if (!model) return { flagged: false as const };

      const predictions = await model.classify(canvas, 5);
      const normalized = predictions.map(
        (p: { className: string; probability: number }) => ({
          className: p.className.toLowerCase(),
          probability: p.probability,
        })
      );

      const porn = normalized.find((p) => p.className === "porn");
      const hentai = normalized.find((p) => p.className === "hentai");
      const sexy = normalized.find((p) => p.className === "sexy");
      const top = normalized[0];

      const pornScore = Math.max(
        porn?.probability || 0,
        hentai?.probability || 0
      );
      const sexyScore = sexy?.probability || 0;
      const flagged =
        pornScore >= NSFW_MODEL_FLAG ||
        sexyScore >= NSFW_SEXY_FLAG ||
        (top &&
          top.probability >= 0.8 &&
          ["porn", "hentai", "sexy"].includes(top.className));

      return {
        flagged,
        label: top?.className,
        score: Math.max(pornScore, sexyScore, top?.probability || 0),
      };
    } catch (error) {
      console.warn("NSFW check failed", error);
      return { flagged: false as const };
    }
  };

  const calculateSkinRatio = (data: Uint8ClampedArray) => {
    let skinPixels = 0;
    const totalPixels = data.length / 4;
    if (totalPixels < NSFW_MIN_PIXELS) return 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      if (y > 40 && cb > 90 && cb < 130 && cr > 140 && cr < 180) {
        skinPixels += 1;
      }
    }

    return skinPixels / totalPixels;
  };

  const sampleMediaToCanvas = async (file: File, kind: MediaKind) => {
    if (kind === "video") {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.crossOrigin = "anonymous";
      video.muted = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("Video load failed"));
      });

      video.currentTime = Math.min(1, video.duration || 0);
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      const canvas = document.createElement("canvas");
      canvas.width = Math.min(320, Math.max(1, video.videoWidth));
      canvas.height = Math.min(320, Math.max(1, video.videoHeight));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(video.src);
        return { canvas, coverage: 0 };
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const coverage = calculateSkinRatio(data);
      URL.revokeObjectURL(video.src);
      return { canvas, coverage };
    }

    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, 320 / bitmap.width, 320 / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) return { canvas, coverage: 0 };
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return { canvas, coverage: calculateSkinRatio(data) };
  };

  const compressImage = async (file: File): Promise<File> => {
    try {
      const bitmap = await createImageBitmap(file);
      const ratio = Math.min(
        1,
        MAX_IMAGE_DIMENSION / bitmap.width,
        MAX_IMAGE_DIMENSION / bitmap.height
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * ratio);
      canvas.height = Math.round(bitmap.height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (output) =>
            output
              ? resolve(output)
              : reject(new Error("Image compression failed")),
          "image/webp",
          0.76
        );
      });

      return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
        type: "image/webp",
        lastModified: Date.now(),
      });
    } catch {
      return file;
    }
  };

  const handleMediaSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);
    const hasVideoExisting = mediaItems.some((item) => item.kind === "video");
    const existingImagesCount = mediaItems.filter(
      (item) => item.kind === "image"
    ).length;
    const selectedVideos = selectedFiles.filter((file) =>
      file.type.startsWith("video/")
    );
    const selectedImages = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    // Enforce media type rules
    if (hasVideoExisting && selectedFiles.length) {
      toast({
        title: "Cannot add more media",
        description: "A post can only have one video or images—not both.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVideos.length > 0 && mediaItems.length > 0) {
      toast({
        title: "Video limit",
        description:
          "You already added media. Remove it before adding a video.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVideos.length > MAX_VIDEO_FILES) {
      toast({
        title: "Only one video allowed",
        description: "Select a single video or switch to images instead.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVideos.length > 0 && selectedImages.length > 0) {
      toast({
        title: "Choose video or images",
        description: "Mixing videos and images in the same post is disabled.",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length + existingImagesCount > MAX_IMAGE_FILES) {
      toast({
        title: "Image limit reached",
        description: `You can add up to ${MAX_IMAGE_FILES} images.`,
        variant: "destructive",
      });
      return;
    }

    const newMedia: MediaItem[] = [];

    for (const file of selectedFiles) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        toast({
          title: "Unsupported file",
          description: "Only images and videos are allowed.",
          variant: "destructive",
        });
        continue;
      }

      const sizeMb = file.size / (1024 * 1024);
      if (isImage && sizeMb > MAX_IMAGE_MB) {
        toast({
          title: "Image too large",
          description: `Each image must be under ${MAX_IMAGE_MB}MB.`,
          variant: "destructive",
        });
        continue;
      }

      if (isVideo && sizeMb > MAX_VIDEO_MB) {
        toast({
          title: "Video too large",
          description: `Videos must be under ${MAX_VIDEO_MB}MB.`,
          variant: "destructive",
        });
        continue;
      }

      let processedFile = file;
      let compressed = false;

      if (isImage) {
        const compressedFile = await compressImage(file);
        processedFile = compressedFile;
        compressed = compressedFile.size < file.size;
      }

      const previewUrl = URL.createObjectURL(processedFile);
      const { canvas, coverage } = await sampleMediaToCanvas(
        processedFile,
        isVideo ? "video" : "image"
      );
      const nsfwResult = await runTinyNsfwCheck(canvas);
      const flaggedBySkin = coverage >= NSFW_SKIN_THRESHOLD;
      const flagged = flaggedBySkin || nsfwResult.flagged;
      const flagReason = flagged
        ? flaggedBySkin
          ? "High skin-tone coverage detected. Please double-check before posting."
          : nsfwResult.flagged
            ? `Possible NSFW content detected (${nsfwResult.label || "model"} • ${Math.round((nsfwResult.score || 0) * 100)}%). Please review before posting.`
            : undefined
        : undefined;

      newMedia.push({
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
        file: processedFile,
        previewUrl,
        kind: isVideo ? "video" : "image",
        name: processedFile.name,
        sizeMb: Number((processedFile.size / (1024 * 1024)).toFixed(1)),
        compressed,
        flagged,
        flagReason,
      });
    }

    if (newMedia.length === 0) return;

    setMediaItems((prev) => [...prev, ...newMedia]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const triggerMediaPicker = () => {
    fileInputRef.current?.click();
  };

  const runLocalAiPrefilter = async () => {
    // Simulate a lightweight LLM moderation pass before creating the post.
    await new Promise((resolve) => setTimeout(resolve, 1200));
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!user?._id) {
      toast({
        title: "Login Required",
        description: "Please log in to vote on posts",
        variant: "destructive",
      });
      return;
    }

    try {
      await votePostMutation({
        postId: postId as Id<"posts">,
        userId: user._id as Id<"users">,
        voteType,
      });

      toast({
        title: "Vote recorded!",
        description: `You ${voteType}voted this post`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user?._id) return;
    setPostToDelete(postId);
  };

  const confirmDelete = async () => {
    if (!user?._id || !postToDelete) return;

    try {
      await deletePostMutation({
        postId: postToDelete as Id<"posts">,
        userId: user._id as Id<"users">,
      });

      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setPostToDelete(null);
    }
  };

  const handleCreatePost = async () => {
    if (!user?._id || !postTitle.trim() || !postContent.trim()) return;

    setIsAnalyzing(true);

    try {
      await runLocalAiPrefilter();

      await createPostMutation({
        title: postTitle,
        content: postContent,
        authorId: user._id as Id<"users">,
        category: postCategory,
        tags: [],
      });

      setPostTitle("");
      setPostContent("");
      setPostCategory("general");
      mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setMediaItems([]);
      setIsCreateModalOpen(false);

      toast({
        title: "Post Created!",
        description: "+5 points for creating a post!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const posts: CommunityPost[] = (postsData || []).map((post) => ({
    _id: post._id,
    authorId: post.authorId,
    author: {
      name: post.author?.name || "Anonymous",
      avatar: post.author?.image,
      level: getAuthorLevel(post.upvotes),
      badge: getAuthorBadge(post.upvotes),
    },
    content: post.content,
    title: post.title,
    category: post.category,
    timestamp: formatTimestamp(post.createdAt),
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    replyCount: post.replyCount,
    bookmarks: 0,
    trending: post.upvotes > 50,
  }));

  const communityActivity = userStats?.communityActivity;

  return (
    <SidebarLayout>
      <div className="h-full overflow-auto bg-slate-50/50">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-b-[6px] border-blue-200 bg-white text-blue-500 shadow-sm">
                <Users className="h-8 w-8 stroke-3" />
              </div>
              <div>
                <h1
                  className="text-4xl font-extrabold text-slate-800 tracking-tight"
                  data-testid="text-community-title"
                >
                  Community
                </h1>
                <p
                  className="text-lg font-medium text-slate-500"
                  data-testid="text-community-subtitle"
                >
                  Connect, share, and earn points.
                </p>
              </div>
            </div>
            <JuicyButton
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
              data-testid="button-create-post"
            >
              <Plus className="h-5 w-5 stroke-3" />
              Create Post
            </JuicyButton>
          </div>

          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/50 p-4">
            <Accordion type="single" collapsible defaultValue="rules">
              <AccordionItem value="rules" className="border-none">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wide">
                    <Zap className="h-4 w-4" />
                    Community Guidelines
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    {AI_REVIEW_RULES.map((rule) => (
                      <div
                        key={rule.title}
                        className="rounded-xl border-2 border-slate-100 bg-white p-3"
                      >
                        <p className="text-sm font-extrabold text-slate-700 mb-1">
                          {rule.title}
                        </p>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          {rule.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {communityActivity && (
            <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                  <Award className="h-6 w-6 stroke-3" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-700">
                  Your Stats
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border-2 border-slate-100">
                  <div
                    className="text-2xl font-black text-blue-500"
                    data-testid="text-community-score"
                  >
                    {communityActivity.communityScore}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                    Score
                  </div>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border-2 border-slate-100">
                  <div className="text-2xl font-black text-green-500">
                    {communityActivity.upvotesReceived}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                    Upvotes
                  </div>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border-2 border-slate-100">
                  <div className="text-2xl font-black text-red-500">
                    {communityActivity.downvotesReceived}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                    Downvotes
                  </div>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border-2 border-slate-100">
                  <div className="text-2xl font-black text-purple-500">
                    {communityActivity.postsCreated}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                    Posts
                  </div>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border-2 border-slate-100">
                  <div className="text-2xl font-black text-orange-500">
                    {communityActivity.helpfulAnswers}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                    Helpful
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              const isSelected = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border-2 border-b-4 whitespace-nowrap",
                    isSelected
                      ? "bg-slate-800 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  <Icon className="h-4 w-4 stroke-3" />
                  {topic.name}
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <MessageSquare className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  No posts yet
                </h3>
                <p className="text-slate-500 font-medium mt-1">
                  Be the first to start a conversation!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  userVote={(userVotes?.[post._id] as "up" | "down") || null}
                  onVote={handleVote}
                  onDelete={handleDelete}
                  currentUserId={user?._id}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-2 border-slate-200">
          <DialogHeader className="p-6 pb-4 border-b-2 border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-2xl font-extrabold text-slate-800">
              Create Post
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Title
                </label>
                <Input
                  placeholder="What's on your mind?"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Category
                </label>
                <Select value={postCategory} onValueChange={setPostCategory}>
                  <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-slate-700 focus:ring-0">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-slate-200 font-bold">
                    {POST_CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="focus:bg-slate-50 cursor-pointer"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Content
                </label>
                <Textarea
                  placeholder="Share your thoughts, prompts, or questions..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[150px] rounded-xl border-2 border-slate-200 bg-slate-50 p-4 font-medium text-slate-700 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-0 resize-none"
                />
              </div>

              {/* Media Preview Area */}
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-200"
                    >
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => removeMediaItem(item.id)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={triggerMediaPicker}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <ImageIcon className="h-5 w-5" />
                  Add Media
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => handleMediaSelected(e.target.files)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-slate-100">
              <JuicyButton
                onClick={handleCreatePost}
                disabled={
                  !postTitle.trim() || !postContent.trim() || isAnalyzing
                }
                className="w-full sm:w-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Post
                  </>
                )}
              </JuicyButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!postToDelete}
        onOpenChange={(open) => !open && setPostToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl border-2 border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">
              Delete Post?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete your
              post and remove all associated comments and votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  );
}
