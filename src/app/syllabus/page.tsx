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
  CheckCircle,
  Circle,
  Clock,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronRight,
  Target,
  Award,
  AlertCircle,
  BarChart3,
  History,
  CalendarDays,
} from 'lucide-react';
import { examAPI, onboardingAPI } from '@/lib/api';

interface Topic {
  id: string;
  name: string;
  weightage: number;
  confidence: number;
  questionsAttempted: number;
  questionsCorrect: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  lastPracticed?: string;
}

interface Subject {
  id: string;
  name: string;
  overallProgress: number;
  topics: Topic[];
  expanded: boolean;
}

export default function SyllabusPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('syllabus');
  const [examSelection, setExamSelection] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 'physics',
      name: 'Physics',
      overallProgress: 68,
      expanded: true,
      topics: [
        { id: 'p1', name: 'Mechanics', weightage: 15, confidence: 85, questionsAttempted: 45, questionsCorrect: 38, status: 'mastered', lastPracticed: '2 hours ago' },
        { id: 'p2', name: 'Thermodynamics', weightage: 12, confidence: 58, questionsAttempted: 30, questionsCorrect: 17, status: 'in-progress', lastPracticed: '1 day ago' },
        { id: 'p3', name: 'Electromagnetism', weightage: 18, confidence: 72, questionsAttempted: 50, questionsCorrect: 36, status: 'in-progress', lastPracticed: '3 hours ago' },
        { id: 'p4', name: 'Optics', weightage: 10, confidence: 45, questionsAttempted: 20, questionsCorrect: 9, status: 'in-progress', lastPracticed: '2 days ago' },
        { id: 'p5', name: 'Modern Physics', weightage: 15, confidence: 90, questionsAttempted: 60, questionsCorrect: 54, status: 'mastered', lastPracticed: '5 hours ago' },
        { id: 'p6', name: 'Waves and Sound', weightage: 10, confidence: 0, questionsAttempted: 0, questionsCorrect: 0, status: 'not-started' },
        { id: 'p7', name: 'Rotational Motion', weightage: 8, confidence: 65, questionsAttempted: 25, questionsCorrect: 16, status: 'in-progress', lastPracticed: '1 day ago' },
        { id: 'p8', name: 'Gravitation', weightage: 7, confidence: 78, questionsAttempted: 35, questionsCorrect: 27, status: 'completed', lastPracticed: '6 hours ago' },
        { id: 'p9', name: 'Fluid Mechanics', weightage: 5, confidence: 0, questionsAttempted: 0, questionsCorrect: 0, status: 'not-started' },
      ],
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      overallProgress: 62,
      expanded: false,
      topics: [
        { id: 'c1', name: 'Organic Chemistry - Basics', weightage: 20, confidence: 45, questionsAttempted: 40, questionsCorrect: 18, status: 'in-progress', lastPracticed: '1 hour ago' },
        { id: 'c2', name: 'Inorganic Chemistry', weightage: 18, confidence: 82, questionsAttempted: 55, questionsCorrect: 45, status: 'mastered', lastPracticed: '4 hours ago' },
        { id: 'c3', name: 'Physical Chemistry', weightage: 15, confidence: 70, questionsAttempted: 45, questionsCorrect: 31, status: 'in-progress', lastPracticed: '2 hours ago' },
        { id: 'c4', name: 'Chemical Bonding', weightage: 12, confidence: 88, questionsAttempted: 50, questionsCorrect: 44, status: 'mastered', lastPracticed: '1 day ago' },
        { id: 'c5', name: 'Thermodynamics', weightage: 10, confidence: 55, questionsAttempted: 30, questionsCorrect: 16, status: 'in-progress', lastPracticed: '3 days ago' },
        { id: 'c6', name: 'Electrochemistry', weightage: 10, confidence: 0, questionsAttempted: 0, questionsCorrect: 0, status: 'not-started' },
        { id: 'c7', name: 'Coordination Compounds', weightage: 8, confidence: 62, questionsAttempted: 25, questionsCorrect: 15, status: 'in-progress', lastPracticed: '2 days ago' },
        { id: 'c8', name: 'Chemical Kinetics', weightage: 7, confidence: 0, questionsAttempted: 0, questionsCorrect: 0, status: 'not-started' },
      ],
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      overallProgress: 75,
      expanded: false,
      topics: [
        { id: 'm1', name: 'Algebra', weightage: 18, confidence: 92, questionsAttempted: 70, questionsCorrect: 64, status: 'mastered', lastPracticed: '3 hours ago' },
        { id: 'm2', name: 'Calculus - Differentiation', weightage: 15, confidence: 78, questionsAttempted: 60, questionsCorrect: 47, status: 'completed', lastPracticed: '5 hours ago' },
        { id: 'm3', name: 'Calculus - Integration', weightage: 15, confidence: 52, questionsAttempted: 50, questionsCorrect: 26, status: 'in-progress', lastPracticed: '1 hour ago' },
        { id: 'm4', name: 'Coordinate Geometry', weightage: 12, confidence: 85, questionsAttempted: 55, questionsCorrect: 47, status: 'mastered', lastPracticed: '2 days ago' },
        { id: 'm5', name: 'Trigonometry', weightage: 10, confidence: 88, questionsAttempted: 45, questionsCorrect: 40, status: 'mastered', lastPracticed: '1 day ago' },
        { id: 'm6', name: 'Vectors and 3D Geometry', weightage: 10, confidence: 68, questionsAttempted: 40, questionsCorrect: 27, status: 'in-progress', lastPracticed: '6 hours ago' },
        { id: 'm7', name: 'Probability', weightage: 8, confidence: 75, questionsAttempted: 35, questionsCorrect: 26, status: 'completed', lastPracticed: '4 hours ago' },
        { id: 'm8', name: 'Matrices and Determinants', weightage: 7, confidence: 0, questionsAttempted: 0, questionsCorrect: 0, status: 'not-started' },
        { id: 'm9', name: 'Differential Equations', weightage: 5, confidence: 60, questionsAttempted: 25, questionsCorrect: 15, status: 'in-progress', lastPracticed: '2 days ago' },
      ],
    },
  ]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        let childId = user.id;
        
        // If user is a parent, fetch child profile to get child_id
        if (user.role === 'parent') {
          const childResponse = await onboardingAPI.getChildProfile(user.id);
          if (childResponse.data) {
            childId = childResponse.data.child_id;
          }
        }
        // For students, user.id is already the child_id
        
        // Get exam selection
        const examResponse = await examAPI.getExamSelection(childId);
        setExamSelection(examResponse.data);
      } catch (err) {
        console.log('Could not fetch data');
      }
    };

    fetchData();
  }, [user]);

  const toggleSubject = (subjectId: string) => {
    setSubjects(subjects.map(subject => 
      subject.id === subjectId 
        ? { ...subject, expanded: !subject.expanded }
        : subject
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <Award className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Complete Syllabus</h1>
              <p className="text-sm text-gray-600">Track your progress across all topics</p>
            </div>
            <Button variant="outline" onClick={() => router.push(user?.role === 'parent' ? '/parent-dashboard' : '/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="syllabus">Syllabus Progress</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Syllabus Progress Tab */}
          <TabsContent value="syllabus" className="space-y-6">
            {/* Overall Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card key={subject.id} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Overall Progress</span>
                        <span className="text-2xl font-bold text-blue-600">{subject.overallProgress}%</span>
                      </div>
                      <Progress value={subject.overallProgress} className="h-3" />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="font-semibold text-green-700">
                            {subject.topics.filter(t => t.status === 'mastered').length}
                          </p>
                          <p className="text-gray-600">Mastered</p>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <p className="font-semibold text-orange-700">
                            {subject.topics.filter(t => t.status === 'in-progress').length}
                          </p>
                          <p className="text-gray-600">In Progress</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Topic Breakdown */}
            <div className="space-y-4">
              {subjects.map((subject) => (
                <Card key={subject.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {subject.expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        <div>
                          <CardTitle>{subject.name}</CardTitle>
                          <CardDescription>{subject.topics.length} topics</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{subject.overallProgress}%</p>
                          <p className="text-xs text-gray-500">Complete</p>
                        </div>
                        <div className="w-32">
                          <Progress value={subject.overallProgress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {subject.expanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {subject.topics.map((topic) => (
                          <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900">{topic.name}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(topic.status)}`}>
                                    {getStatusIcon(topic.status)}
                                    {topic.status.replace('-', ' ')}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                    Weightage: {topic.weightage}%
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="text-gray-600">Confidence Level</span>
                                      <span className="font-semibold">{topic.confidence}%</span>
                                    </div>
                                    <Progress value={topic.confidence} className="h-2" />
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600">Questions</p>
                                      <p className="font-semibold">{topic.questionsAttempted} attempted</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Accuracy</p>
                                      <p className="font-semibold text-green-600">
                                        {topic.questionsAttempted > 0 
                                          ? Math.round((topic.questionsCorrect / topic.questionsAttempted) * 100)
                                          : 0}%
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {topic.lastPracticed ? `Last practiced: ${topic.lastPracticed}` : 'Not started yet'}
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant={topic.status === 'not-started' ? 'default' : 'outline'}
                                    onClick={() => router.push(`/practice/${topic.id}`)}
                                  >
                                    {topic.status === 'not-started' ? 'Start Practice' : 
                                     topic.status === 'mastered' ? 'Review' : 'Continue Practice'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Week */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                    Current Week Schedule
                  </CardTitle>
                  <CardDescription>Week of Dec 1 - Dec 7, 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { day: 'Monday', date: 'Dec 1', topics: ['Mechanics - Advanced', 'Organic Chemistry'], hours: 4.5, status: 'completed' },
                      { day: 'Tuesday', date: 'Dec 2', topics: ['Calculus - Integration', 'Thermodynamics'], hours: 4, status: 'completed' },
                      { day: 'Wednesday', date: 'Dec 3', topics: ['Electromagnetism', 'Coordination Compounds'], hours: 5, status: 'in-progress' },
                      { day: 'Thursday', date: 'Dec 4', topics: ['Probability', 'Chemical Kinetics'], hours: 4.5, status: 'upcoming' },
                      { day: 'Friday', date: 'Dec 5', topics: ['Optics', 'Physical Chemistry'], hours: 4, status: 'upcoming' },
                      { day: 'Saturday', date: 'Dec 6', topics: ['Mock Test - Full Length'], hours: 3, status: 'upcoming' },
                      { day: 'Sunday', date: 'Dec 7', topics: ['Review & Weak Areas'], hours: 3, status: 'upcoming' },
                    ].map((schedule, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-2 ${
                          schedule.status === 'completed' ? 'bg-green-50 border-green-200' :
                          schedule.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">{schedule.date}</p>
                              <p className="font-semibold text-gray-900">{schedule.day}</p>
                            </div>
                            {schedule.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {schedule.status === 'in-progress' && <Clock className="w-5 h-5 text-blue-600 animate-pulse" />}
                          </div>
                          <span className="text-sm font-medium text-gray-600">{schedule.hours} hrs</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {schedule.topics.map((topic, idx) => (
                            <span key={idx} className="text-xs px-3 py-1 bg-white rounded-full border border-gray-300">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">28.5</p>
                      <p className="text-sm text-gray-600">Total Hours</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">2</p>
                        <p className="text-xs text-gray-600">Days Complete</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-xl font-bold text-orange-600">5</p>
                        <p className="text-xs text-gray-600">Days Remaining</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Milestones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { title: 'Physics Module 3 Complete', date: 'Dec 5', priority: 'high' },
                      { title: 'Full Length Mock Test', date: 'Dec 6', priority: 'high' },
                      { title: 'Chemistry Revision', date: 'Dec 10', priority: 'medium' },
                    ].map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                          <p className="text-xs text-gray-500">{milestone.date}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          milestone.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {milestone.priority}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Future Schedule Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Next 4 Weeks Preview
                </CardTitle>
                <CardDescription>Upcoming study plan overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { week: 'Week 2', dates: 'Dec 8-14', focus: 'Advanced Topics', topics: 8, hours: 30 },
                    { week: 'Week 3', dates: 'Dec 15-21', focus: 'Problem Solving', topics: 10, hours: 32 },
                    { week: 'Week 4', dates: 'Dec 22-28', focus: 'Mock Tests', topics: 6, hours: 28 },
                    { week: 'Week 5', dates: 'Dec 29-Jan 4', focus: 'Revision', topics: 12, hours: 35 },
                  ].map((week, index) => (
                    <div key={index} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                      <h4 className="font-semibold text-gray-900 mb-1">{week.week}</h4>
                      <p className="text-xs text-gray-500 mb-3">{week.dates}</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700"><span className="font-medium">Focus:</span> {week.focus}</p>
                        <p className="text-gray-700"><span className="font-medium">Topics:</span> {week.topics}</p>
                        <p className="text-gray-700"><span className="font-medium">Hours:</span> {week.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Past Performance */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    Past Schedule Performance
                  </CardTitle>
                  <CardDescription>Your study history and completion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { week: 'Week -4', dates: 'Nov 3-9', completion: 95, hours: 28, topics: 12, status: 'excellent' },
                      { week: 'Week -3', dates: 'Nov 10-16', completion: 88, hours: 26, topics: 10, status: 'good' },
                      { week: 'Week -2', dates: 'Nov 17-23', completion: 72, hours: 22, topics: 9, status: 'average' },
                      { week: 'Week -1', dates: 'Nov 24-30', completion: 85, hours: 25, topics: 11, status: 'good' },
                    ].map((history, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{history.week}</h4>
                            <p className="text-xs text-gray-500">{history.dates}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            history.status === 'excellent' ? 'bg-green-100 text-green-700' :
                            history.status === 'good' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {history.completion}% Complete
                          </span>
                        </div>
                        
                        <Progress value={history.completion} className="h-2 mb-3" />
                        
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="font-semibold text-gray-900">{history.hours}</p>
                            <p className="text-xs text-gray-600">Hours</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="font-semibold text-gray-900">{history.topics}</p>
                            <p className="text-xs text-gray-600">Topics</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="font-semibold text-gray-900">
                              {history.status === 'excellent' ? '🏆' : history.status === 'good' ? '👍' : '📈'}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">{history.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">87%</p>
                      <p className="text-sm text-gray-600">Avg. Completion</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Weeks</span>
                        <span className="font-semibold text-gray-900">4</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Hours</span>
                        <span className="font-semibold text-gray-900">101</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Topics Covered</span>
                        <span className="font-semibold text-gray-900">42</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trends</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Improving</span>
                      </div>
                      <p className="text-xs text-gray-600">Completion rate up 13% from last month</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Consistent</span>
                      </div>
                      <p className="text-xs text-gray-600">Maintaining 25+ hours per week</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">On Track</span>
                      </div>
                      <p className="text-xs text-gray-600">Meeting 90% of weekly goals</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Topic-wise History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Topic Activity</CardTitle>
                <CardDescription>Last 20 practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { topic: 'Calculus - Integration', subject: 'Mathematics', date: '1 hour ago', questions: 15, correct: 12, time: '25 min' },
                    { topic: 'Organic Chemistry', subject: 'Chemistry', date: '2 hours ago', questions: 20, correct: 9, time: '35 min' },
                    { topic: 'Electromagnetism', subject: 'Physics', date: '3 hours ago', questions: 18, correct: 14, time: '30 min' },
                    { topic: 'Probability', subject: 'Mathematics', date: '5 hours ago', questions: 12, correct: 11, time: '20 min' },
                    { topic: 'Modern Physics', subject: 'Physics', date: '6 hours ago', questions: 15, correct: 14, time: '22 min' },
                    { topic: 'Coordinate Geometry', subject: 'Mathematics', date: '1 day ago', questions: 20, correct: 17, time: '32 min' },
                    { topic: 'Inorganic Chemistry', subject: 'Chemistry', date: '1 day ago', questions: 18, correct: 16, time: '28 min' },
                    { topic: 'Thermodynamics', subject: 'Physics', date: '2 days ago', questions: 16, correct: 9, time: '27 min' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-900">{activity.topic}</h4>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {activity.subject}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{activity.correct}/{activity.questions}</p>
                          <p className="text-xs text-gray-500">Correct</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-blue-600">
                            {Math.round((activity.correct / activity.questions) * 100)}%
                          </p>
                          <p className="text-xs text-gray-500">Accuracy</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{activity.time}</p>
                          <p className="text-xs text-gray-500">Time</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
