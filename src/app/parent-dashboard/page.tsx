'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LogOut,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  FileText,
  Users,
  Brain,
  Award,
  AlertCircle,
  CheckCircle,
  DollarSign,
  MessageSquare,
  Lightbulb,
  BarChart3,
  Settings,
  Bell,
  Heart,
  Sparkles,
} from 'lucide-react';
import { examAPI, onboardingAPI } from '@/lib/api';

export default function ParentDashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [childData, setChildData] = useState<any>(null);
  const [diagnosticTest, setDiagnosticTest] = useState<any>(null);
  const [examSelection, setExamSelection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('No user, redirecting to auth');
      router.push('/auth');
    } else if (!isLoading && user) {
      console.log('User found:', { role: user.role, is_student: user.is_student });
      if (user.role === 'student' || user.is_student) {
        // Students should not access parent dashboard
        console.log('Student detected, redirecting to student dashboard');
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const childResponse = await onboardingAPI.getChildProfile(user.id);
        
        if (childResponse.data) {
          setChildData(childResponse.data);
          
          try {
            const examResponse = await examAPI.getExamSelection(childResponse.data.child_id);
            setExamSelection(examResponse.data);
            
            const scheduledTest = localStorage.getItem('scheduled_test');
            if (scheduledTest) {
              setDiagnosticTest(JSON.parse(scheduledTest));
            }
          } catch (err) {
            console.log('No exam selection found');
          }
        }
      } catch (err) {
        console.log('Could not fetch dashboard data');
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Parent Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user.full_name}! Monitor and guide your child's learning journey
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="guidance">Guidance</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Access Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Complete Syllabus</h3>
                        <p className="text-sm text-gray-600">Monitor progress and schedules</p>
                      </div>
                    </div>
                    <Button onClick={() => router.push('/syllabus')} className="bg-blue-600 hover:bg-blue-700">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Study Center</h3>
                        <p className="text-sm text-gray-600">Access learning materials</p>
                      </div>
                    </div>
                    <Button onClick={() => router.push('/study-center')} className="bg-purple-600 hover:bg-purple-700">
                      Explore
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Schedule Exam</h3>
                        <p className="text-sm text-gray-600">Book diagnostic test slot</p>
                      </div>
                    </div>
                    <Button onClick={() => router.push('/schedule-diagnostic')} className="bg-green-600 hover:bg-green-700">
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
            >
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">78%</h3>
                  <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                  <p className="text-xs text-gray-500 mt-1">↑ 12% from last week</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">7 days</h3>
                  <p className="text-sm font-medium text-gray-600">Study Streak</p>
                  <p className="text-xs text-gray-500 mt-1">Excellent consistency!</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">4.5 hrs</h3>
                  <p className="text-sm font-medium text-gray-600">Daily Study Time</p>
                  <p className="text-xs text-gray-500 mt-1">Average this week</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">85%</h3>
                  <p className="text-sm font-medium text-gray-600">Practice Accuracy</p>
                  <p className="text-xs text-gray-500 mt-1">Last 50 questions</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Child Info & Exam Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Child Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {childData ? (
                    <>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Name</span>
                        <span className="text-sm font-medium">{childData.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Age</span>
                        <span className="text-sm font-medium">{childData.age} years</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Grade</span>
                        <span className="text-sm font-medium">Grade {childData.grade}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Current Level</span>
                        <span className="text-sm font-medium capitalize">{childData.current_level}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No child profile found</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Exam Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {examSelection ? (
                    <>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Target Exam</span>
                        <span className="text-sm font-medium">{examSelection.exam_type?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Exam Date</span>
                        <span className="text-sm font-medium">
                          {examSelection.exam_date ? new Date(examSelection.exam_date).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Days Remaining</span>
                        <span className="text-sm font-medium text-orange-600">
                          {examSelection.exam_date 
                            ? Math.ceil((new Date(examSelection.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                            : 'N/A'
                          } days
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Preparation Status</span>
                        <span className="text-sm font-medium text-green-600">On Track</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No exam selected</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Weak Areas & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    Areas Needing Attention
                  </CardTitle>
                  <CardDescription>Topics where your child needs support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { topic: 'Organic Chemistry', score: 45, priority: 'High' },
                    { topic: 'Calculus - Integration', score: 52, priority: 'High' },
                    { topic: 'Thermodynamics', score: 58, priority: 'Medium' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.topic}</p>
                        <p className="text-xs text-gray-500">Score: {item.score}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.priority}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => router.push('/guidance')}>
                          Help
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Strong Areas
                  </CardTitle>
                  <CardDescription>Topics where your child excels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { topic: 'Algebra', score: 92, improvement: '+8%' },
                    { topic: 'Mechanics', score: 88, improvement: '+5%' },
                    { topic: 'Inorganic Chemistry', score: 85, improvement: '+12%' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.topic}</p>
                        <p className="text-xs text-gray-500">Score: {item.score}%</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                        {item.improvement}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Cost Savings */}
            <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  Cost Savings Calculator
                </CardTitle>
                <CardDescription>Money saved vs traditional coaching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Traditional Coaching</p>
                    <p className="text-3xl font-bold text-gray-900">₹2,50,000</p>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Mentor AI Platform</p>
                    <p className="text-3xl font-bold text-blue-600">₹12,000</p>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                    <p className="text-sm text-green-800 mb-2">You're Saving</p>
                    <p className="text-3xl font-bold text-green-700">₹2,38,000</p>
                    <p className="text-xs text-green-600 mt-1">95% savings!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Performance Analytics
                  </CardTitle>
                  <CardDescription>Detailed breakdown of your child's progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { subject: 'Physics', progress: 75, weak: 2, strong: 8, total: 12 },
                      { subject: 'Chemistry', progress: 68, weak: 4, strong: 6, total: 15 },
                      { subject: 'Mathematics', progress: 82, weak: 1, strong: 10, total: 14 },
                    ].map((subject, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{subject.subject}</span>
                          <span className="text-sm font-bold text-blue-600">{subject.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{subject.weak} weak topics</span>
                          <span>{subject.strong} strong topics</span>
                          <span>{subject.total} total topics</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: '7-Day Streak', icon: '🔥', date: 'Today' },
                    { title: 'Math Master', icon: '🎯', date: '2 days ago' },
                    { title: 'Quick Learner', icon: '⚡', date: '5 days ago' },
                    { title: 'Perfect Score', icon: '💯', date: '1 week ago' },
                  ].map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                        <p className="text-xs text-gray-500">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mentoring Effectiveness</CardTitle>
                <CardDescription>Impact of your involvement on child's progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">24</p>
                    <p className="text-sm text-gray-600 mt-1">Joint Study Sessions</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">18 hrs</p>
                    <p className="text-sm text-gray-600 mt-1">Total Mentoring Time</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">+15%</p>
                    <p className="text-sm text-gray-600 mt-1">Performance Boost</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">92%</p>
                    <p className="text-sm text-gray-600 mt-1">Engagement Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Schedule Exam Card */}
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Schedule Diagnostic Test
                </CardTitle>
                <CardDescription>Book a time slot for your child's diagnostic exam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">
                      Schedule a diagnostic test to assess your child's current level and identify areas for improvement.
                    </p>
                    <p className="text-xs text-gray-600">
                      {diagnosticTest?.status === 'scheduled' 
                        ? `Test scheduled for ${new Date(diagnosticTest.scheduled_date).toLocaleString()}`
                        : 'No test scheduled yet'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/schedule-diagnostic')} 
                    className="bg-green-600 hover:bg-green-700 ml-4"
                    size="lg"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    {diagnosticTest?.status === 'scheduled' ? 'Reschedule Test' : 'Schedule Test'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Weekly Study Schedule
                </CardTitle>
                <CardDescription>Recommended study plan for this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { day: 'Monday', topics: ['Organic Chemistry', 'Calculus'], hours: '4.5 hrs', status: 'completed' },
                    { day: 'Tuesday', topics: ['Thermodynamics', 'Algebra'], hours: '4 hrs', status: 'completed' },
                    { day: 'Wednesday', topics: ['Mechanics', 'Coordination Compounds'], hours: '5 hrs', status: 'in-progress' },
                    { day: 'Thursday', topics: ['Integration', 'Electrochemistry'], hours: '4.5 hrs', status: 'pending' },
                    { day: 'Friday', topics: ['Optics', 'Differential Equations'], hours: '4 hrs', status: 'pending' },
                    { day: 'Saturday', topics: ['Mock Test - Full Length'], hours: '3 hrs', status: 'pending' },
                    { day: 'Sunday', topics: ['Review & Revision'], hours: '3 hrs', status: 'pending' },
                  ].map((schedule, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      schedule.status === 'completed' ? 'bg-green-50 border-green-200' :
                      schedule.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{schedule.day}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{schedule.hours}</span>
                          {schedule.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {schedule.status === 'in-progress' && <Clock className="w-5 h-5 text-blue-600" />}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {schedule.topics.map((topic, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-white rounded border border-gray-300">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Mentoring Plan</CardTitle>
                  <CardDescription>Recommended activities for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { time: '4:00 PM - 5:00 PM', activity: 'Review Organic Chemistry concepts together', type: 'teaching' },
                    { time: '5:00 PM - 5:30 PM', activity: 'Practice 10 questions on Calculus', type: 'practice' },
                    { time: '5:30 PM - 6:00 PM', activity: 'Discuss mistakes and clarify doubts', type: 'review' },
                  ].map((plan, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{plan.time}</p>
                        <p className="text-sm text-gray-600">{plan.activity}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Milestones</CardTitle>
                  <CardDescription>Important dates and goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: 'Complete Physics Module 3', date: 'Dec 5, 2025', priority: 'high' },
                    { title: 'Full Length Mock Test', date: 'Dec 7, 2025', priority: 'high' },
                    { title: 'Chemistry Revision Complete', date: 'Dec 12, 2025', priority: 'medium' },
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
          </TabsContent>

          {/* Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    Teaching Guidance
                  </CardTitle>
                  <CardDescription>How to help your child with weak topics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { topic: 'Organic Chemistry', action: 'View Teaching Notes', icon: BookOpen },
                    { topic: 'Calculus - Integration', action: 'Watch Tutorial', icon: Brain },
                    { topic: 'Thermodynamics', action: 'Get Methodology', icon: Lightbulb },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{item.topic}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        {item.action}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Motivation Tools
                  </CardTitle>
                  <CardDescription>Keep your child engaged and motivated</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: 'Celebrate 7-Day Streak', description: 'Reward ideas and encouragement', icon: '🎉' },
                    { title: 'Stress Management Tips', description: 'Help reduce exam anxiety', icon: '🧘' },
                    { title: 'Goal Setting Workshop', description: 'Set realistic milestones together', icon: '🎯' },
                  ].map((tool, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <span className="text-2xl">{tool.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{tool.title}</p>
                        <p className="text-xs text-gray-500">{tool.description}</p>
                      </div>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Communication Strategies
                </CardTitle>
                <CardDescription>Effective ways to discuss studies with your child</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'When Performance Drops',
                      tips: ['Stay calm and supportive', 'Ask open-ended questions', 'Focus on effort, not just results'],
                      color: 'orange'
                    },
                    {
                      title: 'When Child is Stressed',
                      tips: ['Listen without judgment', 'Validate their feelings', 'Suggest breaks and relaxation'],
                      color: 'blue'
                    },
                    {
                      title: 'When Celebrating Success',
                      tips: ['Acknowledge hard work', 'Set new achievable goals', 'Share pride and encouragement'],
                      color: 'green'
                    },
                    {
                      title: 'Daily Check-ins',
                      tips: ['Ask about challenges faced', 'Review what was learned', 'Plan tomorrow together'],
                      color: 'purple'
                    },
                  ].map((strategy, index) => (
                    <div key={index} className={`p-4 bg-${strategy.color}-50 rounded-lg border border-${strategy.color}-200`}>
                      <h4 className="font-semibold text-gray-900 mb-3">{strategy.title}</h4>
                      <ul className="space-y-2">
                        {strategy.tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Parent Well-being
                </CardTitle>
                <CardDescription>Taking care of yourself while supporting your child</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Remember: Your well-being directly impacts your child's success. Take time for self-care and don't hesitate to seek support.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button variant="outline" className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      Parent Community
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Expert Q&A
                    </Button>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Success Stories
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Teaching Resources
                  </CardTitle>
                  <CardDescription>Materials to help you teach effectively</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        subject: 'Physics',
                        topics: [
                          { name: 'Mechanics - Teaching Notes', type: 'PDF', language: 'English/Hindi' },
                          { name: 'Thermodynamics - Mindmap', type: 'Visual', language: 'English/Hindi' },
                          { name: 'Optics - Audio Summary', type: 'Audio', language: 'Hindi' },
                        ]
                      },
                      {
                        subject: 'Chemistry',
                        topics: [
                          { name: 'Organic Chemistry - Teaching Guide', type: 'PDF', language: 'English/Hindi' },
                          { name: 'Coordination Compounds - Mindmap', type: 'Visual', language: 'English' },
                          { name: 'Electrochemistry - Audio Summary', type: 'Audio', language: 'Hindi' },
                        ]
                      },
                      {
                        subject: 'Mathematics',
                        topics: [
                          { name: 'Calculus - Teaching Methodology', type: 'PDF', language: 'English/Hindi' },
                          { name: 'Algebra - Mindmap', type: 'Visual', language: 'English' },
                          { name: 'Integration - Audio Summary', type: 'Audio', language: 'Hindi' },
                        ]
                      },
                    ].map((subject, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">{subject.subject}</h4>
                        <div className="space-y-2">
                          {subject.topics.map((topic, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{topic.name}</p>
                                <p className="text-xs text-gray-500">{topic.type} • {topic.language}</p>
                              </div>
                              <Button size="sm" variant="ghost">
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { tip: 'Use real-world examples when teaching concepts', icon: '🌍' },
                    { tip: 'Break complex topics into smaller chunks', icon: '🧩' },
                    { tip: 'Encourage questions and curiosity', icon: '❓' },
                    { tip: 'Review mistakes together without blame', icon: '🔍' },
                    { tip: 'Celebrate small wins regularly', icon: '🎊' },
                    { tip: 'Maintain consistent study schedule', icon: '⏰' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <span className="text-xl">{item.icon}</span>
                      <p className="text-sm text-gray-700">{item.tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Parent Learning Path</CardTitle>
                <CardDescription>Improve your mentoring skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Effective Teaching Techniques', progress: 75, modules: 8 },
                    { title: 'Understanding Exam Patterns', progress: 60, modules: 6 },
                    { title: 'Motivation & Psychology', progress: 40, modules: 5 },
                  ].map((course, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                      <p className="text-xs text-gray-500 mb-3">{course.modules} modules</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">{course.progress}% complete</span>
                        <Button size="sm" variant="link">Continue</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Parent Community
                </CardTitle>
                <CardDescription>Connect with other parents on the same journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'Success Story: From 60% to 85% in 3 months', author: 'Priya M.', likes: 45 },
                    { title: 'How I helped my child overcome math anxiety', author: 'Rajesh K.', likes: 32 },
                    { title: 'Balancing work and mentoring - My experience', author: 'Anita S.', likes: 28 },
                  ].map((post, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{post.title}</p>
                        <p className="text-xs text-gray-500">by {post.author} • {post.likes} likes</p>
                      </div>
                      <Button size="sm" variant="ghost">Read</Button>
                    </div>
                  ))}
                  <Button className="w-full mt-4" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Join Discussion Forum
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
