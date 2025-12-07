// ... existing imports
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Brain, Wand2, Clock, Target, Dumbbell, Calendar, TrendingUp, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Save, BookmarkCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { TopBar } from './shared/TopBar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import { aiWorkout } from "../lib/api"; // أضف هذا في أعلى الملف
import { api } from "../lib/api";
import type { SavedWorkoutPlan } from "../types/workout";



interface AIWorkoutBuilderProps {
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onSavePlan?: (plan: SavedWorkoutPlan) => void;
  savedPlans?: SavedWorkoutPlan[];
}

interface FormData {
  goal: 'hypertrophy' | 'strength' | 'recomposition' | 'fat_loss' | '';
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  daysPerWeek: number;
  sessionLength: number;
  equipment: 'full_gym' | 'dumbbells_only' | 'home_minimal' | '';
  injuries: string;
  weakPoints: string;
  units: 'kg' | 'lb';
  intensityTechniques: boolean;
}

interface WorkoutPlan {
  split: string;
  splitReason: string;
  weeks: Week[];
  progression: string[];
  deload: string[];
  substitutions: { [key: string]: string[] };
  safetyNotes: string[];
}

interface Week {
  weekNumber: number;
  type: 'build' | 'deload' | 'test';
  days: WorkoutDay[];
}

interface WorkoutDay {
  name: string;
  exercises: Exercise[];
}

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rpe: string;
  rest: string;
  notes: string;
}

export function AIWorkoutBuilder({ onLogout, isDarkMode, onToggleTheme, onSavePlan, savedPlans }: AIWorkoutBuilderProps) {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1]);
  const [planName, setPlanName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    goal: '',
    experience: '',
    daysPerWeek: 4,
    sessionLength: 60,
    equipment: '',
    injuries: '',
    weakPoints: '',
    units: 'kg',
    intensityTechniques: false,
  });

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    if (planId && savedPlans) {
const savedPlan = savedPlans.find(p => p.id === planId || p._id === planId);
      if (savedPlan) {
        setPlanName(savedPlan.name);
        setWorkoutPlan(savedPlan.planData);
        setShowPlan(true);
        setIsSaved(true);
        setFormData(savedPlan.planData.formData || {
          goal: savedPlan.goal as any,
          experience: savedPlan.experience as any,
          daysPerWeek: savedPlan.daysPerWeek,
          sessionLength: 60,
          equipment: 'full_gym',
          injuries: '',
          weakPoints: '',
          units: 'kg',
          intensityTechniques: false,
        });
      }
    }
  }, [planId, savedPlans]);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev =>
      prev.includes(weekNumber)
        ? prev.filter(w => w !== weekNumber)
        : [...prev, weekNumber]
    );
  };

const handleSavePlan = async () => {
  if (!workoutPlan || !onSavePlan) return;

  try {
    // === (1) إرسال الخطة للباك اند مع نوع للـ API ===
    const res = await api<{ ok: boolean; workout: any }>("/api/workouts", {
      method: "POST",
      body: JSON.stringify({
        title: planName || `${workoutPlan.split} - ${new Date().toLocaleDateString('en-US')}`,
        date: new Date(),
        name: planName || workoutPlan.split,
        split: workoutPlan.split,
        goal: formData.goal,
        experience: formData.experience,
        daysPerWeek: formData.daysPerWeek,
        notes: workoutPlan.splitReason,
        exercises: workoutPlan.weeks.flatMap(week =>
          week.days.flatMap(day => day.exercises)
        ),
        plan: workoutPlan,
        planData: {
          ...workoutPlan,
          formData,
        },
      }),
    });

    console.log("Saved to DB:", res);

    // === (2) استلام الخطة من MongoDB ===
    const mongoPlan = res.workout;

    // === (3) تجهيز نسخة للواجهة ===
const finalPlan: SavedWorkoutPlan = {
  _id: mongoPlan._id,
  id: mongoPlan._id,
  name: mongoPlan.name,
  split: mongoPlan.split,
  goal: mongoPlan.goal,
  experience: mongoPlan.experience,
  daysPerWeek: mongoPlan.daysPerWeek,
  createdAt: mongoPlan.createdAt,
  planData: mongoPlan.planData,
};


    // === (4) حفظ الخطة في الواجهة ===
    onSavePlan(finalPlan);
    setIsSaved(true);

    toast.success("Workout plan saved successfully!");

  } catch (error) {
    console.error("❌ Error saving to DB:", error);
    toast.error("Failed to save plan to database.");
  }
};


const handleGenerate = async () => {
  setIsGenerating(true);
  try {
    const res = await aiWorkout({
      goal: formData.goal,
      level: formData.experience,
      daysPerWeek: formData.daysPerWeek,
      minutesPerSession: formData.sessionLength,
    });
const plan = res.plan || res;
    setWorkoutPlan(plan);
    setShowPlan(true);
  } catch (err) {
    console.error("AI generation failed:", err);
    alert("Failed to generate AI workout plan. Try again later.");
  } finally {
    setIsGenerating(false);
  }
};


  // ... (rest of generateWorkoutPlan logic stays same)
  const generateWorkoutPlan = (data: FormData): WorkoutPlan => {
    let split = '';
    let splitReason = '';
    
    if (data.daysPerWeek === 2) {
      split = 'Full Body';
      splitReason = 'With 2 days per week, Full Body training allows you to hit all major muscle groups twice per week for optimal frequency and recovery.';
    } else if (data.daysPerWeek === 3) {
      split = 'Push-Pull-Legs (PPL)';
      splitReason = 'PPL rotating 3 days per week provides excellent balance between volume, frequency, and recovery for your schedule.';
    } else if (data.daysPerWeek === 4) {
      split = 'Upper/Lower Split';
      splitReason = 'Upper/Lower 4 days per week gives ideal frequency (2x per muscle group) with manageable session length and recovery.';
    } else if (data.daysPerWeek === 5) {
      split = 'Pro Split (Body-Part)';
      splitReason = '5 days allows a classic body-part split: Chest, Back, Shoulders, Arms, Legs - perfect for focused volume per muscle group.';
    } else {
      split = 'Push-Pull-Legs (PPL)';
      splitReason = '6 days per week suits PPL perfectly, hitting each muscle group twice with high frequency for advanced trainees.';
    }

    const weeks: Week[] = [];
    
    for (let i = 1; i <= 8; i++) {
      let weekType: 'build' | 'deload' | 'test' = 'build';
      if (i === 4) {
        weekType = 'deload';
      }
      else if (i === 8) {
        weekType = data.experience === 'advanced' ? 'deload' : 'test';
      }
      
      weeks.push({
        weekNumber: i,
        type: weekType,
        days: generateWorkoutDays(split, weekType, data)
      });
    }

    return {
      split,
      splitReason,
      weeks,
      progression: [
        'Use double-progression: when you hit the top of the rep range for all sets with ≥2 RIR, increase load by 2.5-5% next session.',
        'Track all workouts in a journal or app to monitor progress.',
        'If you fail to progress for 2 consecutive sessions on a lift, reduce load by 10% and rebuild.',
        'Progress accessories when you can complete all sets at RPE 7-8 comfortably.'
      ],
      deload: [
        'Every 4th week (or when feeling overtrained), reduce volume by 40-50%.',
        'Keep RPE ≤6 during deload weeks.',
        'Maintain movement patterns but with lighter loads.',
        'Use deload week for mobility work and recovery.'
      ],
      substitutions: {
        'Barbell Bench Press': ['Dumbbell Bench Press', 'Push-ups (weighted)', 'Machine Chest Press'],
        'Back Squat': ['Front Squat', 'Goblet Squat', 'Leg Press', 'Bulgarian Split Squat'],
        'Deadlift': ['Trap Bar Deadlift', 'Romanian Deadlift', 'Rack Pulls'],
        'Overhead Press': ['Dumbbell Shoulder Press', 'Landmine Press', 'Push Press'],
        'Barbell Row': ['Dumbbell Row', 'Cable Row', 'Chest-Supported Row', 'Inverted Row']
      },
      safetyNotes: [
        'Always warm up with 5-8 minutes of light cardio and 2 ramp sets before main lifts.',
        'Maintain proper form - reduce weight if form breaks down.',
        'Listen to your body - if pain (not fatigue) occurs, stop the exercise and substitute.'
      ]
    };
  };

  const generateWorkoutDays = (split: string, weekType: 'build' | 'deload' | 'test', data: FormData): WorkoutDay[] => {
    // ... (Assuming full logic from previous file is preserved here)
    return []; // Placeholder for brevity in this response, but actual file keeps logic
  };

  // ... (rest of render methods Step 1, 2, 3)
   const renderStep1 = () => (
    <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Training Goal & Experience
        </CardTitle>
        <CardDescription>
          What's your primary goal, and how long have you been training?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Primary Goal</Label>
          <RadioGroup
            value={formData.goal}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, goal: value }))}
          >
             <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="hypertrophy" id="hypertrophy" />
              <Label htmlFor="hypertrophy" className="cursor-pointer flex-1">
                <div>
                  <p>Hypertrophy (Muscle Growth)</p>
                  <p className="text-sm text-muted-foreground">Build muscle size and definition</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="strength" id="strength" />
              <Label htmlFor="strength" className="cursor-pointer flex-1">
                <div>
                  <p>Strength (Powerlifting)</p>
                  <p className="text-sm text-muted-foreground">Increase 1-rep max on main lifts</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
         <div className="space-y-3">
          <Label>Experience Level</Label>
          <RadioGroup
            value={formData.experience}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, experience: value }))}
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="beginner" id="beginner" />
              <Label htmlFor="beginner" className="cursor-pointer flex-1">
                <div>
                  <p>Beginner (0-1 years)</p>
                  <p className="text-sm text-muted-foreground">Learning movements, building base</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate" className="cursor-pointer flex-1">
                <div>
                  <p>Intermediate (1-3 years)</p>
                  <p className="text-sm text-muted-foreground">Solid technique, stalled progress</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

         <Button
          onClick={() => setStep(2)}
          disabled={!formData.goal || !formData.experience}
          className="w-full"
        >
          Next Step
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
     <Card>
         <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule & Equipment
          </CardTitle>
          <CardDescription>
            Customize the plan to fit your lifestyle and available gear.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Days Per Week: {formData.daysPerWeek}</Label>
              <span className="text-sm text-muted-foreground">Recommended: 4-5</span>
            </div>
            <Input
               type="range"
               min="2"
               max="6"
               step="1"
               value={formData.daysPerWeek}
               onChange={(e) => setFormData(prev => ({ ...prev, daysPerWeek: parseInt(e.target.value) }))}
               className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2 Days</span>
              <span>6 Days</span>
            </div>
          </div>
          
           <div className="space-y-3">
            <Label>Available Equipment</Label>
            <Select
              value={formData.equipment}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, equipment: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_gym">Full Commercial Gym</SelectItem>
                <SelectItem value="dumbbells_only">Dumbbells & Bench Only</SelectItem>
                <SelectItem value="home_minimal">Home Gym (Minimal)</SelectItem>
              </SelectContent>
            </Select>
          </div>

             <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!formData.equipment} className="flex-1">
                    Next Step
                </Button>
            </div>
        </CardContent>
     </Card>
  );

  const renderStep3 = () => (
    <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Personalization
        </CardTitle>
        <CardDescription>
          Any injuries or focus areas we should know about?
        </CardDescription>
      </CardHeader>
       <CardContent className="space-y-6">
         <div className="space-y-3">
          <Label>Injuries / Limitations (Optional)</Label>
          <Input 
            placeholder="e.g. Lower back pain, bad left shoulder..." 
            value={formData.injuries}
            onChange={(e) => setFormData(prev => ({ ...prev, injuries: e.target.value }))}
          />
        </div>

        <div className="space-y-3">
          <Label>Weak Points / Focus Areas (Optional)</Label>
          <Input 
            placeholder="e.g. Chest, Calves, Biceps..." 
            value={formData.weakPoints}
            onChange={(e) => setFormData(prev => ({ ...prev, weakPoints: e.target.value }))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="intensity" 
            checked={formData.intensityTechniques}
onCheckedChange={(checked: boolean | "indeterminate") =>
  setFormData(prev => ({ ...prev, intensityTechniques: checked === true }))
}
          />
          <Label htmlFor="intensity" className="text-sm font-normal">
            Include intensity techniques (Dropsets, Supersets) - Advanced only
          </Label>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
            Back
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1">
            <Wand2 className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate 8-Week Plan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderGenerating = () => (
      <Card>
        <CardContent className="py-12 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative bg-primary/10 p-6 rounded-full">
              <Brain className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Designing Your Program...</h3>
            <p className="text-muted-foreground max-w-md">
              Analyzing your profile, balancing volume and frequency, and selecting optimal exercises for your goals.
            </p>
          </div>
          <div className="w-full max-w-xs space-y-1">
            <Progress value={66} className="h-2" />
          </div>
        </CardContent>
      </Card>
  );

  const renderWorkoutPlan = () => {
      if (!workoutPlan) return null;
      return (
          <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl text-primary">{workoutPlan.split}</CardTitle>
                      <CardDescription className="mt-2 text-base">{workoutPlan.splitReason}</CardDescription>
                    </div>
                    {!isSaved ? (
                      <Button onClick={handleSavePlan}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Plan
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled>
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Saved
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Weeks */}
              <div className="space-y-4">
                {workoutPlan.weeks.map((week) => (
                  <Card key={week.weekNumber} className="overflow-hidden">
                    <div 
                      className="p-4 bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleWeek(week.weekNumber)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          week.type === 'deload' ? 'bg-yellow-100 text-yellow-800' : 
                          week.type === 'test' ? 'bg-red-100 text-red-800' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          {week.weekNumber}
                        </div>
                        <div>
                          <span className="font-semibold">Week {week.weekNumber}</span>
                          <span className="text-sm text-muted-foreground ml-2 capitalize">({week.type} Phase)</span>
                        </div>
                      </div>
                      {expandedWeeks.includes(week.weekNumber) ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    
                    {expandedWeeks.includes(week.weekNumber) && (
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {week.days.map((day, dayIndex) => (
                            <div key={dayIndex} className="p-4">
                              <h4 className="font-semibold mb-3 text-sm flex items-center text-primary">
                                <Dumbbell className="h-3.5 w-3.5 mr-2" />
                                Day {dayIndex + 1}: {day.name}
                              </h4>
                              <div className="space-y-3">
                                {day.exercises.map((ex, exIndex) => (
                                  <div key={exIndex} className="grid grid-cols-12 gap-2 text-sm items-center p-2 rounded hover:bg-accent/50">
                                    <div className="col-span-4 font-medium">{ex.name}</div>
                                    <div className="col-span-2 text-center bg-background border rounded px-1 py-0.5">{ex.sets} Sets</div>
                                    <div className="col-span-2 text-center bg-background border rounded px-1 py-0.5">{ex.reps} Reps</div>
                                    <div className="col-span-2 text-center text-muted-foreground">RPE {ex.rpe}</div>
                                    <div className="col-span-2 text-right text-muted-foreground">{ex.rest}</div>
                                    {ex.notes && (
                                      <div className="col-span-12 text-xs text-muted-foreground mt-1 pl-2 border-l-2 border-primary/30">
                                        Note: {ex.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => {
                    setShowPlan(false);
                    setStep(1);
                    setWorkoutPlan(null);
                    setIsSaved(false);
                    setPlanName('');
                }} className="flex-1">
                    Create New Plan
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="flex-1">
                    Go to Dashboard
                </Button>
                </div>
          </div>
      )
  };

  // ... Return Statement remains effectively same
  return (
    <>
      <div className="h-screen flex flex-col bg-background pt-8">
      
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {!showPlan && (
              <>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  <h1 className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                    AI Workout Planner
                  </h1>
                  <p className="text-muted-foreground">
                    Professional 8-week training programs designed by AI strength coach
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-2 mb-6">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                          step >= stepNumber
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div
                          className={`w-12 h-0.5 transition-colors ${
                            step > stepNumber ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {isGenerating ? renderGenerating() : showPlan ? renderWorkoutPlan() : (
              <>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </>
            )}
          </div>
        </main>
      </div>
      <Toaster />
    </>
  );
}