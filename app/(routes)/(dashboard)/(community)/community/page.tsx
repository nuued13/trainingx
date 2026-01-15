"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Bookmark,
  CheckCircle,
  Circle,
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
  X,
  Zap,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQuery, useAction } from "convex/react";
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
    image?: string;
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
  isBookmarked?: boolean;
  trending?: boolean;
  media?: Array<{
    storageId: string;
    url: string;
    type: "image" | "video";
    name?: string;
    sizeMb?: number;
    duration?: number;
  }>;
}

type MediaKind = "image" | "video";

interface MediaItem {
  id: string;
  file: File;
  previewUrl: string;
  kind: MediaKind;
  name: string;
  sizeMb: number;
  originalSizeMb?: number; // Original size before compression
  compressed: boolean;
  compressing?: boolean; // True while compression is in progress
  compressionProgress?: number; // 0-100 progress percentage
  duration?: number; // Video duration in seconds
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
const MAX_VIDEO_MB = 50; // Increased since we compress before upload
const MAX_VIDEO_DURATION_SECONDS = 60; // 1 minute max
const TARGET_VIDEO_MB = 15; // Target compressed size
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const comments = useQuery(api.posts.getComments, {
    postId: postId as Id<"posts">,
  });
  const createModeratedComment = useAction(api.posts.createModeratedComment);
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

    setIsSubmitting(true);

    try {
      const result = await createModeratedComment({
        postId: postId as Id<"posts">,
        authorId: currentUserId as Id<"users">,
        content: content.trim(),
      });

      if (!result.success) {
        toast({
          title: "❌ Comment Not Published",
          description:
            result.message ||
            "Your comment doesn't meet our community guidelines.",
          variant: "destructive",
        });
        return;
      }

      setContent("");
      toast({ title: "✨ Comment added" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks || 0);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const toggleBookmark = useMutation(api.posts.toggleBookmark);

  const handleBookmark = async () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to bookmark posts",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);
    setBookmarkCount((prev) =>
      newIsBookmarked ? prev + 1 : Math.max(0, prev - 1)
    );

    try {
      await toggleBookmark({
        postId: post._id as Id<"posts">,
        userId: currentUserId as Id<"users">,
      });
    } catch (error) {
      // Revert on error
      setIsBookmarked(!newIsBookmarked);
      setBookmarkCount((prev) =>
        !newIsBookmarked ? prev + 1 : Math.max(0, prev - 1)
      );
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

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
    <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-b-[4px] sm:border-b-[6px] border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="p-4 sm:p-6">
        {/* Header row - category moves below on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-slate-200 shrink-0">
              <AvatarImage src={post.author.image} />
              <AvatarFallback className="font-bold text-slate-400 bg-slate-100 text-xs sm:text-sm">
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h4
                  className="font-extrabold text-slate-700 text-sm sm:text-base truncate"
                  data-testid={`text-post-author-${post._id}`}
                >
                  {post.author.name}
                  {isCurrentUser && (
                    <span className="ml-1.5 sm:ml-2 rounded-lg bg-blue-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-blue-600">
                      You
                    </span>
                  )}
                </h4>
                {post.author.badge && (
                  <span className="hidden xs:inline-flex rounded-lg bg-yellow-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-yellow-600">
                    {post.author.badge}
                  </span>
                )}
                {post.trending && (
                  <span className="flex items-center gap-0.5 sm:gap-1 rounded-lg bg-orange-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-orange-600">
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-3" />
                    <span className="hidden sm:inline">Trending</span>
                    <span className="sm:hidden">🔥</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5 sm:mt-1">
                <span className="hidden sm:inline">{post.author.level}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {post.timestamp}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 rounded-lg sm:rounded-xl border-2 border-slate-200 bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide self-start">
            {POST_CATEGORIES.find((c) => c.id === post.category)?.name ||
              post.category}
          </div>
        </div>

        {post.title && (
          <h3
            className="text-lg sm:text-xl font-extrabold text-slate-800 mb-2"
            data-testid={`text-post-title-${post._id}`}
          >
            {post.title}
          </h3>
        )}

        <p
          className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed mb-4"
          data-testid={`text-post-content-${post._id}`}
        >
          {post.content}
        </p>

        {/* Media Display */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4">
            {/* Single video */}
            {post.media.length === 1 &&
              post.media[0].type === "video" &&
              post.media[0].url && (
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200">
                  <video
                    src={post.media[0].url}
                    controls
                    className="w-full max-h-[400px] object-contain bg-black"
                    preload="metadata"
                  />
                  {post.media[0].duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/70 text-xs font-bold text-white">
                      {Math.floor(post.media[0].duration / 60)}:
                      {String(Math.floor(post.media[0].duration % 60)).padStart(
                        2,
                        "0"
                      )}
                    </div>
                  )}
                </div>
              )}

            {/* Images grid */}
            {post.media.filter((m) => m.type === "image").length > 0 && (
              <div
                className={cn(
                  "grid gap-2 rounded-xl overflow-hidden",
                  post.media.filter((m) => m.type === "image").length === 1
                    ? "grid-cols-1"
                    : post.media.filter((m) => m.type === "image").length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                )}
              >
                {post.media
                  .filter((m) => m.type === "image")
                  .map(
                    (mediaItem, idx) =>
                      mediaItem.url && (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(mediaItem.url, "_blank")}
                        >
                          <img
                            src={mediaItem.url}
                            alt={mediaItem.name || `Image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                  )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons - compact on mobile */}
        <div className="flex items-center gap-1 sm:gap-2 pt-3 sm:pt-4 border-t-2 border-slate-100 overflow-x-auto">
          {/* Vote buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg sm:rounded-xl border-2 border-slate-200 bg-slate-50 p-0.5 sm:p-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md sm:rounded-lg hover:bg-slate-200",
                userVote === "up" &&
                  "text-green-600 bg-green-100 hover:bg-green-200"
              )}
              onClick={() => onVote(post._id, "up")}
              data-testid={`button-upvote-${post._id}`}
            >
              <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 stroke-3" />
            </Button>
            <span
              className={cn(
                "font-black min-w-[1.5rem] sm:min-w-[2rem] text-center text-xs sm:text-sm",
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
                "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md sm:rounded-lg hover:bg-slate-200",
                userVote === "down" &&
                  "text-red-600 bg-red-100 hover:bg-red-200"
              )}
              onClick={() => onVote(post._id, "down")}
              data-testid={`button-downvote-${post._id}`}
            >
              <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 stroke-3" />
            </Button>
          </div>

          {/* Comment button */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1 sm:gap-2 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl h-8 sm:h-10 px-2 sm:px-3 shrink-0",
              showComments && "text-blue-600 bg-blue-50"
            )}
            onClick={() => setShowComments(!showComments)}
            data-testid={`button-comment-${post._id}`}
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 stroke-3" />
            <span className="text-xs sm:text-sm">{post.replyCount}</span>
          </Button>

          {/* Bookmark button - hidden on very small screens */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "hidden xs:flex gap-1 sm:gap-2 font-bold text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg sm:rounded-xl h-8 sm:h-10 px-2 sm:px-3 shrink-0",
              isBookmarked && "text-yellow-600 bg-yellow-50"
            )}
            onClick={handleBookmark}
            data-testid={`button-bookmark-${post._id}`}
          >
            <Bookmark
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 stroke-3",
                isBookmarked && "fill-current"
              )}
            />
            <span className="text-xs sm:text-sm hidden sm:inline">
              {bookmarkCount}
            </span>
          </Button>

          <div className="flex-1 min-w-0" />

          {/* Share button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-600 rounded-lg sm:rounded-xl h-8 w-8 sm:h-10 sm:w-10 p-0 shrink-0"
            onClick={handleShare}
            data-testid={`button-share-${post._id}`}
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 stroke-3" />
          </Button>

          {/* Delete button */}
          {isCurrentUser && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl h-8 w-8 sm:h-10 sm:w-10 p-0 shrink-0"
              onClick={() => onDelete(post._id)}
              data-testid={`button-delete-${post._id}`}
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 stroke-3" />
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
  const ffmpegRef = useRef<any>(null);
  const ffmpegLoadPromiseRef = useRef<Promise<any> | null>(null);
  const [isCompressingVideo, setIsCompressingVideo] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false); // Immediate feedback when selecting files

  // New submit state for three-phase UX
  type SubmitState = "idle" | "uploading" | "evaluating" | "submitting";
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [mediaUploadComplete, setMediaUploadComplete] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  const [moderationError, setModerationError] = useState<{
    field: "title" | "content";
    message: string;
  } | null>(null);

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
  const createModeratedPost = useAction(api.posts.createModeratedPost);
  const createModeratedComment = useAction(api.posts.createModeratedComment);
  const votePostMutation = useMutation(api.posts.votePost);
  const deletePostMutation = useMutation(api.posts.deletePost);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

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

  // Load FFmpeg for video compression
  const loadFFmpeg = async () => {
    if (typeof window === "undefined") return null;
    if (ffmpegRef.current) return ffmpegRef.current;
    if (!ffmpegLoadPromiseRef.current) {
      ffmpegLoadPromiseRef.current = (async () => {
        try {
          const { FFmpeg } = await import("@ffmpeg/ffmpeg");
          const { toBlobURL } = await import("@ffmpeg/util");
          const ffmpeg = new FFmpeg();

          // Load ffmpeg core from CDN
          const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
          await ffmpeg.load({
            coreURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.js`,
              "text/javascript"
            ),
            wasmURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.wasm`,
              "application/wasm"
            ),
          });

          ffmpegRef.current = ffmpeg;
          return ffmpeg;
        } catch (error) {
          console.warn("FFmpeg failed to load:", error);
          return null;
        }
      })();
    }
    return ffmpegLoadPromiseRef.current;
  };

  // Get video duration in seconds
  const getVideoDuration = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Could not load video metadata"));
      };
      video.src = URL.createObjectURL(file);
    });
  };

  // Compress video using FFmpeg
  const compressVideo = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ file: File; compressed: boolean; duration: number }> => {
    // Get video duration first
    const duration = await getVideoDuration(file);

    // Check duration limit
    if (duration > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(
        `Video is too long (${Math.round(duration)}s). Maximum duration is ${MAX_VIDEO_DURATION_SECONDS} seconds.`
      );
    }

    const originalSizeMb = file.size / (1024 * 1024);

    // If video is already small enough and short, skip compression
    if (originalSizeMb <= TARGET_VIDEO_MB) {
      return { file, compressed: false, duration };
    }

    try {
      const ffmpeg = await loadFFmpeg();
      if (!ffmpeg) {
        // If FFmpeg fails to load, check if file is within limit
        if (originalSizeMb <= MAX_VIDEO_MB) {
          console.warn("FFmpeg not available, using original video");
          return { file, compressed: false, duration };
        }
        throw new Error(
          "Video compression failed to initialize. Please try a smaller video."
        );
      }

      // Set up progress tracking
      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        const percent = Math.round(progress * 100);
        onProgress?.(Math.min(percent, 99)); // Cap at 99% until done
      });

      // Read input file
      const { fetchFile } = await import("@ffmpeg/util");
      const inputName = "input" + getFileExtension(file.name);
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Calculate target bitrate based on duration for target size
      // Target size in bits / duration in seconds = bitrate
      const targetBits = TARGET_VIDEO_MB * 8 * 1024 * 1024;
      const videoBitrate = Math.floor((targetBits / duration) * 0.9); // 90% for video
      const audioBitrate = 64000; // 64kbps for audio
      const totalBitrate = videoBitrate - audioBitrate;
      const videoBitrateK = Math.max(
        200,
        Math.min(1500, Math.floor(totalBitrate / 1000))
      ); // 200k-1500k range

      // Execute FFmpeg command
      // -vf scale: Scale to max 720p while maintaining aspect ratio
      // -c:v libx264: Use H.264 codec for broad compatibility
      // -preset ultrafast: Fastest encoding for better UX
      // -crf: Constant rate factor for quality (23 is default, lower = better)
      // -c:a aac: Use AAC audio codec
      // -b:a: Audio bitrate
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        `scale='if(gt(iw,1280),1280,iw)':'if(gt(ih,720),720,ih)'`,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "28", // Good balance of quality and size
        "-b:v",
        `${videoBitrateK}k`,
        "-maxrate",
        `${videoBitrateK * 1.5}k`,
        "-bufsize",
        `${videoBitrateK * 2}k`,
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        "-movflags",
        "+faststart", // Enable streaming playback
        "-y", // Overwrite output
        outputName,
      ]);

      // Read output file
      const data = await ffmpeg.readFile(outputName);
      const compressedBlob = new Blob([data], { type: "video/mp4" });
      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^.]+$/, ".mp4"),
        { type: "video/mp4", lastModified: Date.now() }
      );

      // Clean up
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      onProgress?.(100);

      const compressedSizeMb = compressedFile.size / (1024 * 1024);
      console.log(
        `Video compressed: ${originalSizeMb.toFixed(1)}MB → ${compressedSizeMb.toFixed(1)}MB`
      );

      return { file: compressedFile, compressed: true, duration };
    } catch (error) {
      console.error("Video compression error:", error);
      // If compression fails but file is within limits, use original
      if (originalSizeMb <= MAX_VIDEO_MB) {
        return { file, compressed: false, duration };
      }
      throw error;
    }
  };

  // Helper to get file extension
  const getFileExtension = (filename: string): string => {
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0].toLowerCase() : ".mp4";
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

  // Multi-frame video sampling for more robust NSFW detection
  const VIDEO_SAMPLE_POINTS = [0.05, 0.2, 0.4, 0.6, 0.8, 0.95]; // 6 frames across video

  const sampleVideoMultiFrame = async (
    file: File
  ): Promise<{
    flagged: boolean;
    maxScore: number;
    flaggedFrames: number;
    details: Array<{ time: number; score: number; label?: string }>;
  }> => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.crossOrigin = "anonymous";
    video.muted = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Video load failed"));
    });

    const duration = video.duration;
    const results: Array<{
      time: number;
      score: number;
      label?: string;
      flagged: boolean;
    }> = [];

    let flaggedCount = 0;
    let maxScore = 0;

    for (const point of VIDEO_SAMPLE_POINTS) {
      const targetTime = duration * point;
      video.currentTime = targetTime;

      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      // Create canvas for this frame
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(320, Math.max(1, video.videoWidth));
      canvas.height = Math.min(320, Math.max(1, video.videoHeight));
      const ctx = canvas.getContext("2d");

      if (!ctx) continue;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Run both skin detection and NSFW model
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const skinCoverage = calculateSkinRatio(data);
      const nsfwResult = await runTinyNsfwCheck(canvas);

      const frameScore = Math.max(
        skinCoverage / NSFW_SKIN_THRESHOLD, // Normalize to 0-1+ scale
        nsfwResult.score || 0
      );

      const frameFlagged =
        skinCoverage >= NSFW_SKIN_THRESHOLD || nsfwResult.flagged;

      results.push({
        time: targetTime,
        score: frameScore,
        label: nsfwResult.label,
        flagged: frameFlagged,
      });

      if (frameFlagged) flaggedCount++;
      if (frameScore > maxScore) maxScore = frameScore;
    }

    URL.revokeObjectURL(video.src);

    // Video is flagged if ANY frame is flagged
    return {
      flagged: flaggedCount > 0,
      maxScore,
      flaggedFrames: flaggedCount,
      details: results,
    };
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

    // Set immediate visual feedback
    setIsProcessingMedia(true);

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
      setIsProcessingMedia(false);
      toast({
        title: "Cannot add more media",
        description: "A post can only have one video or images—not both.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVideos.length > 0 && mediaItems.length > 0) {
      setIsProcessingMedia(false);
      toast({
        title: "Video limit",
        description:
          "You already added media. Remove it before adding a video.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVideos.length > MAX_VIDEO_FILES) {
      setIsProcessingMedia(false);
      toast({
        title: "Only one video allowed",
        description: "Select a single video or switch to images instead.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVideos.length > 0 && selectedImages.length > 0) {
      setIsProcessingMedia(false);
      toast({
        title: "Choose video or images",
        description: "Mixing videos and images in the same post is disabled.",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length + existingImagesCount > MAX_IMAGE_FILES) {
      setIsProcessingMedia(false);
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
          description: `Videos must be under ${MAX_VIDEO_MB}MB. Try a shorter or lower quality video.`,
          variant: "destructive",
        });
        continue;
      }

      let processedFile = file;
      let compressed = false;
      let originalSizeMb = sizeMb;
      let videoDuration: number | undefined;

      if (isImage) {
        const compressedFile = await compressImage(file);
        processedFile = compressedFile;
        compressed = compressedFile.size < file.size;
      }

      // Video processing: duration check and compression
      if (isVideo) {
        try {
          // Show compression in progress
          setIsCompressingVideo(true);
          setCompressionProgress(0);

          toast({
            title: "Processing video...",
            description: "Checking duration and optimizing for upload.",
          });

          const result = await compressVideo(file, (progress) => {
            setCompressionProgress(progress);
          });

          processedFile = result.file;
          compressed = result.compressed;
          videoDuration = result.duration;
          originalSizeMb = sizeMb;

          if (compressed) {
            const newSizeMb = processedFile.size / (1024 * 1024);
            toast({
              title: "Video optimized!",
              description: `Reduced from ${sizeMb.toFixed(1)}MB to ${newSizeMb.toFixed(1)}MB`,
            });
          }
        } catch (error) {
          setIsCompressingVideo(false);
          setCompressionProgress(0);

          const errorMessage =
            error instanceof Error ? error.message : "Video processing failed";

          // Check if it's a duration error
          if (errorMessage.includes("too long")) {
            toast({
              title: "Video too long",
              description: errorMessage,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Video processing failed",
              description: errorMessage,
              variant: "destructive",
            });
          }
          continue;
        } finally {
          setIsCompressingVideo(false);
          setCompressionProgress(0);
        }
      }

      const previewUrl = URL.createObjectURL(processedFile);

      let flagged = false;
      let flagReason: string | undefined;

      // Use multi-frame sampling for videos, single-frame for images
      if (isVideo) {
        // Multi-frame NSFW check for videos (6 sample points)
        const videoCheckResult = await sampleVideoMultiFrame(processedFile);
        flagged = videoCheckResult.flagged;
        flagReason = flagged
          ? `NSFW content detected in ${videoCheckResult.flaggedFrames} of 6 frames (max score: ${Math.round(videoCheckResult.maxScore * 100)}%)`
          : undefined;
      } else {
        // Single-frame check for images
        const { canvas, coverage } = await sampleMediaToCanvas(
          processedFile,
          "image"
        );
        const nsfwResult = await runTinyNsfwCheck(canvas);
        const flaggedBySkin = coverage >= NSFW_SKIN_THRESHOLD;
        flagged = flaggedBySkin || nsfwResult.flagged;
        flagReason = flagged
          ? flaggedBySkin
            ? "High skin-tone coverage detected."
            : `Possible NSFW content detected (${nsfwResult.label || "model"} • ${Math.round((nsfwResult.score || 0) * 100)}%)`
          : undefined;
      }

      // BLOCK flagged content instead of just warning
      if (flagged) {
        URL.revokeObjectURL(previewUrl);
        toast({
          title: "🚫 Media Rejected",
          description:
            flagReason ||
            "This media was flagged as potentially inappropriate and cannot be uploaded.",
          variant: "destructive",
        });
        // DON'T add to newMedia array - skip this file
        continue;
      }

      newMedia.push({
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
        file: processedFile,
        previewUrl,
        kind: isVideo ? "video" : "image",
        name: processedFile.name,
        sizeMb: Number((processedFile.size / (1024 * 1024)).toFixed(1)),
        originalSizeMb: compressed ? originalSizeMb : undefined,
        compressed,
        duration: videoDuration,
        flagged: false, // Only non-flagged content reaches here
        flagReason: undefined,
      });
    }

    if (newMedia.length === 0) {
      setIsProcessingMedia(false);
      return;
    }

    setMediaItems((prev) => [...prev, ...newMedia]);
    setIsProcessingMedia(false);
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

    // Reset states
    setIsAnalyzing(true);
    setSubmitState("idle");
    setMediaUploadComplete(false);
    setEvaluationComplete(false);
    setModerationError(null);

    try {
      // Check for flagged media before proceeding
      const flaggedMedia = mediaItems.filter((item) => item.flagged);
      if (flaggedMedia.length > 0) {
        toast({
          title: "🚫 Media Rejected",
          description:
            "Some media was flagged as potentially inappropriate. Please remove it before posting.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Step 1: Upload media (if any)
      const uploadedMedia: Array<{
        storageId: any;
        url: string;
        type: "image" | "video";
        name?: string;
        sizeMb?: number;
        duration?: number;
        clientModerationPassed?: boolean;
      }> = [];

      if (mediaItems.length > 0) {
        setSubmitState("uploading");

        for (const item of mediaItems) {
          try {
            const uploadUrl = await generateUploadUrl();

            const response = await fetch(uploadUrl, {
              method: "POST",
              headers: {
                "Content-Type": item.file.type,
              },
              body: item.file,
            });

            if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`);
            }

            const { storageId } = await response.json();

            uploadedMedia.push({
              storageId,
              url: "",
              type: item.kind,
              name: item.name,
              sizeMb: item.sizeMb,
              duration: item.duration,
              clientModerationPassed: !item.flagged,
            });
          } catch (uploadError) {
            console.error("Failed to upload media:", uploadError);
            toast({
              title: "Upload failed",
              description: `Failed to upload ${item.name}. Post will be created without this media.`,
              variant: "destructive",
            });
          }
        }
        setMediaUploadComplete(true);
      }

      // Step 2: Server-side moderation
      setSubmitState("evaluating");

      const result = await createModeratedPost({
        title: postTitle,
        content: postContent,
        authorId: user._id as Id<"users">,
        category: postCategory,
        tags: [],
        media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
      });

      setEvaluationComplete(true);

      // Handle moderation result
      if (!result.success) {
        // User-friendly messages based on rejection reason
        const friendlyMessages: Record<
          string,
          {
            title: string;
            description: string;
            icon: string;
            variant?: "default" | "destructive";
          }
        > = {
          rate_limited: {
            title: "Slow Down!",
            description:
              "You're posting too quickly. Please wait a moment before trying again.",
            icon: "⏳",
            variant: "default",
          },
          pending_review: {
            title: "Under Review",
            description:
              "Your post is being reviewed by our team. You'll be notified once it's approved.",
            icon: "👀",
            variant: "default",
          },
          content_rejected: {
            title: "Post Not Published",
            description:
              result.message ||
              "Your post doesn't meet our community guidelines. Please review and revise.",
            icon: "❌",
          },
          comment_rejected: {
            title: "Comment Not Published",
            description:
              result.message || "Your comment doesn't meet our guidelines.",
            icon: "❌",
          },
        };

        const msg = friendlyMessages[result.reason || "content_rejected"] ||
          friendlyMessages.content_rejected || {
            title: "Post Not Published",
            description:
              "Your post doesn't meet our community guidelines. Please review and revise.",
            icon: "❌",
          };

        toast({
          title: `${msg.icon} ${msg.title}`,
          description: msg.description,
          variant: msg.variant || "destructive",
        });

        // Set inline error for form feedback
        if (result.reason === "content_rejected") {
          setModerationError({
            field: "content",
            message: msg.description,
          });
        }

        setIsAnalyzing(false);
        setSubmitState("idle");
        return;
      }

      // Step 3: Success!
      setSubmitState("submitting");

      // Clear form
      setPostTitle("");
      setPostContent("");
      setPostCategory("general");
      mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setMediaItems([]);
      setIsCreateModalOpen(false);

      toast({
        title: "✨ Post Created!",
        description:
          uploadedMedia.length > 0
            ? `+5 points for creating a post with ${uploadedMedia.length} media file(s)!`
            : "+5 points for creating a post!",
      });
    } catch (error) {
      console.error("Post creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setSubmitState("idle");
      setMediaUploadComplete(false);
      setEvaluationComplete(false);
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
    media: post.media,
  }));

  const communityActivity = userStats?.communityActivity;

  return (
    <SidebarLayout>
      <div className="h-full overflow-auto bg-slate-50/50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Header - stacks on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-b-[4px] sm:border-b-[6px] border-blue-200 bg-white text-blue-500 shadow-sm shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 stroke-3" />
              </div>
              <div>
                <h1
                  className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight"
                  data-testid="text-community-title"
                >
                  Community
                </h1>
                <p
                  className="text-sm sm:text-lg font-medium text-slate-500"
                  data-testid="text-community-subtitle"
                >
                  Connect, share, and earn points.
                </p>
              </div>
            </div>
            <JuicyButton
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 w-full sm:w-auto"
              data-testid="button-create-post"
            >
              <Plus className="h-5 w-5 stroke-3" />
              Create Post
            </JuicyButton>
          </div>

          {/* Community Guidelines */}
          <div className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-300 bg-white/50 p-3 sm:p-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="rules" className="border-none">
                <AccordionTrigger className="hover:no-underline py-1.5 sm:py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">
                    <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">
                      Community Guidelines
                    </span>
                    <span className="sm:hidden">Guidelines</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 pt-2">
                    {AI_REVIEW_RULES.map((rule) => (
                      <div
                        key={rule.title}
                        className="rounded-lg sm:rounded-xl border-2 border-slate-100 bg-white p-2.5 sm:p-3"
                      >
                        <p className="text-xs sm:text-sm font-extrabold text-slate-700 mb-0.5 sm:mb-1">
                          {rule.title}
                        </p>
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-relaxed">
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
            <div className="rounded-2xl sm:rounded-3xl border-2 border-b-[4px] sm:border-b-[6px] border-slate-200 bg-white px-4 sm:px-6 py-2 sm:py-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="stats" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 sm:gap-3 text-left">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-yellow-100 text-yellow-600 shrink-0">
                        <Award className="h-5 w-5 sm:h-6 sm:w-6 stroke-3" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-700">
                        Your Stats
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 pt-2 pb-2">
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100">
                        <div
                          className="text-lg sm:text-2xl font-black text-blue-500"
                          data-testid="text-community-score"
                        >
                          {communityActivity.communityScore}
                        </div>
                        <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 sm:mt-1">
                          Score
                        </div>
                      </div>
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100">
                        <div className="text-lg sm:text-2xl font-black text-green-500">
                          {communityActivity.upvotesReceived}
                        </div>
                        <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 sm:mt-1">
                          Upvotes
                        </div>
                      </div>
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100">
                        <div className="text-lg sm:text-2xl font-black text-red-500">
                          {communityActivity.downvotesReceived}
                        </div>
                        <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 sm:mt-1">
                          <span className="hidden sm:inline">Downvotes</span>
                          <span className="sm:hidden">Down</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100">
                        <div className="text-lg sm:text-2xl font-black text-purple-500">
                          {communityActivity.postsCreated}
                        </div>
                        <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 sm:mt-1">
                          Posts
                        </div>
                      </div>
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100">
                        <div className="text-lg sm:text-2xl font-black text-orange-500">
                          {communityActivity.helpfulAnswers}
                        </div>
                        <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 sm:mt-1">
                          Helpful
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Topic filters - scrollable on mobile */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              const isSelected = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border-2 border-b-[3px] sm:border-b-4 whitespace-nowrap shrink-0",
                    isSelected
                      ? "bg-slate-800 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-3" />
                  <span className="hidden xs:inline">{topic.name}</span>
                  <span className="xs:hidden">
                    {topic.id === "all" ? "All" : topic.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Posts list */}
          <div className="space-y-4 sm:space-y-6">
            {posts.length === 0 ? (
              <div className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 sm:p-12 text-center">
                <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-slate-100">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-700">
                  No posts yet
                </h3>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
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
        <DialogContent className="fixed z-50 w-full h-[100dvh] sm:h-auto max-w-none sm:max-w-[600px] p-0 overflow-hidden sm:rounded-3xl border-0 sm:border-2 border-slate-200 bg-white shadow-xl sm:m-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 rounded-none gap-0 flex flex-col [&>button:last-child]:hidden sm:[&>button:last-child]:flex">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b-2 border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-slate-800">
                Create Post
              </DialogTitle>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="sm:hidden text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Title
                </label>
                <Input
                  placeholder="What's on your mind?"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-slate-200 bg-slate-50 px-3 sm:px-4 text-sm sm:text-base font-bold text-slate-700 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-0"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Category
                </label>
                <Select value={postCategory} onValueChange={setPostCategory}>
                  <SelectTrigger className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-slate-200 bg-slate-50 text-sm sm:text-base font-bold text-slate-700 focus:ring-0">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg sm:rounded-xl border-2 border-slate-200 font-bold">
                    {POST_CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="focus:bg-slate-50 cursor-pointer text-sm"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Content
                </label>
                <Textarea
                  placeholder="Share your thoughts, prompts, or questions..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[120px] sm:min-h-[150px] rounded-lg sm:rounded-xl border-2 border-slate-200 bg-slate-50 p-3 sm:p-4 text-sm sm:text-base font-medium text-slate-700 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-0 resize-none"
                />
              </div>

              {/* Processing Media Indicator (shows immediately when files selected) */}
              {isProcessingMedia && !isCompressingVideo && (
                <div className="bg-slate-100 border-2 border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">
                        Processing media...
                      </p>
                      <p className="text-xs text-slate-500">
                        Preparing your file for upload
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Compression Progress */}
              {isCompressingVideo && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-blue-700">
                        Optimizing video...
                      </p>
                      <p className="text-xs text-blue-500">
                        This may take a moment for larger videos
                      </p>
                    </div>
                    <span className="text-sm font-black text-blue-600">
                      {compressionProgress}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${compressionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Media Preview Area */}
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-200"
                    >
                      {item.kind === "video" ? (
                        <video
                          src={item.previewUrl}
                          className="h-full w-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={item.previewUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      )}
                      {/* Duration badge for videos */}
                      {item.kind === "video" && item.duration && (
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white">
                          {Math.floor(item.duration / 60)}:
                          {String(Math.floor(item.duration % 60)).padStart(
                            2,
                            "0"
                          )}
                        </div>
                      )}
                      {/* Compression badge */}
                      {item.compressed && item.originalSizeMb && (
                        <div className="absolute bottom-1 right-8 px-1.5 py-0.5 rounded bg-green-500/90 text-[10px] font-bold text-white flex items-center gap-0.5">
                          <Zap className="h-2.5 w-2.5" />
                          {(
                            (1 - item.sizeMb / item.originalSizeMb) *
                            100
                          ).toFixed(0)}
                          % smaller
                        </div>
                      )}
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
                  disabled={isCompressingVideo || isProcessingMedia}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2 sm:px-3 py-2 text-sm font-bold transition-colors",
                    isCompressingVideo || isProcessingMedia
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <ImageIcon className="h-5 w-5" />
                  {isCompressingVideo || isProcessingMedia
                    ? "Processing..."
                    : "Add Media"}
                </button>
                <div className="text-[10px] sm:text-xs text-slate-400 text-right">
                  <span className="hidden sm:inline">
                    Max: {MAX_IMAGE_FILES} images or 1 video (
                    {MAX_VIDEO_DURATION_SECONDS}s)
                  </span>
                  <span className="sm:hidden">
                    Max {MAX_IMAGE_FILES} imgs / 1 vid
                  </span>
                </div>
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

            {/* Progress Indicator (for posts with media or during moderation) */}
            {submitState !== "idle" && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-200">
                <div className="space-y-2">
                  {mediaItems.length > 0 && (
                    <div className="flex items-center gap-3">
                      {mediaUploadComplete ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : submitState === "uploading" ? (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-medium",
                          mediaUploadComplete && "text-green-600",
                          submitState === "uploading" && "text-blue-600",
                          !mediaUploadComplete &&
                            submitState !== "uploading" &&
                            "text-slate-400"
                        )}
                      >
                        Uploading media
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {evaluationComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : submitState === "evaluating" ? (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        evaluationComplete && "text-green-600",
                        submitState === "evaluating" && "text-blue-600",
                        !evaluationComplete &&
                          submitState !== "evaluating" &&
                          "text-slate-400"
                      )}
                    >
                      Checking content policy
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {submitState === "submitting" ? (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        submitState === "submitting"
                          ? "text-blue-600"
                          : "text-slate-400"
                      )}
                    >
                      Publishing to community
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  This helps keep our community safe and welcoming ✨
                </p>
              </div>
            )}

            {/* Moderation Error Inline Feedback */}
            {moderationError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">
                    {moderationError.field === "title"
                      ? "Title issue:"
                      : "Content issue:"}
                  </p>
                  <p className="text-sm text-red-600">
                    {moderationError.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModerationError(null)}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t-2 border-slate-100 shrink-0 p-4 sm:p-0 bg-white sm:bg-transparent">
              <JuicyButton
                onClick={handleCreatePost}
                disabled={
                  !postTitle.trim() ||
                  !postContent.trim() ||
                  isAnalyzing ||
                  isCompressingVideo ||
                  isProcessingMedia
                }
                className="w-full sm:w-auto gap-2"
              >
                {submitState === "idle" && !isAnalyzing && (
                  <>
                    <Send className="h-5 w-5" />
                    Create Post
                  </>
                )}
                {(submitState === "uploading" || isProcessingMedia) && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading media...
                  </>
                )}
                {submitState === "evaluating" && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Evaluating content...
                  </>
                )}
                {submitState === "submitting" && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Publishing...
                  </>
                )}
                {isCompressingVideo && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Compressing video...
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
