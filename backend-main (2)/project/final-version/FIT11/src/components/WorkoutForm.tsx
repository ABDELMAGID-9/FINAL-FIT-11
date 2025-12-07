// src/components/WorkoutForm.tsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TopBar } from './shared/TopBar';
import { api } from "../lib/api";

interface WorkoutFormProps {
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  notes: string;
}

interface FormData {
  name: string;
  description: string;
  type: 'building_muscle' | 'cardio' | '';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | '';
  duration: number;
  exercises: Exercise[];
}

interface FormErrors {
  name?: string;
  description?: string;
  type?: string;
  difficulty?: string;
  duration?: string;
  exercises?: string;
}

// Popular exercises list
const POPULAR_EXERCISES = {
  strength: [
    'Squat', 'Bench Press', 'Deadlift', 'Leg Extension', 'Leg Curl', 'Leg Press',
    'Bicep Curls', 'Tricep Curls', 'Lat Pull Down', 'Pull-ups', 'Push-ups',
    'Dumbbell Press', 'Shoulder Press', 'Lateral Raises', 'Front Raises',
    'Chest Fly', 'Cable Crossover', 'Dips', 'Barbell Row', 'Dumbbell Row',
    'Face Pulls', 'Hammer Curls', 'Preacher Curls', 'Tricep Extensions',
    'Skull Crushers', 'Calf Raises', 'Lunges', 'Bulgarian Split Squat',
    'Romanian Deadlift', 'Hip Thrust', 'Plank', 'Ab Crunches'
  ],
  cardio: [
    'Running on Treadmill', 'Walking on Treadmill', 'Cycling', 'Rowing Machine',
    'Elliptical', 'Stair Climber', 'Jump Rope', 'Burpees', 'Mountain Climbers',
    'High Knees', 'Jumping Jacks', 'Swimming', 'Running (Outdoor)', 
    'Cycling (Outdoor)'
  ]
};

export function WorkoutForm({ onLogout }: WorkoutFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [formData, setFormData] = useState<FormData>({
    name: isEditing ? 'Upper Body Strength' : '',
    description: isEditing ? 'Focus on chest, shoulders, and arms with compound movements' : '',
    type: isEditing ? 'building_muscle' : '',
    difficulty: isEditing ? 'intermediate' : '',
    duration: isEditing ? 45 : 30,
    exercises: isEditing
      ? [
          {
            id: '1',
            name: 'Push-ups',
            sets: 3,
            reps: '12-15',
            rest: 60,
            notes: 'Keep your core tight'
          }
        ]
      : [
          {
            id: '1',
            name: '',
            sets: 3,
            reps: '',
            rest: 60,
            notes: ''
          }
        ]
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAvailableExercises = () => {
    if (formData.type === 'building_muscle') return POPULAR_EXERCISES.strength;
    if (formData.type === 'cardio') return POPULAR_EXERCISES.cardio;
    return [...POPULAR_EXERCISES.strength, ...POPULAR_EXERCISES.cardio];
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Workout name is required';
    else if (formData.name.length < 3) newErrors.name = 'Min 3 characters';

    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 10) newErrors.description = 'Min 10 characters';

    if (!formData.type) newErrors.type = 'Workout type is required';
    if (!formData.difficulty) newErrors.difficulty = 'Difficulty required';

    if (formData.duration < 5 || formData.duration > 180)
      newErrors.duration = 'Duration must be between 5–180';

    const hasValidExercises = formData.exercises.some(
      ex => ex.name.trim() && ex.reps.trim()
    );
    if (!hasValidExercises) newErrors.exercises = 'At least one valid exercise required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ⭐ رفع خطة Manual إلى MongoDB
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await api("/api/workouts", {
        method: "POST",
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
          type: formData.type,
          difficulty: formData.difficulty,
          duration: formData.duration,
          exercises: formData.exercises,

          // Not AI, so no planData or plan
          plan: null,
          planData: {
            description: formData.description,
            type: formData.type,
            difficulty: formData.difficulty,
            duration: formData.duration,
            exercises: formData.exercises,
          }
        })
      });

      console.log("Saved manual workout:", res);
      navigate('/dashboard');
    } catch (err) {
      console.error("❌ Failed to save manual plan:", err);
      alert("Failed to save plan.");
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: Date.now().toString(),
          name: '',
          sets: 3,
          reps: '',
          rest: 60,
          notes: ''
        }
      ]
    }));
  };

  const removeExercise = (id: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id)
    }));
  };

  const updateExercise = (
    id: string,
    field: keyof Exercise,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar onLogout={onLogout} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Edit Workout' : 'Create New Workout'}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Workout Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Upper Body Strength"
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      min={5}
                      max={180}
                      onChange={e => handleInputChange('duration', parseInt(e.target.value) || 0)}
                      className={errors.duration ? 'border-destructive' : ''}
                    />
                    {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    rows={3}
                    placeholder="Describe your workout"
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                {/* TYPE + DIFFICULTY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Workout Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'building_muscle' | 'cardio') =>
                        handleInputChange('type', value)
                      }
                    >
                      <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="building_muscle">Building Muscle</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty *</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                        handleInputChange('difficulty', value)
                      }
                    >
                      <SelectTrigger className={errors.difficulty ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.difficulty && <p className="text-sm text-destructive">{errors.difficulty}</p>}
                  </div>
                </div>

                {/* EXERCISES SECTION */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3>Exercises</h3>
                    <Button type="button" onClick={addExercise} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>

                  {errors.exercises && <p className="text-sm text-destructive">{errors.exercises}</p>}

                  {formData.exercises.map((exercise, index) => (
                    <Card key={exercise.id}>
                      <CardContent className="p-4 space-y-3">

                        {/* Header */}
                        <div className="flex justify-between">
                          <h4 className="text-sm">Exercise {index + 1}</h4>

                          {formData.exercises.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExercise(exercise.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          {/* Exercise Name */}
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Select
                              value={exercise.name}
                              onValueChange={(value: string) =>
                                updateExercise(exercise.id, 'name', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select exercise" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {getAvailableExercises().map((exName: string) => (
                                  <SelectItem key={exName} value={exName}>
                                    {exName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Reps */}
                          <div className="space-y-2">
                            <Label>Reps</Label>
                            <Input
                              placeholder="e.g., 12-15"
                              value={exercise.reps}
                              onChange={e =>
                                updateExercise(exercise.id, 'reps', e.target.value)
                              }
                            />
                          </div>

                          {/* Sets */}
                          <div className="space-y-2">
                            <Label>Sets</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={exercise.sets}
                              onChange={e =>
                                updateExercise(
                                  exercise.id,
                                  'sets',
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                          </div>

                          {/* Rest */}
                          <div className="space-y-2">
                            <Label>Rest (s)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={300}
                              value={exercise.rest}
                              onChange={e =>
                                updateExercise(
                                  exercise.id,
                                  'rest',
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            rows={2}
                            placeholder="Tips for proper form"
                            value={exercise.notes}
                            onChange={e =>
                              updateExercise(exercise.id, 'notes', e.target.value)
                            }
                          />
                        </div>

                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* SUBMIT */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Workout' : 'Create Workout'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
