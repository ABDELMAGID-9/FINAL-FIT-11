import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock, Users, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Dialog, DialogContent } from './ui/dialog';
import { TopBar } from './shared/TopBar';
import { Sidebar } from './shared/Sidebar';
import { ImageWithFallback } from './utils/ImageWithFallback';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  audioUrl: string;
  category: string;
  listens: number;
  publishDate: string;
}

interface AudioLibraryProps {
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function AudioLibrary({ onLogout, isDarkMode, onToggleTheme }: AudioLibraryProps) {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [currentVideoEpisode, setCurrentVideoEpisode] = useState<PodcastEpisode | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const audioRef = useRef<HTMLAudioElement>(null);

const podcastEpisodes: PodcastEpisode[] = [
  // 🔥 الفيديوهات الجديدة اللي أعطيتني روابطها
  {
    id: 'YHm-8fq-9H8',
    title: 'How to Commit to the Gym and Train Easily | FENJAN Podcast',
    description: 'Description: A conversation with a personal trainer about how to commit to exercise and a healthy lifestyle, detailing the core factors for achieving results (nutrition, training, and recovery), and explaining methods for simultaneously building muscle and reducing fat.',
    duration: 'Watch Video',
    thumbnail: 'https://img.youtube.com/vi/06ovyUh2iWU/maxresdefault.jpg',
    audioUrl: 'https://youtu.be/06ovyUh2iWU?si=nAux2ebauWUemQP2',
    category: 'Consistency',
    listens: 541293,
    publishDate: '2024-06-05'
  },
  {
    id: 'FOWkN8t754g',
    title: 'The Experience of Founding Fitness Time and Its Competitors | Soualf Business Podcast',
    description: 'The story of Fahad Al-Haqbani, detailing his journey from founding Body Masters to co-founding and strategically exiting Fitness Time (Wakt Al-Lyaqah) after its IPO, and subsequently establishing Armah (owner of Befit & Optimo) to redefine the premium and luxury gym segments through quality and technology.',
    duration: 'Watch Video',
    thumbnail: 'https://img.youtube.com/vi/FOWkN8t754g/maxresdefault.jpg',
    audioUrl: 'https://youtu.be/FOWkN8t754g?si=sSVG1KoxI7bReREz',
    category: 'Challenges',
    listens: 724346,
    publishDate: '2024-09-02'
  },
  {
    id: '06ovyUh2iWU',
    title: 'Kalo Journey: How It Wins Meal Subscription Business',
    description: 'The story of Kalo expansion, a healthy meal subscription service; starting from its foundation in Bahrain, developing a complex, tech-enabled internal operational model, and achieving rapid growth across Saudi Arabia, the Gulf region, and through an acquisition in the UK.',
    duration: 'Watch Video',
    thumbnail: 'https://img.youtube.com/vi/YHm-8fq-9H8/maxresdefault.jpg',
    audioUrl: 'https://youtu.be/YHm-8fq-9H8?si=dtyt7wk5Fk7_nZsO',
    category: 'Business',
    listens: 147082,
    publishDate: '2025-02-24'
  },

  // --- EXISTING VIDEOS BELOW (Keep them as they are)
  {
    id: 'uNpGk4P5QI8',
    title: 'How to Achieve Maximum Leanness as a Natural Athlete | On The Bench Podcast',
    description: 'Description: A conversation with "That Person" (The Minister of Leanness) about his experience reaching maximum natural leanness (below 10%) for a bodybuilding competition, including the mental and physical challenges, strict nutritional strategies, and how to maintain muscle mass during the cutting phase.',
    duration: 'Watch Video',
    thumbnail: 'https://img.youtube.com/vi/uNpGk4P5QI8/maxresdefault.jpg',
    audioUrl: 'https://youtu.be/uNpGk4P5QI8?si=VyqFnEh-wDYOvbxw',
    category: 'Motivation',
    listens: 128244,
    publishDate: '2025-06-14'
  },
  {
    id: 'h9hPa5Tl-Ow',
  title: 'How to Build Muscle with Minimal Cost | On The Bench Podcast',
    description: 'A discussion with an exercise specialist and trainer on building muscle and maintaining a fit lifestyle on a tight budget, covering strategies for affordable gym options (including home workouts and "people gyms"), cost-effective nutrition (breaking down expenses for staples like chicken and rice), and managing finances to prioritize fitness.',
      duration: 'Watch Video',
    thumbnail: 'https://img.youtube.com/vi/h9hPa5Tl-Ow/maxresdefault.jpg',
    audioUrl: 'https://youtu.be/h9hPa5Tl-Ow?si=KX9mNp-bf0IGxxra',
    category: 'Training Science',
    listens: 107497,
    publishDate: '2024-01-18'
  },
  {
    id: 'bwPNoGdzQzA',
    title: 'How Suleiman Hatch Lost 40 Kg and Built Muscle! Suleiman Hatch Story with the Gym | On The Bench Podcast',
    description: 'Description: The story of Suleiman Hatch (Hatchlift) and his physical transformation, detailing his extreme journey of losing 40 kg (dropping from 80kg to the high 40s/low 50s) through unconventional methods, his subsequent struggles with "dirty bulking" and Ego lifting, and how he finally achieved consistent muscle growth and fat loss by adopting an open-minded approach to training and nutrition.',
    duration: 'Watch Video',
    thumbnail: 'https://img.youtube.com/vi/bwPNoGdzQzA/maxresdefault.jpg',
    audioUrl: 'https://youtu.be/bwPNoGdzQzA?si=sFN_CAS0bJEXJHOW',
    category: 'Nutrition',
    listens: 159113,
    publishDate: '2025-06-28'
  },

  // --- AUDIO EPISODES BELOW (keep same)
  {
    id: '4',
    title: 'Sleep Optimization for Athletes',
    description: 'Discover how quality sleep impacts your training, recovery, and overall performance. Get practical tips for optimizing your sleep environment and schedule.',
    duration: '35:18',
    thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=400&fit=crop',
    audioUrl: '#',
    category: 'Recovery',
    listens: 2956,
    publishDate: '2024-01-08'
  },
  {
    id: '5',
    title: 'Injury Prevention Strategies',
    description: 'Learn proven methods to prevent common training injuries. Understand proper warm-up protocols, mobility work, and how to listen to your body.',
    duration: '29:45',
    thumbnail: 'https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=400&h=400&fit=crop',
    audioUrl: '#',
    category: 'Health',
    listens: 3344,
    publishDate: '2024-01-05'
  },
  {
    id: '6',
    title: 'Building a Home Gym on a Budget',
    description: 'Complete guide to creating an effective home gym without breaking the bank. Learn which equipment gives you the most bang for your buck.',
    duration: '22:12',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
    audioUrl: '#',
    category: 'Equipment',
    listens: 5678,
    publishDate: '2024-01-03'
  }
];



  const togglePlayPause = (episode: PodcastEpisode) => {
    if (episode.audioUrl.includes('youtube.com') || episode.audioUrl.includes('youtu.be')) {
      setCurrentVideoEpisode(episode);
      setIsVideoModalOpen(true);
      return;
    }
    
    if (currentEpisode?.id !== episode.id) {
      setCurrentEpisode(episode);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('youtube.com/watch?v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1].split('?')[0];
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Consistency': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Training Science': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Nutrition': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Recovery': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Health': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Challenges': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Motivation': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Business': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'

    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const isYouTubeVideo = (episode: PodcastEpisode) => {
    return episode.audioUrl.includes('youtube.com') || episode.audioUrl.includes('youtu.be');
  };

  return (
    // FIXED: Applied same layout structure as Dashboard.tsx
    <div className="h-screen flex bg-background overflow-hidden pt-8 md:pt-0">
      
      {/* Sidebar: Hidden on mobile (hidden), visible on desktop (md:block) */}
      <div className="hidden md:block h-full">
        <Sidebar currentPage="audio" onLogout={onLogout} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        
        <main className="flex-1 overflow-auto p-6 scrollbar-hide">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="space-y-2">
              <h1>Fitness Podcasts & Audio Content</h1>
              <p className="text-muted-foreground">
                Enhance your fitness journey with expert insights, motivation, and education through our curated audio content.
              </p>
            </div>

            {/* Videos Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Play className="size-5 text-primary" />
                <h2>Fitness Videos</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {podcastEpisodes.filter(episode => isYouTubeVideo(episode)).map((episode) => (
                  <Card 
                    key={episode.id} 
                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-primary/20"
                    onClick={() => togglePlayPause(episode)}
                  >
                    <div className="relative">
                      <ImageWithFallback
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className={`${getCategoryColor(episode.category)} mb-2`}>
                          {episode.category}
                        </Badge>
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Play className="size-4" />
                          <span>Watch Video</span>
                          <Users className="size-4 ml-auto" />
                          <span>{episode.listens.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-4 right-4 size-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                      >
                        <Play className="size-6" />
                      </Button>
                    </div>
                    
                    <CardHeader className="space-y-3">
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {episode.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {episode.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{episode.publishDate}</span>
                        <span>{episode.listens.toLocaleString()} views</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Audio Podcasts Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Volume2 className="size-5 text-primary" />
                <h2>Audio Podcasts</h2>
              </div>
              
              {currentEpisode && !isYouTubeVideo(currentEpisode) && (
                <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <ImageWithFallback
                          src={currentEpisode.thumbnail}
                          alt={currentEpisode.title}
                          className="size-20 rounded-xl object-cover shadow-lg"
                        />
                        <Button
                          size="sm"
                          variant="default"
                          className="absolute -bottom-2 -right-2 size-8 rounded-full shadow-lg"
                          onClick={() => togglePlayPause(currentEpisode)}
                        >
                          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                        </Button>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="line-clamp-1">{currentEpisode.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-1">
                            {currentEpisode.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm"><SkipBack className="size-4" /></Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => togglePlayPause(currentEpisode)}
                          >
                            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                          </Button>
                          <Button variant="ghost" size="sm"><SkipForward className="size-4" /></Button>
                          <div className="flex-1 space-y-2">
                            <Slider value={[currentTime]} max={duration} step={1} className="w-full" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{formatTime(currentTime)}</span>
                              <span>{currentEpisode.duration}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Volume2 className="size-4 text-muted-foreground" />
<Slider
  value={[volume]}
  max={100}
  step={1}
  className="w-20"
  onValueChange={(value: number[]) => setVolume(value[0])}
/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {podcastEpisodes.filter(episode => !isYouTubeVideo(episode)).map((episode) => (
                  <Card 
                    key={episode.id} 
                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                    onClick={() => togglePlayPause(episode)}
                  >
                    <div className="relative">
                      <ImageWithFallback
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className={`${getCategoryColor(episode.category)} mb-2`}>
                          {episode.category}
                        </Badge>
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Clock className="size-4" />
                          <span>{episode.duration}</span>
                          <Users className="size-4 ml-auto" />
                          <span>{episode.listens.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" className="absolute top-4 right-4 size-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm">
                         {currentEpisode?.id === episode.id && isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                      </Button>
                    </div>
                    <CardHeader className="space-y-3">
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{episode.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{episode.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{episode.publishDate}</span>
                        <span>{episode.listens.toLocaleString()} listens</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        {currentEpisode && (
          <audio
            ref={audioRef}
            src={currentEpisode.audioUrl}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Video Modal */}
        <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
          <DialogContent className="max-w-4xl w-full h-auto p-0 overflow-hidden border-none bg-background">
            {currentVideoEpisode && (
              <div className="flex flex-col">
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(currentVideoEpisode.audioUrl)}
                    title={currentVideoEpisode.title}
                    className="absolute inset-0 size-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">{currentVideoEpisode.title}</h2>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getCategoryColor(currentVideoEpisode.category)}`}>
                        {currentVideoEpisode.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="size-4" />
                        <span>{currentVideoEpisode.listens.toLocaleString()} views</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {currentVideoEpisode.publishDate}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentVideoEpisode.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}