// src/components/CommunityHub.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, MessageCircle, Heart, Share2, Trophy, Plus, Search, X,
  Image as ImageIcon, Send, User, ThumbsUp, MessageSquare, Eye, Trash2,
  MoreVertical, Award, Crown, Medal
} from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './utils/ImageWithFallback';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

import { api, updateUserPoints } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface CommunityHubProps {
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  userPoints: number;
  onPointsUpdate: (points: number) => void;
}

interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface WorkoutMeta {
  name: string;
  duration: number;
  calories: number;
}

interface Post {
  id: string; // دايمًا string في الواجهة
  author: {
    name: string;
    avatar?: string;
    badge?: string;
    points?: number;
  };
  content: string;
  images?: string[];
  workout?: WorkoutMeta;
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  participants: number;
  endDate: string;
  progress: number;
  isJoined: boolean;
}

// نقاط النظام
const POINTS = {
  POST: 10,
  COMMENT: 5,
  LIKE_RECEIVED: 1,
  LIKE_GIVEN: 0, // ما نعطي نقاط للي يسوي لايك
};

export function CommunityHub({
  onLogout, isDarkMode, onToggleTheme, userPoints, onPointsUpdate
}: CommunityHubProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('feed');
const [usersPointsMap, setUsersPointsMap] = useState<any>({});

  const [currentUser, setCurrentUser] = useState(() => ({
    name: user ? `${user.firstName} ${user.lastName}` : "User",
    avatar: user?.avatar || "",
    badge: "Rising Star",
    points: user?.points ?? userPoints ?? 0,
  }));

  // فور ما يتحدث user من الـ Auth نخليه ينعكس هنا
  useEffect(() => {
    if (user) {
      setCurrentUser(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar || prev.avatar,
        points: typeof user.points === "number" ? user.points : prev.points,
      }));
    }
  }, [user]);

  // New post form state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState<{ [key: string]: string }>({});
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);

  // البيانات الفعلية للبوستات (بدون عينات وهمية)
  const [postsData, setPostsData] = useState<Post[]>([]);

  // مزامنة نقاط المستخدم مع الـ parent + السيرفر
  const syncUserPoints = (newPoints: number) => {
    setCurrentUser(prev => ({ ...prev, points: newPoints }));
    onPointsUpdate(newPoints);
  };

  const applyPointsDelta = async (delta: number) => {
    if (!delta) return;
    try {
      const res = await updateUserPoints(delta);
      // نفترض أن الـ API يرجع { ok: boolean, points: number }
      // @ts-ignore
      const newPoints = res.points;
      if (typeof newPoints === "number") {
        syncUserPoints(newPoints);
      }
    } catch (err) {
      console.error("❌ Failed to update points:", err);
      // نقدر هنا نعرض Toast أو Alert لو حبيت
    }
  };

  // تحميل البوستات من السيرفر
useEffect(() => {
  async function loadPosts() {
    try {
      // أولاً: تحميل البوستات
      const res = await api<{ ok: boolean; posts: any[] }>("/api/posts");

      if (res.ok) {
      setPostsData(
  res.posts.map((p) => ({
    id: p._id,
    author: {
      name: p.authorName || "Unknown",
      avatar: p.authorAvatar || "",
      badge: "Member",
    },
    content: p.content,
    images: p.images || [],
    likes: p.likes || 0,
    comments: (p.comments || []).map((c: any) => ({
      id: c._id,
      postId: p._id,
      author: {
        name: c.authorName || "User",
        avatar: c.authorAvatar || "",
      },
      content: c.content,
      timestamp: new Date(c.createdAt).toLocaleString(),
      likes: 0,
      isLiked: false,
    })),
    timestamp: new Date(p.createdAt).toLocaleString(),

    // 👇👇👇 THIS IS THE FIX 👇👇👇
isLiked: p.likedBy?.includes(user?._id) || false,
  }))
);

      }

      // ثانياً: تحميل نقاط جميع المستخدمين
      const usersRes = await api<{ ok: boolean; users: any[] }>("/api/users/stats");

      if (usersRes.ok) {
        const map: any = {};
        usersRes.users.forEach((u) => {
          map[u.fullName] = u.points;
        });
        setUsersPointsMap(map);
      }

    } catch (err) {
      console.error("❌ Error loading community data:", err);
    }
  }

  loadPosts();
}, []);


  // Scroll to highlighted post
  useEffect(() => {
    if (highlightedPostId && postRefs.current[highlightedPostId]) {
      postRefs.current[highlightedPostId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setHighlightedPostId(null), 2000);
    }
  }, [highlightedPostId]);

  // رفع الصور وتحويلها Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);

      for (const file of filesArray) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewPostImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && newPostImages.length === 0) return;

    try {
      const res = await api<{ ok: boolean; post: any }>("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          content: newPostContent,
          images: newPostImages,
        }),
      });

      if (res.ok && res.post) {
        const newPost: Post = {
          id: res.post._id,
          author: {
            name: currentUser.name,
            avatar: currentUser.avatar,
            badge: "Member",
            points: currentUser.points,
          },
          content: res.post.content,
          images: res.post.images,
          likes: 0,
          comments: [],
          timestamp: new Date(res.post.createdAt).toLocaleString(),
          isLiked: false,
        };

        setPostsData(prev => [newPost, ...prev]);

        // +10 نقاط لإنشاء بوست
        await applyPointsDelta(POINTS.POST);
      }
    } catch (err) {
      console.error("❌ Failed to create post:", err);
    }

    setNewPostContent('');
    setNewPostImages([]);
    setShowCreatePostDialog(false);
  };

  const handleLikePost = async (postId: string) => {
    setPostsData(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return { ...post, isLiked: !post.isLiked };
        }
        return post;
      })
    );

    // نرسل الطلب للسيرفر لتحديث عدد اللايكات
    try {
      const targetPost = postsData.find(p => p.id === postId);
      const isLiking = !targetPost?.isLiked;

      const endpoint = isLiking ? `/api/posts/${postId}/like` : `/api/posts/${postId}/unlike`;

      const res = await api<{ ok: boolean; likes: number }>(endpoint, {
        method: "POST",
      });

      if (res.ok) {
        setPostsData(prev =>
          prev.map(post =>
            post.id === postId
              ? { ...post, likes: res.likes, isLiked: isLiking }
              : post
          )
        );
      }
    } catch (err) {
      console.error("❌ Failed to like/unlike post:", err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentContent = newCommentContent[postId];
    if (!commentContent?.trim()) return;

    try {
      const res = await api<{ ok: boolean; comment: any }>(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentContent }),
      });

      if (res.ok && res.comment) {
        const c = res.comment;

        const newComment: Comment = {
          id: c._id || `${Date.now()}-${Math.random()}`,
          postId,
          author: {
            name: c.authorName || currentUser.name,
            avatar: c.authorAvatar || currentUser.avatar,
          },
          content: c.content,
          timestamp: new Date(c.createdAt).toLocaleString(),
          likes: c.likes || 0,
          isLiked: false,
        };

        setPostsData(prev =>
          prev.map(post =>
            post.id === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          )
        );

        setNewCommentContent(prev => ({ ...prev, [postId]: '' }));

        // +5 نقاط لإضافة تعليق
        await applyPointsDelta(POINTS.COMMENT);
      }
    } catch (err) {
      console.error("❌ Failed to add comment:", err);
    }
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    // لايكات الكومنتات حالياً محلية فقط (frontend)
    setPostsData(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                  }
                : comment
            ),
          };
        }
        return post;
      })
    );
  };

  const handleDeletePost = async (postId: string) => {
    const postToDelete = postsData.find((post) => post.id === postId);
    if (!postToDelete) {
      setDeletePostId(null);
      return;
    }

    try {
      await api(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      setPostsData((prev) => prev.filter((post) => post.id !== postId));
      setDeletePostId(null);

      // احسب عدد تعليقات المستخدم على هذا البوست
      const commentsCount =
        postToDelete.comments.filter((c) => c.author.name === currentUser.name).length || 0;

      const pointsToDeduct = POINTS.POST + commentsCount * POINTS.COMMENT;

      // خصم النقاط من السيرفر
      await applyPointsDelta(-pointsToDeduct);
    } catch (err) {
      console.error("❌ Failed to delete post:", err);
      alert("Failed to delete the post. Server did not respond.");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await api(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });

      setPostsData(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, comments: post.comments.filter(c => c.id !== commentId) }
            : post
        )
      );

      // خصم -5 نقاط
      await applyPointsDelta(-POINTS.COMMENT);
    } catch (err) {
      console.error("❌ Failed to delete comment:", err);
      alert("Failed to delete the comment.");
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Trophy className="w-4 h-4 text-muted-foreground" />;
  };

const topContributors = React.useMemo(() => {
  const contributors = [...postsData]
    .map(post => post.author)
    .reduce((acc: any[], author) => {
      const existing = acc.find(a => a.name === author.name);

      const realPoints = usersPointsMap[author.name] ?? 0;

      if (!existing) {
        // لو أول مرة نشوف هذا اليوزر → نحط نقاطه الحقيقية
        acc.push({
          ...author,
          points: realPoints,
        });
      } else {
        // لو موجود → نحدث نقاطه
        existing.points = realPoints;
      }

      return acc;
    }, []);

  // إضافة المستخدم الحالي لو مو موجود
  const userInList = contributors.find(c => c.name === currentUser.name);
  if (!userInList) {
    contributors.push({
      ...currentUser,
      points: usersPointsMap[currentUser.name] ?? currentUser.points ?? 0,
    });
  } else {
    userInList.points = usersPointsMap[currentUser.name] ?? currentUser.points ?? 0;
  }

  return contributors
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 5);
}, [postsData, currentUser, usersPointsMap]);


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Community Hub
                </h1>
                <p className="text-sm text-muted-foreground">
                  Connect with fitness enthusiasts worldwide
                </p>
              </div>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Your Points</p>
                  <p className="text-2xl">{currentUser.points}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed">Community Feed</TabsTrigger>
              <TabsTrigger value="activity">My Activity</TabsTrigger>
              <TabsTrigger value="contributors">Top Contributors</TabsTrigger>
            </TabsList>

            {/* FEED */}
            <TabsContent value="feed" className="space-y-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-accent/5">
                <CardHeader>
                  <CardTitle>Share Your Progress</CardTitle>
                  <CardDescription>Post updates, achievements, or motivation!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Avatar>
                      {currentUser.avatar ? (
                        <AvatarImage src={currentUser.avatar} />
                      ) : (
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => setShowCreatePostDialog(true)}
                      >
                        What's on your mind?
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {postsData.map((post) => (
                <div
                  key={post.id}
                  ref={(el) => {
                    postRefs.current[post.id] = el;
                  }}
                >
                  <Card
                    className={`${highlightedPostId === post.id ? 'ring-2 ring-primary' : ''} transition-all`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {post.author.avatar ? (
                              <AvatarImage src={post.author.avatar} />
                            ) : (
                              <AvatarFallback>
                                {post.author.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p>{post.author.name}</p>
                              {post.author.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {post.author.badge}
                                </Badge>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Trophy className="w-3 h-3" />
                                <span>{post.author.points || 0} pts</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                          </div>
                        </div>
                        {post.author.name === currentUser.name && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletePostId(post.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p>{post.content}</p>

                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.map((image, idx) => (
                            <ImageWithFallback
                              key={idx}
                              src={image}
                              alt="Post image"
                              className="rounded-lg w-full h-48 object-cover"
                            />
                          ))}
                        </div>
                      )}

                      {post.workout && (
                        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Workout</p>
                                <p>{post.workout.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  {post.workout.duration} min
                                </p>
                                <p className="text-sm">{post.workout.calories} cal</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Separator />

                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className={post.isLiked ? 'text-primary' : ''}
                        >
                          <Heart
                            className={`w-4 h-4 mr-2 ${
                              post.isLiked ? 'fill-current' : ''
                            }`}
                          />
                          {post.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowComments(showComments === post.id ? null : post.id)
                          }
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {post.comments.length}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      {showComments === post.id && (
                        <div className="space-y-4 pt-4 border-t">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="w-8 h-8">
                                {comment.author.avatar ? (
                                  <AvatarImage src={comment.author.avatar} />
                                ) : (
                                  <AvatarFallback className="text-xs">
                                    {comment.author.name.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-accent/50 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm mb-1">{comment.author.name}</p>
                                    {comment.author.name === currentUser.name && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive"
                                        onClick={() =>
                                          handleDeleteComment(post.id, comment.id)
                                        }
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-1 px-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => handleLikeComment(post.id, comment.id)}
                                  >
                                    <ThumbsUp
                                      className={`w-3 h-3 mr-1 ${
                                        comment.isLiked
                                          ? 'fill-current text-primary'
                                          : ''
                                      }`}
                                    />
                                    {comment.likes > 0 && comment.likes}
                                  </Button>
                                  <span className="text-xs text-muted-foreground">
                                    {comment.timestamp}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              {currentUser.avatar ? (
                                <AvatarImage src={currentUser.avatar} />
                              ) : (
                                <AvatarFallback className="text-xs">
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <Input
                                placeholder="Write a comment..."
                                value={newCommentContent[post.id] || ''}
                                onChange={(e) =>
                                  setNewCommentContent(prev => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post.id);
                                  }
                                }}
                              />
                              <Button
                                size="icon"
                                onClick={() => handleAddComment(post.id)}
                                disabled={!newCommentContent[post.id]?.trim()}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </TabsContent>

            {/* MY ACTIVITY */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Activity</CardTitle>
                  <CardDescription>Posts and comments you've made</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
  {(() => {
    // 🔥 بوستاتك
    const myPosts = postsData.filter(
      (p) => p.author.name === currentUser.name
    );

    // 🔥 تعليقاتك في أي بوست
    const myComments = postsData
      .flatMap((post) =>
        post.comments
          .filter((c) => c.author.name === currentUser.name)
          .map((c) => ({
            ...c,
            parentPost: post, // البوست اللي فيه التعليق
          }))
      );

    if (myPosts.length === 0 && myComments.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-8">
          You haven't posted or commented anything yet.
        </p>
      );
    }

    return (
      <>
        {/* 📝 My Posts */}
        {myPosts.map((post) => (
          <Card
            key={post.id}
            className="cursor-pointer hover:bg-accent/50"
            onClick={() => {
              setActiveTab("feed");
              setHighlightedPostId(post.id);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {post.timestamp}
                  </p>
                  <p className="line-clamp-2">{post.content}</p>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* 💬 My Comments */}
        {myComments.map((c) => (
          <Card
            key={c.id}
            className="cursor-pointer hover:bg-accent/50"
            onClick={() => {
              setActiveTab("feed");
              setHighlightedPostId(c.parentPost.id);
              setShowComments(c.parentPost.id);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Commented on "{c.parentPost.content.slice(0, 40)}..."
                  </p>
                  <p className="line-clamp-2">{c.content}</p>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  })()}
</div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* TOP CONTRIBUTORS */}
            <TabsContent value="contributors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                  <CardDescription>
                    Community members with the most points from posts, comments, and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topContributors.map((contributor, index) => (
                      <div
                        key={contributor.name}
                        className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-primary/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(index + 1)}
                          </div>
                          <Avatar>
                            {contributor.avatar ? (
                              <AvatarImage src={contributor.avatar} />
                            ) : (
                              <AvatarFallback>
                                {contributor.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p>{contributor.name}</p>
                              {contributor.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {contributor.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Rank #{index + 1}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            <span className="text-xl">{contributor.points || 0}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardHeader>
                  <CardTitle>How to Earn Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <span>Create a post</span>
                      </div>
                      <Badge>+{POINTS.POST} pts</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <span>Add a comment</span>
                      </div>
                      <Badge>+{POINTS.COMMENT} pts</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-primary" />
                        <span>Receive a like</span>
                      </div>
                      <Badge>+{POINTS.LIKE_RECEIVED} pt</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePostDialog} onOpenChange={setShowCreatePostDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>
              Share your fitness journey, achievements, or tips with the community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Share your fitness journey, achievements, or tips..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={5}
            />

            {newPostImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {newPostImages.map((image, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={image}
                      alt=""
                      className="rounded-lg w-full h-32 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Images
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreatePostDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() && newPostImages.length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post (+{POINTS.POST} pts)
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone and
              you will lose {POINTS.POST} points plus any points from comments on this post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && handleDeletePost(deletePostId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
