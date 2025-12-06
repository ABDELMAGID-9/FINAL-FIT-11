import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './utils/ImageWithFallback';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-80 h-60 mx-auto overflow-hidden rounded-lg">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1580163661417-3606299aba72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHw0MDQlMjBub3QlMjBmb3VuZCUyMGlsbHVzdHJhdGlvbnxlbnwxfHx8fDE3NTg4MzcyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="404 illustration"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl text-muted-foreground">404</h1>
          <h2>Page not found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}