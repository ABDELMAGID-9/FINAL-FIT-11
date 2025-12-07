import React from 'react';
import { Button } from '../ui/button';
import { Dumbbell, Brain } from 'lucide-react';
import cbumImage from '../../assets/cbum.png'; // ✅ هذا هو التعديل الصحيح

interface FitnessEmptyStateProps {
  onAddNew: () => void;
  onAIBuilder: () => void;
  alwaysShow?: boolean; // 👈 إضافة هذا السطر
}


export function FitnessEmptyState({ onAddNew, onAIBuilder }: FitnessEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-64 h-48 mb-6 overflow-hidden rounded-lg">
        <img
          src={cbumImage}
          alt="Fitness illustration"
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="mb-2 text-muted-foreground">Ready to start your fitness journey?</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Create your first workout or let our AI build a personalized plan just for you.
      </p>

      <div className="flex gap-3">
        <Button
          onClick={onAIBuilder}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Brain className="h-4 w-4 mr-2" />
          AI Workout Builder
        </Button>
        <Button onClick={onAddNew} variant="outline">
          <Dumbbell className="h-4 w-4 mr-2" />
          Create Manual Workout
        </Button>
      </div>
    </div>
  );
}
