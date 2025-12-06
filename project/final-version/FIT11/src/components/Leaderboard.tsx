// src/components/Leaderboard.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  Gift,
  Star,
  TrendingUp,
  Target,
  Play,
  CheckCircle2,
  Zap,
  Award,
  Check,
} from "lucide-react";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

import { updateUserPoints } from "../lib/api";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface LeaderboardProps {
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  userPoints: number;
  onPointsUpdate: (points: number) => void;
  leaderboardRank?: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  streak: number;
  workoutsCompleted: number;
  badge?: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  points: number;
  progress: number;
  total: number;
  unit: string;
  completed: boolean;
  joined: boolean;
  type: "distance" | "count" | "calories" | "time";
  icon: string;
}

interface Reward {
  id: string;
  name: string;
  points: number;
  category: string;
  available: boolean;
}

export function Leaderboard({
  onLogout,
  isDarkMode,
  onToggleTheme,
  userPoints,
  onPointsUpdate,
}: LeaderboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth(); // 🧑‍💻 المستخدم الحالي من السياق

  const [activeTab, setActiveTab] = useState("leaderboard");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [progressInput, setProgressInput] = useState("");
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);

  const [showCongratulationDialog, setShowCongratulationDialog] =
    useState(false);
  const [redeemedItem, setRedeemedItem] = useState<Reward | null>(null);

  const [spentPoints, setSpentPoints] = useState(0);

  // بيانات افتراضية
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([
    {
      id: "1",
      name: "Alex Johnson",
      points: 2450,
      rank: 1,
      streak: 28,
      workoutsCompleted: 45,
      badge: "Champion",
    },
    {
      id: "2",
      name: "Sarah Chen",
      points: 2380,
      rank: 2,
      streak: 21,
      workoutsCompleted: 42,
      badge: "Warrior",
    },
    {
      id: "3",
      name: "Mike Rodriguez",
      points: 2210,
      rank: 3,
      streak: 15,
      workoutsCompleted: 38,
      badge: "Fighter",
    },
    {
      id: "4",
      name: "Emma Wilson",
      points: 2100,
      rank: 4,
      streak: 19,
      workoutsCompleted: 35,
    },
    {
      id: "5",
      name: "David Park",
      points: 1950,
      rank: 5,
      streak: 12,
      workoutsCompleted: 32,
    },
    {
      id: "6",
      name: "Lisa Thompson",
      points: 1820,
      rank: 6,
      streak: 8,
      workoutsCompleted: 28,
    },
    {
      id: "7",
      name: "James Wilson",
      points: 1750,
      rank: 7,
      streak: 14,
      workoutsCompleted: 26,
    },
  ]);

  // 🔥 جلب المستخدمين الحقيقيين من الـ API ودمجهم مع الوهميين
  useEffect(() => {
    async function loadRealUsers() {
      try {
        const res = await api<{ ok: boolean; users: any[] }>("/api/users/stats");

        if (res.ok) {
          const realUsers: LeaderboardEntry[] = res.users.map((u: any) => ({
            id: u.id,
            name: u.fullName,
            avatar: u.avatar || "",
            points: u.points || 0,
            workoutsCompleted: u.stats?.posts || 0,
            streak: u.stats?.comments || 0,
            badge: u.id === user?._id ? "Premium" : "",
            rank: 0, // سيتم حسابه لاحقًا في useMemo
          }));

          setLeaderboardData((prev) => {
            const merged = [...prev];

            realUsers.forEach((u) => {
              // دمج بدون تكرار حسب الـ id
              if (!merged.some((x) => x.id === u.id)) {
                merged.push(u);
              }
            });

            return merged;
          });
        }
      } catch (err) {
        console.error("❌ Failed to load real leaderboard users", err);
      }
    }

    loadRealUsers();
  }, [user]);

  // ترتيب + إعطاء rank
  const sortedLeaderboard = useMemo(() => {
    return [...leaderboardData]
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }, [leaderboardData]);

  // صف المستخدم الحالي
  const currentUserEntry = sortedLeaderboard.find(
    (e) => e.id === user?._id
  );

  const userRank = currentUserEntry?.rank ?? 0;
  const currentPoints = currentUserEntry?.points ?? userPoints;
  const lifetimePoints = currentPoints + spentPoints;

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "1",
      name: "5K Run Challenge",
      description: "Complete a 5 km run",
      points: 100,
      progress: 0,
      total: 5,
      unit: "km",
      completed: false,
      joined: false,
      type: "distance",
      icon: "🏃",
    },
    {
      id: "2",
      name: "10K Walk Challenge",
      description: "Walk a total of 10 kilometers",
      points: 150,
      progress: 0,
      total: 10,
      unit: "km",
      completed: false,
      joined: false,
      type: "distance",
      icon: "🚶",
    },
    {
      id: "3",
      name: "30-Day Workout Streak",
      description: "Complete a workout for 30 consecutive days",
      points: 500,
      progress: 0,
      total: 30,
      unit: "days",
      completed: false,
      joined: false,
      type: "count",
      icon: "🔥",
    },
    {
      id: "4",
      name: "Strength Master",
      description: "Complete 20 strength training workouts",
      points: 300,
      progress: 0,
      total: 20,
      unit: "workouts",
      completed: false,
      joined: false,
      type: "count",
      icon: "💪",
    },
    {
      id: "5",
      name: "Cardio King",
      description: "Burn 5000 calories through cardio workouts",
      points: 400,
      progress: 0,
      total: 5000,
      unit: "calories",
      completed: false,
      joined: false,
      type: "calories",
      icon: "🔥",
    },
    {
      id: "6",
      name: "Marathon Ready",
      description: "Run a total of 42 kilometers",
      points: 600,
      progress: 0,
      total: 42,
      unit: "km",
      completed: false,
      joined: false,
      type: "distance",
      icon: "🏃‍♂️",
    },
    {
      id: "7",
      name: "100 Push-ups Challenge",
      description: "Do 100 push-ups in one session",
      points: 200,
      progress: 0,
      total: 100,
      unit: "reps",
      completed: false,
      joined: false,
      type: "count",
      icon: "💪",
    },
    {
      id: "8",
      name: "Yoga Master",
      description: "Complete 15 yoga sessions",
      points: 250,
      progress: 0,
      total: 15,
      unit: "sessions",
      completed: false,
      joined: false,
      type: "count",
      icon: "🧘",
    },
  ]);

  const rewards: Reward[] = [
    {
      id: "1",
      name: "Fit11 Water Bottle",
      points: 500,
      category: "Merchandise",
      available: true,
    },
    {
      id: "2",
      name: "Premium Workout Towel",
      points: 300,
      category: "Merchandise",
      available: true,
    },
    {
      id: "3",
      name: "Fit11 T-Shirt",
      points: 800,
      category: "Apparel",
      available: true,
    },
    {
      id: "4",
      name: "Resistance Band Set",
      points: 1200,
      category: "Equipment",
      available: false,
    },
  ];

  const handleJoinChallenge = (challenge: Challenge) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challenge.id ? { ...c, joined: true } : c))
    );
  };

  const handleOpenChallengeDialog = (challenge: Challenge) => {
    if (!challenge.joined) handleJoinChallenge(challenge);
    setSelectedChallenge(challenge);
    setProgressInput("");
    setShowChallengeDialog(true);
  };

  const handleSubmitProgress = async () => {
    if (!selectedChallenge || !progressInput) return;
    const inputValue = parseFloat(progressInput);
    if (isNaN(inputValue) || inputValue <= 0) return;

    let earned = 0;

    setChallenges((prevChallenges) =>
      prevChallenges.map((c) => {
        if (c.id === selectedChallenge.id) {
          const newProgress = Math.min(c.progress + inputValue, c.total);
          const isCompleted = newProgress >= c.total;
          if (isCompleted && !c.completed) {
            earned = c.points;
          }
          return { ...c, progress: newProgress, completed: isCompleted };
        }
        return c;
      })
    );

    if (earned > 0) {
      try {
        await updateUserPoints(earned);
      } catch (e) {
        console.error("Failed to update points on server", e);
      }
      onPointsUpdate(userPoints + earned);

      // 🔥 حدّث نقاط المستخدم في الليدر بورد محليًا
      if (user?._id) {
        setLeaderboardData((prev) =>
          prev.map((entry) =>
            entry.id === user._id
              ? { ...entry, points: entry.points + earned }
              : entry
          )
        );
      }
    }

    setShowChallengeDialog(false);
    setSelectedChallenge(null);
    setProgressInput("");
  };

  const handleRedeem = async (reward: Reward) => {
    if (!reward.available) return;
    if (currentPoints < reward.points) return;

    try {
      await updateUserPoints(-reward.points);
    } catch (e) {
      console.error("Failed to update points on server", e);
    }

    onPointsUpdate(currentPoints - reward.points);
    setSpentPoints((prev) => prev + reward.points);
    setRedeemedItem(reward);

    // 🔥 خصم النقاط من المستخدم في الليدر بورد محليًا
    if (user?._id) {
      setLeaderboardData((prev) =>
        prev.map((entry) =>
          entry.id === user._id
            ? { ...entry, points: entry.points - reward.points }
            : entry
        )
      );
    }

    setShowCongratulationDialog(true);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm">{rank}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Champion":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Warrior":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Fighter":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Premium":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const myChallenges = challenges.filter((c) => c.joined);
  const availableChallenges = challenges.filter((c) => !c.joined);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  Leaderboard & Challenges
                </h1>
                <p className="text-sm text-muted-foreground">
                  Compete, challenge yourself, and earn rewards
                </p>
              </div>
            </div>
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Balance
                  </p>
                  <p className="text-2xl">{currentPoints}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="challenges">
                Challenges
                {myChallenges.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {myChallenges.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
            </TabsList>

            {/* Leaderboard */}
            <TabsContent value="leaderboard" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Your Rank
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl mb-2">#{userRank}</div>
                    <p className="text-sm text-muted-foreground">
                      Out of 127 members
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Lifetime Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl mb-2">{lifetimePoints}</div>
                    <p className="text-sm text-muted-foreground">
                      Total points earned
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl mb-2">12</div>
                    <p className="text-sm text-muted-foreground">
                      Days in a row
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Global Leaderboard</CardTitle>
                  <CardDescription>
                    See how you stack up against others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedLeaderboard.map((entry: LeaderboardEntry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          entry.id === user?._id
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-accent/50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 flex items-center justify-center">
                            {getRankIcon(entry.rank)}
                          </div>
                          <Avatar>
                            {entry.avatar ? (
                              <img
                                src={entry.avatar}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <AvatarFallback>
                                {entry.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                className={
                                  entry.id === user?._id ? "font-bold" : ""
                                }
                              >
                                {entry.name}
                              </p>
                              {entry.badge && (
                                <Badge
                                  className={getBadgeColor(entry.badge)}
                                >
                                  {entry.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {entry.workoutsCompleted} workouts •{" "}
                              {entry.streak} day streak
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            <span className="text-xl">{entry.points}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Challenges */}
            <TabsContent value="challenges" className="space-y-6">
              {myChallenges.length > 0 && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    My Active Challenges
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {myChallenges.map((challenge) => (
                      <Card
                        key={challenge.id}
                        className="border-2 border-primary/30 bg-gradient-to-br from-card to-accent/10"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">
                                {challenge.icon}
                              </span>
                              <div>
                                <CardTitle className="text-lg">
                                  {challenge.name}
                                </CardTitle>
                                <CardDescription>
                                  {challenge.description}
                                </CardDescription>
                              </div>
                            </div>
                            {challenge.completed && (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>
                                {challenge.progress} / {challenge.total}{" "}
                                {challenge.unit}
                              </span>
                            </div>
                            <Progress
                              value={
                                (challenge.progress / challenge.total) * 100
                              }
                              className="h-3"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary">
                              <Award className="w-5 h-5" />
                              <span className="text-xl">
                                {challenge.points} pts
                              </span>
                            </div>
                            <Button
                              onClick={() =>
                                handleOpenChallengeDialog(challenge)
                              }
                              disabled={challenge.completed}
                              className="shadow-lg shadow-primary/30"
                            >
                              {challenge.completed ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Update Progress
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Available Challenges
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {availableChallenges.map((challenge) => (
                    <Card
                      key={challenge.id}
                      className="hover:border-primary/50 transition-colors"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{challenge.icon}</span>
                          <div>
                            <CardTitle className="text-lg">
                              {challenge.name}
                            </CardTitle>
                            <CardDescription>
                              {challenge.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary">
                            <Award className="w-5 h-5" />
                            <span className="text-xl">
                              {challenge.points} pts
                            </span>
                          </div>
                          <Button
                            onClick={() =>
                              handleOpenChallengeDialog(challenge)
                            }
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Challenge
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Rewards */}
            <TabsContent value="rewards" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Redeem Rewards</CardTitle>
                  <CardDescription>
                    Use your points to get exclusive Fit11 merchandise and
                    equipment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {rewards.map((reward) => (
                      <Card
                        key={reward.id}
                        className={!reward.available ? "opacity-50" : ""}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3>{reward.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {reward.category}
                              </p>
                            </div>
                            <Gift className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary">
                              <Trophy className="w-5 h-5" />
                              <span className="text-xl">
                                {reward.points} pts
                              </span>
                            </div>
                            <Button
                              onClick={() => handleRedeem(reward)}
                              disabled={
                                !reward.available || currentPoints < reward.points
                              }
                              variant={
                                currentPoints >= reward.points
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {!reward.available
                                ? "Out of Stock"
                                : currentPoints >= reward.points
                                ? "Redeem"
                                : "Not Enough Points"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Challenge Update Dialog */}
      <Dialog
        open={showChallengeDialog}
        onOpenChange={setShowChallengeDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedChallenge?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              value={progressInput}
              onChange={(e) => setProgressInput(e.target.value)}
              placeholder="Enter progress..."
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitProgress}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SUCCESS DIALOG */}
      <Dialog
        open={showCongratulationDialog}
        onOpenChange={setShowCongratulationDialog}
      >
        <DialogContent className="sm:max-w-md flex flex-col items-center text-center p-10 gap-6 bg-white shadow-lg rounded-lg">
          <div className="h-24 w-24 rounded-full border-4 border-green-100 flex items-center justify-center mb-2">
            <Check className="h-12 w-12 text-green-500" strokeWidth={3} />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-700">
            Your prize redemption is accepted
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 text-base leading-relaxed max-w-sm">
            Verification is in progress. Your prize will be delivered to you
            within 14 days once it is verified. Thank You!
          </DialogDescription>
          <Button
            onClick={() => setShowCongratulationDialog(false)}
            className="w-32 bg-sky-400 hover:bg-sky-500 text-white font-medium text-lg rounded-md mt-2"
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
