import React, { useState, useEffect } from 'react'; // ← تأكد أنك استخدمت useEffect هنا
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, TrendingUp, Target, Flame, Apple, Beef, Wheat, Droplet, Sparkles, CheckCircle2, Clock, Calendar, Settings, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TopBar } from './shared/TopBar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { api } from "../lib/api";

interface NutritionPlannerProps {
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

interface Meal {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Mock AI function to analyze food
const analyzeFoodWithAI = (foodDescription: string): { calories: number; protein: number; carbs: number; fat: number } => {
  // This is a mock function. In production, you would call an actual AI API
  const keywords = foodDescription.toLowerCase();
  
  // Simple heuristic-based estimation (in production, use real AI)
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  // Protein sources
  if (keywords.includes('chicken') || keywords.includes('دجاج')) {
    calories += 165;
    protein += 31;
    fat += 3.6;
  }
  if (keywords.includes('beef') || keywords.includes('لحم')) {
    calories += 250;
    protein += 26;
    fat += 15;
  }
  if (keywords.includes('fish') || keywords.includes('سمك')) {
    calories += 206;
    protein += 22;
    fat += 12;
  }
  if (keywords.includes('egg') || keywords.includes('بيض')) {
    const eggCount = keywords.match(/\d+/) ? parseInt(keywords.match(/\d+/)![0]) : 1;
    calories += 78 * eggCount;
    protein += 6 * eggCount;
    fat += 5 * eggCount;
    carbs += 0.6 * eggCount;
  }

  // Carb sources
  if (keywords.includes('rice') || keywords.includes('أرز')) {
    calories += 130;
    carbs += 28;
    protein += 2.7;
  }
  if (keywords.includes('bread') || keywords.includes('خبز')) {
    calories += 80;
    carbs += 15;
    protein += 2.5;
  }
  if (keywords.includes('pasta') || keywords.includes('معكرونة')) {
    calories += 200;
    carbs += 40;
    protein += 7;
  }
  if (keywords.includes('potato') || keywords.includes('بطاطس')) {
    calories += 163;
    carbs += 37;
    protein += 4.3;
  }

  // Vegetables
  if (keywords.includes('salad') || keywords.includes('سلطة')) {
    calories += 50;
    carbs += 10;
    protein += 2;
  }
  if (keywords.includes('broccoli') || keywords.includes('بروكلي')) {
    calories += 55;
    carbs += 11;
    protein += 3.7;
  }

  // Fruits
  if (keywords.includes('banana') || keywords.includes('موز')) {
    calories += 105;
    carbs += 27;
    protein += 1.3;
  }
  if (keywords.includes('apple') || keywords.includes('تفاح')) {
    calories += 95;
    carbs += 25;
  }

  // Fats
  if (keywords.includes('oil') || keywords.includes('زيت')) {
    calories += 120;
    fat += 14;
  }
  if (keywords.includes('butter') || keywords.includes('زبدة')) {
    calories += 100;
    fat += 11;
  }
  if (keywords.includes('avocado') || keywords.includes('أفوكادو')) {
    calories += 160;
    fat += 15;
    carbs += 9;
    protein += 2;
  }

  // Dairy
  if (keywords.includes('milk') || keywords.includes('حليب')) {
    calories += 150;
    carbs += 12;
    protein += 8;
    fat += 8;
  }
  if (keywords.includes('yogurt') || keywords.includes('زبادي')) {
    calories += 100;
    carbs += 17;
    protein += 6;
    fat += 0.4;
  }

  // Add some randomness to make it more realistic
  const variance = 0.9 + Math.random() * 0.2;
  
  return {
    calories: Math.round(calories * variance),
    protein: Math.round(protein * variance),
    carbs: Math.round(carbs * variance),
    fat: Math.round(fat * variance)
  };
};

export function NutritionPlanner({ onLogout, isDarkMode, onToggleTheme }: NutritionPlannerProps) {
  const navigate = useNavigate();
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [foodInput, setFoodInput] = useState('');
  const [mealName, setMealName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedNutrition, setAnalyzedNutrition] = useState<{ calories: number; protein: number; carbs: number; fat: number } | null>(null);

  const [dailyGoals, setDailyGoals] = useState<DailyGoals>(() => {
    const saved = localStorage.getItem('nutritionGoals');
    return saved ? JSON.parse(saved) : {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65
    };
  });

  const [tempGoals, setTempGoals] = useState<DailyGoals>(dailyGoals);

  const [meals, setMeals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Breakfast',
      description: '3 eggs, 2 slices of bread, avocado',
      timestamp: '8:00 AM',
      calories: 450,
      protein: 24,
      carbs: 35,
      fat: 22
    },
    {
      id: '2',
      name: 'Lunch',
      description: 'Grilled chicken breast, rice, broccoli',
      timestamp: '1:30 PM',
      calories: 520,
      protein: 45,
      carbs: 55,
      fat: 8
    }
  ]);
// ✅ تحميل الوجبات من قاعدة البيانات عند فتح الصفحة
useEffect(() => {
  async function loadMeals() {
    try {
      const res = await api<{ ok: boolean; logs: any[] }>("/api/nutrition/logs");
      if (res.ok && Array.isArray(res.logs)) {
        const loadedMeals: Meal[] = res.logs.map((log) => ({
          id: log._id,
          name: log.plan?.description?.split(' ')[0] || "Meal",
          description: log.plan?.description || "",
          timestamp: new Date(log.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          calories: log.calories || 0,
          protein: log.protein || 0,
          carbs: log.carbs || 0,
          fat: log.fat || 0,
        }));
        setMeals(loadedMeals);
        console.log("✅ Loaded meals from DB:", loadedMeals);
      }
    } catch (err) {
      console.error("❌ Failed to load meals:", err);
    }
  }
  loadMeals();
}, []);

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

const handleAnalyzeFood = async () => {
  if (!foodInput.trim()) return;

  setIsAnalyzing(true);
  try {
    console.log("Sending to backend:", foodInput);

    const res = (await api<any>("/api/ai/nutrition", {
      method: "POST",
      body: JSON.stringify({
        food: foodInput,
        goal: "maintenance",
        weightKg: 75,
        heightCm: 175,
        age: 25,
        sex: "male",
        activity: "moderate",
      }),
    })) as { plan?: { targetCalories?: number; macros?: any } };

    const plan = res.plan || {};
    const macros = plan.macros || {};

    setAnalyzedNutrition({
      calories: plan.targetCalories || 0,
      protein: macros.protein || 0,
      carbs: macros.carbs || 0,
      fat: macros.fat || 0,
    });
  } catch (err) {
    console.error("AI Nutrition error:", err);
    alert("⚠️ Failed to analyze food with AI. Please try again later.");
  } finally {
    setIsAnalyzing(false);
  }
};


const handleAddMeal = async () => {
  if (!analyzedNutrition || !mealName.trim()) return;

  const newMeal: Meal = {
    id: Date.now().toString(),
    name: mealName,
    description: foodInput,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    ...analyzedNutrition
  };

  setMeals([...meals, newMeal]);
  setShowAddMealDialog(false);
  setFoodInput('');
  setMealName('');
  setAnalyzedNutrition(null);

  // ✅ أضف هذا الجزء لحفظ الوجبة في قاعدة البيانات
  try {
    await api("/api/nutrition/logs", {
      method: "POST",
      body: JSON.stringify({
        description: newMeal.description,
        calories: newMeal.calories,
        protein: newMeal.protein,
        carbs: newMeal.carbs,
        fat: newMeal.fat,
        at: newMeal.timestamp,
      }),
    });
    console.log("✅ Meal saved to MongoDB");
  } catch (err) {
    console.error("❌ Error saving meal:", err);
  }
};


const handleDeleteMeal = async (mealId: string) => {
  // نحذف من الواجهة مباشرة
  setMeals(prev => prev.filter(m => m.id !== mealId));

  try {
    // طلب الحذف من الباك إند
    await api<{ ok: boolean }>(`/api/nutrition/logs/${mealId}`, {
      method: "DELETE",
    });

    console.log("✅ Meal deleted from DB:", mealId);
  } catch (err) {
    console.error("❌ Failed to delete meal from DB:", err);
  }
};



  const handleSaveGoals = () => {
    setDailyGoals(tempGoals);
    localStorage.setItem('nutritionGoals', JSON.stringify(tempGoals));
    setShowGoalsDialog(false);
  };

  const handleOpenGoalsDialog = () => {
    setTempGoals(dailyGoals);
    setShowGoalsDialog(true);
  };

  const macroData = [
    { name: 'Protein', value: totals.protein, color: '#FF6B6B', icon: Beef },
    { name: 'Carbs', value: totals.carbs, color: '#4ECDC4', icon: Wheat },
    { name: 'Fat', value: totals.fat, color: '#FFE66D', icon: Droplet }
  ];

  const getPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getStatusColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage < 80) return 'text-yellow-500';
    if (percentage <= 110) return 'text-green-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="flex items-center gap-2">
                  <Apple className="w-6 h-6 text-primary" />
                  AI Nutrition Tracker
                </h1>
                <p className="text-sm text-muted-foreground">Track your macros with AI-powered analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={handleOpenGoalsDialog}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Adjust Goals
              </Button>
              <Button 
                onClick={() => setShowAddMealDialog(true)}
                className="shadow-lg shadow-primary/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Meal
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-8 h-8 text-primary" />
                  <Badge variant="secondary">{Math.round(getPercentage(totals.calories, dailyGoals.calories))}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Calories</p>
                <p className="text-3xl mb-2">{totals.calories}</p>
                <p className="text-xs text-muted-foreground">of {dailyGoals.calories} kcal</p>
                <Progress 
                  value={getPercentage(totals.calories, dailyGoals.calories)} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 dark:border-red-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Beef className="w-8 h-8 text-red-500" />
                  <Badge variant="secondary">{Math.round(getPercentage(totals.protein, dailyGoals.protein))}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Protein</p>
                <p className="text-3xl mb-2">{totals.protein}g</p>
                <p className="text-xs text-muted-foreground">of {dailyGoals.protein}g</p>
                <Progress 
                  value={getPercentage(totals.protein, dailyGoals.protein)} 
                  className="mt-2 h-2 [&>div]:bg-red-500"
                />
              </CardContent>
            </Card>

            <Card className="border-2 border-teal-200 dark:border-teal-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Wheat className="w-8 h-8 text-teal-500" />
                  <Badge variant="secondary">{Math.round(getPercentage(totals.carbs, dailyGoals.carbs))}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Carbs</p>
                <p className="text-3xl mb-2">{totals.carbs}g</p>
                <p className="text-xs text-muted-foreground">of {dailyGoals.carbs}g</p>
                <Progress 
                  value={getPercentage(totals.carbs, dailyGoals.carbs)} 
                  className="mt-2 h-2 [&>div]:bg-teal-500"
                />
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 dark:border-yellow-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Droplet className="w-8 h-8 text-yellow-500" />
                  <Badge variant="secondary">{Math.round(getPercentage(totals.fat, dailyGoals.fat))}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Fat</p>
                <p className="text-3xl mb-2">{totals.fat}g</p>
                <p className="text-xs text-muted-foreground">of {dailyGoals.fat}g</p>
                <Progress 
                  value={getPercentage(totals.fat, dailyGoals.fat)} 
                  className="mt-2 h-2 [&>div]:bg-yellow-500"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Today's Meals
                  </CardTitle>
                  <CardDescription>
                    Track all your meals and snacks for the day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {meals.length === 0 ? (
                    <div className="text-center py-12">
                      <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No meals logged yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowAddMealDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Meal
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {meals.map((meal) => (
                        <Card key={meal.id} className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3>{meal.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {meal.timestamp}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{meal.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMeal(meal.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                            
                            <Separator className="my-3" />
                            
                            <div className="grid grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Flame className="w-4 h-4 text-primary" />
                                  <p className="text-sm text-muted-foreground">Calories</p>
                                </div>
                                <p className="text-xl">{meal.calories}</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Beef className="w-4 h-4 text-red-500" />
                                  <p className="text-sm text-muted-foreground">Protein</p>
                                </div>
                                <p className="text-xl">{meal.protein}g</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Wheat className="w-4 h-4 text-teal-500" />
                                  <p className="text-sm text-muted-foreground">Carbs</p>
                                </div>
                                <p className="text-xl">{meal.carbs}g</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Droplet className="w-4 h-4 text-yellow-500" />
                                  <p className="text-sm text-muted-foreground">Fat</p>
                                </div>
                                <p className="text-xl">{meal.fat}g</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-card to-accent/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Macro Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {totals.calories > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={macroData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {macroData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="space-y-3 mt-4">
                        {macroData.map((macro) => {
                          const Icon = macro.icon;
                          return (
                            <div key={macro.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: macro.color }}
                                />
                                <Icon className="w-4 h-4" style={{ color: macro.color }} />
                                <span className="text-sm">{macro.name}</span>
                              </div>
                              <span className="text-sm">{macro.value}g</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Add meals to see distribution</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Daily Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Calories</span>
                      <span className={getStatusColor(totals.calories, dailyGoals.calories)}>
                        {totals.calories} / {dailyGoals.calories}
                      </span>
                    </div>
                    <Progress value={getPercentage(totals.calories, dailyGoals.calories)} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Protein</span>
                      <span className={getStatusColor(totals.protein, dailyGoals.protein)}>
                        {totals.protein}g / {dailyGoals.protein}g
                      </span>
                    </div>
                    <Progress value={getPercentage(totals.protein, dailyGoals.protein)} className="h-2 [&>div]:bg-red-500" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Carbs</span>
                      <span className={getStatusColor(totals.carbs, dailyGoals.carbs)}>
                        {totals.carbs}g / {dailyGoals.carbs}g
                      </span>
                    </div>
                    <Progress value={getPercentage(totals.carbs, dailyGoals.carbs)} className="h-2 [&>div]:bg-teal-500" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Fat</span>
                      <span className={getStatusColor(totals.fat, dailyGoals.fat)}>
                        {totals.fat}g / {dailyGoals.fat}g
                      </span>
                    </div>
                    <Progress value={getPercentage(totals.fat, dailyGoals.fat)} className="h-2 [&>div]:bg-yellow-500" />
                  </div>

                  {totals.calories >= dailyGoals.calories * 0.8 && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <p className="text-sm">Great job! You're on track today!</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Nutrition Analyzer
            </DialogTitle>
            <DialogDescription>
              Describe what you ate, and our AI will analyze the nutritional content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meal-name">Meal Name</Label>
              <Input
                id="meal-name"
                placeholder="e.g., Breakfast, Lunch, Snack..."
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="food-description">What did you eat?</Label>
              <Textarea
                id="food-description"
                placeholder="e.g., 2 eggs, 1 slice of bread, avocado, orange juice"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="space-y-2 p-3 bg-accent/50 rounded-lg border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Examples / أمثلة:</strong>
                </p>
                <div className="grid gap-1 text-xs text-muted-foreground">
                  <p>• English: "2 eggs, 1 slice of whole wheat bread, half avocado, 1 glass orange juice"</p>
                  <p>• العربية: "2 بيض، شريحة خبز أسمر، نصف أفوكادو، كوب عصير برتقال"</p>
                  <p>• English: "Grilled chicken breast 150g, 1 cup rice, broccoli"</p>
                  <p>• العربية: "صدر دجاج مشوي 150 جرام، كوب أرز، بروكلي"</p>
                </div>
                <p className="text-xs text-muted-foreground pt-1 border-t border-primary/10">
                  <strong>Tip / نصيحة:</strong> Be specific about quantities for more accurate results / كن محدداً في الكميات للحصول على نتائج أدق
                </p>
              </div>
            </div>

            <Button 
              onClick={handleAnalyzeFood}
              disabled={!foodInput.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Nutrition
                </>
              )}
            </Button>

            {analyzedNutrition && (
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card rounded-lg p-4 border-2 border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-primary" />
                        <p className="text-sm text-muted-foreground">Calories</p>
                      </div>
                      <p className="text-3xl">{analyzedNutrition.calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    
                    <div className="bg-card rounded-lg p-4 border-2 border-red-200 dark:border-red-900/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Beef className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-muted-foreground">Protein</p>
                      </div>
                      <p className="text-3xl text-red-500">{analyzedNutrition.protein}</p>
                      <p className="text-xs text-muted-foreground">grams</p>
                    </div>
                    
                    <div className="bg-card rounded-lg p-4 border-2 border-teal-200 dark:border-teal-900/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Wheat className="w-5 h-5 text-teal-500" />
                        <p className="text-sm text-muted-foreground">Carbs</p>
                      </div>
                      <p className="text-3xl text-teal-500">{analyzedNutrition.carbs}</p>
                      <p className="text-xs text-muted-foreground">grams</p>
                    </div>
                    
                    <div className="bg-card rounded-lg p-4 border-2 border-yellow-200 dark:border-yellow-900/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplet className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-muted-foreground">Fat</p>
                      </div>
                      <p className="text-3xl text-yellow-500">{analyzedNutrition.fat}</p>
                      <p className="text-xs text-muted-foreground">grams</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      AI-powered estimation. Results may vary based on portion sizes and preparation methods.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddMealDialog(false);
                setFoodInput('');
                setMealName('');
                setAnalyzedNutrition(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMeal}
              disabled={!analyzedNutrition || !mealName.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Goals Dialog */}
      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Adjust Daily Goals
            </DialogTitle>
            <DialogDescription>
              Customize your daily nutrition targets based on your fitness goals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="calories-goal">Calories Goal</Label>
                      <p className="text-xs text-muted-foreground">Daily calorie target</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="calories-goal"
                      type="number"
                      min="1000"
                      max="5000"
                      step="50"
                      value={tempGoals.calories}
                      onChange={(e) => setTempGoals({ ...tempGoals, calories: parseInt(e.target.value) || 0 })}
                      className="text-2xl h-14 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      kcal
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-200 dark:border-red-900/30 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/10 dark:to-red-900/5">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Beef className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="protein-goal">Protein Goal</Label>
                      <p className="text-xs text-muted-foreground">Daily protein target</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="protein-goal"
                      type="number"
                      min="50"
                      max="500"
                      step="5"
                      value={tempGoals.protein}
                      onChange={(e) => setTempGoals({ ...tempGoals, protein: parseInt(e.target.value) || 0 })}
                      className="text-2xl h-14 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      g
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-teal-200 dark:border-teal-900/30 bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/10 dark:to-teal-900/5">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Wheat className="w-6 h-6 text-teal-500" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="carbs-goal">Carbs Goal</Label>
                      <p className="text-xs text-muted-foreground">Daily carbohydrates target</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="carbs-goal"
                      type="number"
                      min="50"
                      max="500"
                      step="5"
                      value={tempGoals.carbs}
                      onChange={(e) => setTempGoals({ ...tempGoals, carbs: parseInt(e.target.value) || 0 })}
                      className="text-2xl h-14 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      g
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-200 dark:border-yellow-900/30 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/10 dark:to-yellow-900/5">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <Droplet className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="fat-goal">Fat Goal</Label>
                      <p className="text-xs text-muted-foreground">Daily fat target</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="fat-goal"
                      type="number"
                      min="20"
                      max="200"
                      step="5"
                      value={tempGoals.fat}
                      onChange={(e) => setTempGoals({ ...tempGoals, fat: parseInt(e.target.value) || 0 })}
                      className="text-2xl h-14 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      g
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1 space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <p><strong>Quick Tips / نصائح سريعة:</strong></p>
                    <ul className="space-y-1 list-disc list-inside text-xs">
                      <li><strong>Weight Loss / خسارة الوزن:</strong> Lower calories (1500-1800 kcal), higher protein (1.6-2g per kg bodyweight)</li>
                      <li><strong>Muscle Gain / بناء العضلات:</strong> Higher calories (2500-3000 kcal), high protein (2-2.5g per kg bodyweight)</li>
                      <li><strong>Maintenance / الحفاظ:</strong> Moderate calories (2000-2200 kcal), balanced macros</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowGoalsDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveGoals}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Goals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
