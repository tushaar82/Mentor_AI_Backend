'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Brain,
  FileText,
  PlayCircle,
  Volume2,
  Download,
  Share2,
  Bookmark,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Zap,
  Award,
  TrendingUp,
  Search,
  Filter,
  ChevronRight,
  Star,
  MessageSquare,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: 'mindmap' | 'summary' | 'practice' | 'video' | 'audio';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  completed: boolean;
  progress: number;
  rating: number;
  bookmarked: boolean;
}

export default function StudyCenterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const [materials, setMaterials] = useState<StudyMaterial[]>([
    // Physics
    { id: 'p1', title: 'Mechanics - Complete Mindmap', subject: 'Physics', type: 'mindmap', difficulty: 'medium', duration: '15 min', completed: true, progress: 100, rating: 4.8, bookmarked: true },
    { id: 'p2', title: 'Thermodynamics Summary', subject: 'Physics', type: 'summary', difficulty: 'hard', duration: '10 min', completed: false, progress: 60, rating: 4.5, bookmarked: false },
    { id: 'p3', title: 'Electromagnetism Practice - 50 Questions', subject: 'Physics', type: 'practice', difficulty: 'hard', duration: '60 min', completed: false, progress: 40, rating: 4.7, bookmarked: true },
    { id: 'p4', title: 'Optics Concepts - Audio Explanation', subject: 'Physics', type: 'audio', difficulty: 'medium', duration: '20 min', completed: false, progress: 0, rating: 4.6, bookmarked: false },
    { id: 'p5', title: 'Modern Physics Video Lecture', subject: 'Physics', type: 'video', difficulty: 'hard', duration: '45 min', completed: true, progress: 100, rating: 4.9, bookmarked: true },
    
    // Chemistry
    { id: 'c1', title: 'Organic Chemistry Reactions Mindmap', subject: 'Chemistry', type: 'mindmap', difficulty: 'hard', duration: '20 min', completed: false, progress: 30, rating: 4.7, bookmarked: true },
    { id: 'c2', title: 'Inorganic Chemistry Summary', subject: 'Chemistry', type: 'summary', difficulty: 'medium', duration: '12 min', completed: true, progress: 100, rating: 4.8, bookmarked: false },
    { id: 'c3', title: 'Chemical Bonding Practice', subject: 'Chemistry', type: 'practice', difficulty: 'medium', duration: '45 min', completed: false, progress: 70, rating: 4.6, bookmarked: false },
    { id: 'c4', title: 'Electrochemistry Audio Guide', subject: 'Chemistry', type: 'audio', difficulty: 'hard', duration: '25 min', completed: false, progress: 0, rating: 4.5, bookmarked: false },
    
    // Mathematics
    { id: 'm1', title: 'Calculus Integration Techniques', subject: 'Mathematics', type: 'mindmap', difficulty: 'hard', duration: '18 min', completed: false, progress: 50, rating: 4.9, bookmarked: true },
    { id: 'm2', title: 'Algebra Quick Reference', subject: 'Mathematics', type: 'summary', difficulty: 'easy', duration: '8 min', completed: true, progress: 100, rating: 4.7, bookmarked: true },
    { id: 'm3', title: 'Trigonometry Practice - 40 Questions', subject: 'Mathematics', type: 'practice', difficulty: 'medium', duration: '50 min', completed: false, progress: 80, rating: 4.8, bookmarked: false },
    { id: 'm4', title: 'Coordinate Geometry Video Tutorial', subject: 'Mathematics', type: 'video', difficulty: 'medium', duration: '35 min', completed: false, progress: 0, rating: 4.6, bookmarked: false },
  ]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || material.difficulty === selectedDifficulty;
    const matchesTab = activeTab === 'all' || material.type === activeTab;
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesTab;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mindmap': return <Brain className="w-5 h-5" />;
      case 'summary': return <FileText className="w-5 h-5" />;
      case 'practice': return <Target className="w-5 h-5" />;
      case 'video': return <PlayCircle className="w-5 h-5" />;
      case 'audio': return <Volume2 className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleBookmark = (id: string) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, bookmarked: !m.bookmarked } : m
    ));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Study Center</h1>
              <p className="text-sm text-gray-600">Access all learning materials in one place</p>
            </div>
            <Button variant="outline" onClick={() => router.push(user?.role === 'parent' ? '/parent-dashboard' : '/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
                  <p className="text-sm text-gray-600">Total Materials</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {materials.filter(m => m.completed).length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {materials.filter(m => m.progress > 0 && !m.completed).length}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {materials.filter(m => m.bookmarked).length}
                  </p>
                  <p className="text-sm text-gray-600">Bookmarked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Subjects</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Material Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mindmap">Mindmaps</TabsTrigger>
            <TabsTrigger value="summary">Summaries</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredMaterials.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No materials found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search query</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((material) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            material.type === 'mindmap' ? 'bg-purple-100 text-purple-600' :
                            material.type === 'summary' ? 'bg-blue-100 text-blue-600' :
                            material.type === 'practice' ? 'bg-green-100 text-green-600' :
                            material.type === 'video' ? 'bg-red-100 text-red-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {getTypeIcon(material.type)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(material.id)}
                            className="p-2"
                          >
                            <Bookmark
                              className={`w-5 h-5 ${
                                material.bookmarked ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                              }`}
                            />
                          </Button>
                        </div>
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {material.subject}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(material.difficulty)}`}>
                            {material.difficulty}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {material.duration}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Progress */}
                          {material.progress > 0 && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium">{material.progress}%</span>
                              </div>
                              <Progress value={material.progress} className="h-2" />
                            </div>
                          )}

                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(material.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{material.rating}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              variant={material.completed ? 'outline' : 'default'}
                              onClick={() => router.push(`/study/${material.id}`)}
                            >
                              {material.completed ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Review
                                </>
                              ) : material.progress > 0 ? (
                                <>
                                  <PlayCircle className="mr-2 h-4 w-4" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="mr-2 h-4 w-4" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Access Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                AI Study Assistant
              </CardTitle>
              <CardDescription>Get instant help with any topic</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask AI
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Quick Practice
              </CardTitle>
              <CardDescription>Random questions from weak areas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Target className="mr-2 h-4 w-4" />
                Start Practice
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Daily Challenge
              </CardTitle>
              <CardDescription>Complete today's challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <TrendingUp className="mr-2 h-4 w-4" />
                Take Challenge
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
