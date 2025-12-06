import React from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Edit, Trash2, Play, Clock, Dumbbell } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

interface Workout {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'cardio' | 'hiit' | 'flexibility';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastCompleted?: string;
  completedCount: number;
}

interface WorkoutTableProps {
  workouts: Workout[];
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
}

export function WorkoutTable({ workouts, onDelete, onStart }: WorkoutTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-red-100 text-red-800';
      case 'cardio':
        return 'bg-blue-100 text-blue-800';
      case 'hiit':
        return 'bg-orange-100 text-orange-800';
      case 'flexibility':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workout</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Last Done</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workouts.map((workout) => (
            <TableRow key={workout.id}>
              <TableCell>
                <div>
                  <Link
                    to={`/workout/${workout.id}`}
                    className="hover:underline"
                  >
                    {workout.name}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workout.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getTypeColor(workout.type)}>
                  {workout.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getDifficultyColor(workout.difficulty)}>
                  {workout.difficulty}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {workout.duration} min
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  {workout.completedCount}x
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {workout.lastCompleted || 'Never'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onStart(workout.id)}
                    className="h-8"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/workout-form?edit=${workout.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(workout.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
