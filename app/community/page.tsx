"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Bookmark,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useToast } from "@/hooks/use-toast";
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

function PostCard({
  post,
  userVote,
  onVote,
  currentUserId,
}: {
  post: CommunityPost;
  userVote: "up" | "down" | null;
  onVote: (postId: string, voteType: "up" | "down") => void;
  currentUserId?: string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const netScore = post.upvotes - post.downvotes;
  const isCurrentUser = post.authorId === currentUserId;

  return (
    <Card className="hover-elevate transition-all">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold" data-testid={`text-post-author-${post._id}`}>
                  {post.author.name}
                  {isCurrentUser && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      You
                    </Badge>
                  )}
                </h4>
                {post.author.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {post.author.badge}
                  </Badge>
                )}
                {post.trending && (
                  <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{post.author.level}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.timestamp}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">
            {POST_CATEGORIES.find((c) => c.id === post.category)?.name || post.category}
          </Badge>
        </div>
        {post.title && (
          <h3 className="text-lg font-bold mt-3" data-testid={`text-post-title-${post._id}`}>
            {post.title}
          </h3>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed" data-testid={`text-post-content-${post._id}`}>
          {post.content}
        </p>

        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2", userVote === "up" && "text-primary bg-primary/10")}
              onClick={() => onVote(post._id, "up")}
              data-testid={`button-upvote-${post._id}`}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span
              className={cn(
                "font-bold min-w-[2rem] text-center text-sm",
                netScore > 0 && "text-primary",
                netScore < 0 && "text-destructive",
              )}
              data-testid={`text-vote-score-${post._id}`}
            >
              {netScore > 0 ? `+${netScore}` : netScore}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2", userVote === "down" && "text-destructive bg-destructive/10")}
              onClick={() => onVote(post._id, "down")}
              data-testid={`button-downvote-${post._id}`}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="gap-2" data-testid={`button-comment-${post._id}`}>
            <MessageSquare className="h-4 w-4" />
            <span className="font-semibold">{post.replyCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-2", isBookmarked && "text-primary")}
            onClick={() => setIsBookmarked(!isBookmarked)}
            data-testid={`button-bookmark-${post._id}`}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            <span className="font-semibold">{post.bookmarks}</span>
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" size="sm" data-testid={`button-share-${post._id}`}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Community() {
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("general");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const postsData = useQuery(api.posts.getPosts, {
    category: selectedTopic === "all" ? undefined : selectedTopic,
    limit: 50,
  });

  const userStats = useQuery(
    api.users.getUserStats,
    user?._id ? { userId: user._id as Id<"users"> } : "skip",
  );

  const createPostMutation = useMutation(api.posts.createPost);
  const votePostMutation = useMutation(api.posts.votePost);

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

  const handleCreatePost = async () => {
    if (!user?._id || !postTitle.trim() || !postContent.trim()) return;

    try {
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
      setIsCreateModalOpen(false);

      toast({
        title: "Post Created!",
        description: "+10 points for creating a post!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const posts: CommunityPost[] = (postsData || []).map((post) => ({
    _id: post._id,
    authorId: post.authorId,
    author: {
      name: post.author?.name || "Anonymous",
      avatar: post.author?.image,
      level: "Member",
      badge: "",
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
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gradient-from to-gradient-to flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight" data-testid="text-community-title">
                  Community
                </h1>
                <p className="text-muted-foreground" data-testid="text-community-subtitle">
                  Connect, share, and earn points with fellow prompt engineers
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
              data-testid="button-create-post"
            >
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </div>

          {communityActivity && (
            <Card className="border-2 border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5" />
                  Your Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="text-community-score">
                      {communityActivity.communityScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Community Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {communityActivity.upvotesReceived}
                    </div>
                    <div className="text-xs text-muted-foreground">Upvotes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {communityActivity.downvotesReceived}
                    </div>
                    <div className="text-xs text-muted-foreground">Downvotes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient-from">
                      {communityActivity.postsCreated}
                    </div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient-to">
                      {communityActivity.helpfulAnswers}
                    </div>
                    <div className="text-xs text-muted-foreground">Helpful Answers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2">
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <Button
                  key={topic.id}
                  variant={selectedTopic === topic.id ? "default" : "outline"}
                  size="sm"
                  className="gap-2 shrink-0"
                  onClick={() => setSelectedTopic(topic.id)}
                  data-testid={`button-topic-${topic.id}`}
                >
                  <Icon className="h-4 w-4" />
                  {topic.name}
                </Button>
              );
            })}
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No posts yet. Be the first to share something!
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  userVote={null}
                  onVote={handleVote}
                  currentUserId={user?._id as string | undefined}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Share something with the community</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Catchy title for your post"
              value={postTitle}
              onChange={(event) => setPostTitle(event.target.value)}
              data-testid="input-post-title"
            />
            <Textarea
              placeholder="Share your insights, achievements, or questions..."
              className="min-h-[150px]"
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
              data-testid="textarea-post-content"
            />

            <Select value={postCategory} onValueChange={setPostCategory}>
              <SelectTrigger data-testid="select-post-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {POST_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Add media
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Send className="h-4 w-4" />
                  Ask AI to polish
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost} className="gap-2" data-testid="button-submit-post">
                  <Send className="h-4 w-4" />
                  Publish Post
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
