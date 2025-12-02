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
  PlayCircle,
  BarChart3,
  Flame,
  Zap,
  Trophy,
  BookMarked,
} from 'lucide-react';
import { examAPI, onboardingAPI } from '@/lib/api';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [diagnosticTest, setDiagnosticTest] = useState<any>(null);
  const [examSelection, setExamSelection] = useState<any>(null);
  const [childData, setChildData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('No user, redirecting to auth');
      router.push('/auth');
    } else if (!isLoading && user) {
      console.log('User found:', { role: user.role, is_student: user.is_student });
      if (user.role === 'parent' && !user.is_student) {
        // Parents should not access student dashboard
        console.log('Parent detected, redirecting to parent dashboard');
        router.push('/parent-dashboard');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        let childId = user.id;
        
        // If user is a student, they already have their child_id
        // If user is a parent, we need to fetch the child profile
        if (user.role === 'parent') {
          const childResponse = await onboardingAPI.getChildProfile(user.id);
          if (childResponse.data) {
            const childDataResponse = childResponse.data;
            setChildData(childDataResponse);
            childId = childDataResponse.child_id;
          }
        } else {
          // For students, user.id is already the child_id
          // We can set basic child data from user info
          setChildData({
            child_id: user.id,
            name: user.full_name,
          });
        }
        
        // Get exam selection using child_id
        try {
          const examResponse = await examAPI.getExamSelection(childId);
          setExamSelection(examResponse.data);
          console.log('Exam selection loaded:', examResponse.data);
            
          // Check for scheduled test in localStorage first
          const scheduledTest = localStorage.getItem('scheduled_test');
          if (scheduledTest) {
            setDiagnosticTest(JSON.parse(scheduledTest));
          } else if (examResponse.data.diagnostic_test_id) {
            // Get diagnostic test details from API
            try {
              const testResponse = await examAPI.getDiagnosticTest(examResponse.data.diagnostic_test_id);
              setDiagnosticTest(testResponse.data);
              
              // Check if diagnostic test is completed
              if (testResponse.data.status === 'completed') {
                setDiagnosticCompleted(true);
              }
            } catch (err) {
              console.log('Could not fetch diagnostic test details');
            }
          }
        } catch (err) {
          console.log('No exam selection found');
        }
      } catch (err) {
        console.log('Could not fetch dashboard data');
      }
    };

    if (user) {
      fetchDashboardData();
    }
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
                Welcome back, {user.full_name}!
              </h1>
              <p className="text-sm text-gray-600">Student Dashboard</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show setup incomplete message if no exam selection */}
        {!examSelection && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Setup In Progress
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Your parent is still completing the setup process. Once they select your target exam and schedule the diagnostic test, you'll be able to access all features including practice modules, study plans, and progress tracking.
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      Please ask your parent to complete the onboarding process by selecting an exam.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Show diagnostic test prompt if exam selected but test not completed */}
        {examSelection && !diagnosticCompleted && diagnosticTest && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Complete Your Diagnostic Test
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Take the diagnostic test to unlock your personalized study plan, practice modules, and track your progress. This test helps us understand your strengths and areas for improvement.
                    </p>
                    <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => router.push('/diagnostic-test/' + diagnosticTest.test_id)}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Diagnostic Test Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Exam Info Banner */}
        {examSelection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Target Exam</p>
                      <p className="text-lg font-bold text-gray-900">
                        {examSelection.exam_type?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Exam Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {examSelection.exam_date ? new Date(examSelection.exam_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Not set'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Days Remaining</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {examSelection.exam_date 
                          ? Math.ceil((new Date(examSelection.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="study-plan">Study Plan</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
            >
              <Card className="lg:col-span-2 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookMarked className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Complete Syllabus</h3>
                        <p className="text-sm text-gray-600">Track progress and schedules</p>
                      </div>
                    </div>
                    <Button onClick={() => router.push('/syllabus')} className="bg-blue-600 hover:bg-blue-700">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Study Center</h3>
                        <p className="text-sm text-gray-600">Access all learning materials</p>
                      </div>
                    </div>
                    <Button onClick={() => router.push('/study-center')} className="bg-purple-600 hover:bg-purple-700">
                      Explore
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {[
                {
                  icon: Flame,
                  title: 'Study Streak',
                  value: '7 days',
                  description: 'Keep it up!',
                  color: 'text-orange-600',
                  bgColor: 'bg-orange-100',
                },
                {
                  icon: Target,
                  title: 'Practice Accuracy',
                  value: '85%',
                  description: 'Last 50 questions',
                  color: 'text-green-600',
                  bgColor: 'bg-green-100',
                },
                {
                  icon: TrendingUp,
                  title: 'Overall Progress',
                  value: '78%',
                  description: 'Syllabus coverage',
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-100',
                },
                {
                  icon: Clock,
                  title: 'Study Time',
                  value: '4.5 hrs',
                  description: 'Today',
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-100',
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: stat.color.replace('text-', '') }}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Weak & Strong Topics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    Topics to Focus On
                  </CardTitle>
                  <CardDescription>Your weak areas that need attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { topic: 'Organic Chemistry', score: 45, questions: 12 },
                    { topic: 'Calculus - Integration', score: 52, questions: 15 },
                    { topic: 'Thermodynamics', score: 58, questions: 10 },
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{item.topic}</span>
                        <span className="text-sm font-bold text-red-600">{item.score}%</span>
                      </div>
                      <Progress value={item.score} className="h-2 mb-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{item.questions} questions practiced</span>
                        <Button size="sm" variant="outline" onClick={() => router.push('/practice/' + item.topic)}>
                          Practice
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Your Strong Topics
                  </CardTitle>
                  <CardDescription>Topics where you excel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { topic: 'Algebra', score: 92, improvement: '+8%' },
                    { topic: 'Mechanics', score: 88, improvement: '+5%' },
                    { topic: 'Inorganic Chemistry', score: 85, improvement: '+12%' },
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{item.topic}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-600">{item.score}%</span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            {item.improvement}
                          </span>
                        </div>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Today's Tasks & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Today's Tasks
                  </CardTitle>
                  <CardDescription>Your study plan for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { task: 'Complete Organic Chemistry Module', status: 'completed', time: '45 min' },
                    { task: 'Practice 20 Calculus Questions', status: 'in-progress', time: '30 min' },
                    { task: 'Review Thermodynamics Concepts', status: 'pending', time: '25 min' },
                    { task: 'Take Mock Test - Physics', status: 'pending', time: '60 min' },
                  ].map((item, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      item.status === 'completed' ? 'bg-green-50' :
                      item.status === 'in-progress' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        {item.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {item.status === 'in-progress' && <Clock className="w-5 h-5 text-blue-600" />}
                        {item.status === 'pending' && <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.task}</p>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription>Your latest milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: '7-Day Streak', icon: '🔥', date: 'Today', points: '+50' },
                    { title: 'Math Master', icon: '🎯', date: '2 days ago', points: '+100' },
                    { title: 'Quick Learner', icon: '⚡', date: '5 days ago', points: '+75' },
                    { title: 'Perfect Score', icon: '💯', date: '1 week ago', points: '+150' },
                  ].map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                          <p className="text-xs text-gray-500">{achievement.date}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-orange-600">{achievement.points}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Study Plan Tab */}
          <TabsContent value="study-plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-blue-600" />
                  Your Personalized Study Plan
                </CardTitle>
                <CardDescription>AI-generated plan based on your diagnostic test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { week: 'Week 1', topics: ['Organic Chemistry Basics', 'Calculus Fundamentals', 'Thermodynamics'], progress: 75 },
                    { week: 'Week 2', topics: ['Advanced Organic Chemistry', 'Integration Techniques', 'Heat Transfer'], progress: 45 },
                    { week: 'Week 3', topics: ['Reaction Mechanisms', 'Differential Equations', 'Entropy & Enthalpy'], progress: 20 },
                    { week: 'Week 4', topics: ['Mock Tests & Revision', 'Problem Solving', 'Weak Area Focus'], progress: 0 },
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{item.week}</h4>
                        <span className="text-sm font-medium text-blue-600">{item.progress}% Complete</span>
                      </div>
                      <Progress value={item.progress} className="h-2 mb-3" />
                      <div className="flex flex-wrap gap-2">
                        {item.topics.map((topic, idx) => (
                          <span key={idx} className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
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
                  <CardTitle>Daily Schedule</CardTitle>
                  <CardDescription>Recommended study times</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { time: '6:00 AM - 7:30 AM', activity: 'Morning Revision', subject: 'Physics' },
                    { time: '4:00 PM - 6:00 PM', activity: 'New Topic Learning', subject: 'Chemistry' },
                    { time: '7:00 PM - 9:00 PM', activity: 'Practice & Problem Solving', subject: 'Mathematics' },
                  ].map((schedule, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{schedule.time}</p>
                        <p className="text-sm text-gray-600">{schedule.activity}</p>
                        <p className="text-xs text-purple-600 mt-1">{schedule.subject}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Milestones</CardTitle>
                  <CardDescription>Important goals to achieve</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { milestone: 'Complete Physics Module 3', date: 'Dec 5, 2025', priority: 'high' },
                    { milestone: 'Full Length Mock Test', date: 'Dec 7, 2025', priority: 'high' },
                    { milestone: 'Chemistry Revision Complete', date: 'Dec 12, 2025', priority: 'medium' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.milestone}</p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { subject: 'Physics', topics: 12, completed: 8, color: 'blue' },
                { subject: 'Chemistry', topics: 15, completed: 10, color: 'green' },
                { subject: 'Mathematics', topics: 14, completed: 11, color: 'purple' },
              ].map((subject, index) => (
                <Card key={index} className={`border-2 border-${subject.color}-200`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className={`w-5 h-5 text-${subject.color}-600`} />
                      {subject.subject}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{subject.completed}/{subject.topics} topics</span>
                        </div>
                        <Progress value={(subject.completed / subject.topics) * 100} className="h-2" />
                      </div>
                      <Button className="w-full" variant="outline">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continue Practice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Practice Modules</CardTitle>
                <CardDescription>Topic-wise practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { topic: 'Organic Chemistry', questions: 50, completed: 30, difficulty: 'Medium', subject: 'Chemistry' },
                    { topic: 'Calculus - Integration', questions: 40, completed: 15, difficulty: 'Hard', subject: 'Mathematics' },
                    { topic: 'Thermodynamics', questions: 35, completed: 20, difficulty: 'Medium', subject: 'Physics' },
                    { topic: 'Algebra', questions: 45, completed: 42, difficulty: 'Easy', subject: 'Mathematics' },
                  ].map((module, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{module.topic}</h4>
                          <p className="text-xs text-gray-500">{module.subject}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          module.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          module.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {module.difficulty}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{module.completed}/{module.questions}</span>
                        </div>
                        <Progress value={(module.completed / module.questions) * 100} className="h-2" />
                      </div>
                      <Button size="sm" className="w-full" variant="outline">
                        {module.completed === module.questions ? 'Review' : 'Continue'}
                      </Button>
                    </div>
                  ))}
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
                    Subject-wise Performance
                  </CardTitle>
                  <CardDescription>Your mastery across subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { subject: 'Physics', mastery: 75, weak: 2, strong: 8, total: 12 },
                      { subject: 'Chemistry', mastery: 68, weak: 4, strong: 6, total: 15 },
                      { subject: 'Mathematics', mastery: 82, weak: 1, strong: 10, total: 14 },
                    ].map((subject, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{subject.subject}</span>
                          <span className="text-sm font-bold text-blue-600">{subject.mastery}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                            style={{ width: `${subject.mastery}%` }}
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
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Total Questions', value: '1,245', icon: Target },
                    { label: 'Correct Answers', value: '1,058', icon: CheckCircle },
                    { label: 'Accuracy Rate', value: '85%', icon: TrendingUp },
                    { label: 'Study Hours', value: '127 hrs', icon: Clock },
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <stat.icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
                <CardDescription>AI-powered recommendations for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Time Management',
                      insight: 'You spend 20% more time on easy questions. Try to trust your first instinct.',
                      icon: Clock,
                      color: 'blue'
                    },
                    {
                      title: 'Best Study Time',
                      insight: 'Your accuracy is highest between 6-8 AM. Schedule difficult topics during this time.',
                      icon: Zap,
                      color: 'yellow'
                    },
                    {
                      title: 'Weak Pattern',
                      insight: 'You consistently struggle with application-based questions in Organic Chemistry.',
                      icon: AlertCircle,
                      color: 'red'
                    },
                    {
                      title: 'Improvement Trend',
                      insight: 'Your Calculus score improved by 15% this week. Keep up the great work!',
                      icon: TrendingUp,
                      color: 'green'
                    },
                  ].map((insight, index) => (
                    <div key={index} className={`p-4 bg-${insight.color}-50 rounded-lg border border-${insight.color}-200`}>
                      <div className="flex items-start gap-3">
                        <insight.icon className={`w-5 h-5 text-${insight.color}-600 mt-0.5`} />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-700">{insight.insight}</p>
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
