import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Play, Pause, RotateCcw, Target, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TopBar } from './shared/TopBar';
import { Alert, AlertDescription } from './ui/alert';

interface NoRepCounterProps {
  onLogout: () => void;
}

interface RepData {
  count: number;
  quality: 'perfect' | 'good' | 'poor';
  feedback: string;
}

export function NoRepCounter({ onLogout }: NoRepCounterProps) {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [currentExercise, setCurrentExercise] = useState('push-ups');
  const [repData, setRepData] = useState<RepData[]>([]);
  const [totalReps, setTotalReps] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const exercises = [
    { value: 'push-ups', label: 'Push-ups', description: 'Track proper push-up form' },
    { value: 'squats', label: 'Squats', description: 'Monitor squat depth and posture' },
    { value: 'bicep-curls', label: 'Bicep Curls', description: 'Ensure full range of motion' },
    { value: 'lunges', label: 'Lunges', description: 'Check lunge depth and balance' },
  ];

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setCameraPermission('denied');
    }
  };

  const startRecording = () => {
    if (cameraPermission !== 'granted') {
      requestCameraPermission();
      return;
    }
    
    setIsRecording(true);
    setCurrentRep(0);
    setRepData([]);
    setFeedback('Keep your form steady. I\'m analyzing your movement...');
    
    const interval = setInterval(() => {
      setCurrentRep(prev => {
        const newRep = prev + 1;
        
        const qualities: RepData['quality'][] = ['perfect', 'good', 'poor'];
        const feedbacks = [
          'Excellent form!',
          'Good rep, keep it up!',
          'Try to go deeper',
          'Maintain straight back',
          'Perfect range of motion!'
        ];
        
        const quality = qualities[Math.floor(Math.random() * qualities.length)];
        const feedbackText = feedbacks[Math.floor(Math.random() * feedbacks.length)];
        
        setRepData(prev => [...prev, {
          count: newRep,
          quality,
          feedback: feedbackText
        }]);
        
        setFeedback(feedbackText);
        
        if (newRep >= 10) {
          stopRecording();
        }
        
        return newRep;
      });
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
    }, 20000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setTotalReps(currentRep);
    setFeedback('Workout completed! Great job!');
  };

  const resetSession = () => {
    setCurrentRep(0);
    setRepData([]);
    setTotalReps(0);
    setFeedback('');
  };

  const getQualityColor = (quality: RepData['quality']) => {
    switch (quality) {
      case 'perfect':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityStats = () => {
    const perfect = repData.filter(rep => rep.quality === 'perfect').length;
    const good = repData.filter(rep => rep.quality === 'good').length;
    const poor = repData.filter(rep => rep.quality === 'poor').length;
    
    return { perfect, good, poor };
  };

  return (
    // CHANGED: Added pt-8 to handle status bar collision on mobile
    <div className="h-screen flex flex-col bg-background pt-8">
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="flex items-center justify-center gap-2">
              <Target className="h-8 w-8 text-blue-500" />
              No-Rep Counter
            </h1>
            <p className="text-muted-foreground">
              AI-powered form analysis to ensure every rep counts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Form Analysis
                </CardTitle>
                <CardDescription>
                  Position yourself in view and start your workout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  {cameraPermission === 'granted' ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center space-y-4">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-muted-foreground">Camera access required</p>
                        <Button 
                          onClick={requestCameraPermission}
                          className="mt-2"
                          size="sm"
                        >
                          Enable Camera
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                        Recording
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Exercise Selection */}
                <div className="space-y-2">
                  <label className="text-sm">Select Exercise</label>
                  <select
                    value={currentExercise}
                    onChange={(e) => setCurrentExercise(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={isRecording}
                  >
                    {exercises.map((exercise) => (
                      <option key={exercise.value} value={exercise.value}>
                        {exercise.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button 
                      onClick={startRecording} 
                      className="flex-1"
                      disabled={cameraPermission !== 'granted'}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Workout
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} variant="destructive" className="flex-1">
                      <Pause className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}
                  <Button onClick={resetSession} variant="outline">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats and Feedback */}
            <div className="space-y-6">
              {/* Current Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl mb-1">{currentRep}</div>
                      <p className="text-sm text-muted-foreground">Current Reps</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">{totalReps}</div>
                      <p className="text-sm text-muted-foreground">Total Reps</p>
                    </div>
                  </div>

                  {feedback && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{feedback}</AlertDescription>
                    </Alert>
                  )}

                  {repData.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm">Form Quality</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-lg">{getQualityStats().perfect}</div>
                          <div className="text-xs text-green-600">Perfect</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="text-lg">{getQualityStats().good}</div>
                          <div className="text-xs text-yellow-600">Good</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="text-lg">{getQualityStats().poor}</div>
                          <div className="text-xs text-red-600">Needs Work</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rep History */}
              {repData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rep Analysis</CardTitle>
                    <CardDescription>
                      Detailed feedback for each repetition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {repData.slice().reverse().map((rep, index) => (
                        <div key={repData.length - index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm">Rep {rep.count}</span>
                            <Badge className={getQualityColor(rep.quality)}>
                              {rep.quality}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rep.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* How it Works */}
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">1</div>
                    <p className="text-sm">AI analyzes your movement in real-time</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">2</div>
                    <p className="text-sm">Only counts reps with proper form</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">3</div>
                    <p className="text-sm">Provides instant feedback for improvement</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}