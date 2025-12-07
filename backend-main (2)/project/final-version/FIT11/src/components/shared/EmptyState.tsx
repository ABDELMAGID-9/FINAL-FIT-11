import React from 'react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface EmptyStateProps {
  onAddNew: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-64 h-48 mb-6 overflow-hidden rounded-lg">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1751712698725-88d05e1e797a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMHN0YXRlJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc1ODgzNzI4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="No data illustration"
          className="w-full h-full object-cover"
        />
      </div>
      
      <h3 className="mb-2 text-muted-foreground">No data yet</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Get started by adding your first item to see it appear here.
      </p>
      
      <Button onClick={onAddNew}>
        Add new
      </Button>
    </div>
  );
}
