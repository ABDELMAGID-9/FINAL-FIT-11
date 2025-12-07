import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      
      <Alert className="max-w-md mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Something went wrong while loading the data. Please try again.
        </AlertDescription>
      </Alert>
      
      <Button onClick={onRetry} variant="outline">
        Retry
      </Button>
    </div>
  );
}
