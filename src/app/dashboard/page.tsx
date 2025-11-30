'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, BookOpen, Target, TrendingUp, Calendar, Clock, FileText } from 'lucide-react';
import { examAPI } from '@/lib/api';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [diagnosticTest, setDiagnosticTest] = useState<any>(null);
  const [examSelection, setExamSelection] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Try to get child profile first
        const childResponse = await onboardingAPI.getChildProfile(user.id);
        
        if (childResponse.data) {
          const childData = childResponse.data;
          
          // Get exam selection
          try {
            const examResponse = await examAPI.getExamSelection(childData.child_id);
            setExamSelection(examResponse.data);
            
            // Get diagnostic test details
            try {
              const testResponse = await examAPI.getDiagnosticTest(examResponse.data.diagnostic_test_id);
              setDiagnosticTest(testResponse.data);
            } catch (err) {
              console.log('Could not fetch diagnostic test details');
            }
          } catch (err) {
            console.log('No exam selection found');
          }
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
              <p className="text-sm text-gray-600 capitalize">{user.role} Dashboard</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              icon: BookOpen,
              title: 'Courses',
              value: '12',
              description: 'Active courses',
              color: 'text-blue-600',
              bgColor: 'bg-blue-100',
            },
            {
              icon: Target,
              title: 'Tests Taken',
              value: '45',
              description: 'Practice tests',
              color: 'text-green-600',
              bgColor: 'bg-green-100',
            },
            {
              icon: TrendingUp,
              title: 'Progress',
              value: '78%',
              description: 'Overall completion',
              color: 'text-purple-600',
              bgColor: 'bg-purple-100',
            },
            {
              icon: Calendar,
              title: 'Study Streak',
              value: '7 days',
              description: 'Keep it up!',
              color: 'text-orange-600',
              bgColor: 'bg-orange-100',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Completed Math Quiz', time: '2 hours ago' },
                  { title: 'Started Physics Chapter 5', time: '5 hours ago' },
                  { title: 'Earned "Quick Learner" Badge', time: '1 day ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Diagnostic Test Card */}
          {diagnosticTest && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Diagnostic Test
                </CardTitle>
                <CardDescription>
                  Your initial assessment is scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Test ID</p>
                      <p className="text-xs text-gray-500">Reference for support</p>
                    </div>
                    <p className="text-sm font-mono bg-blue-100 px-2 py-1 rounded">
                      {diagnosticTest.test_id}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Exam Type</p>
                      <p className="text-xs text-gray-500">Target exam</p>
                    </div>
                    <p className="text-sm font-medium text-blue-600">
                      {diagnosticTest.exam_type.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Scheduled Date</p>
                      <p className="text-xs text-gray-500">When to take the test</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-medium">
                        {new Date(diagnosticTest.scheduled_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Duration</p>
                      <p className="text-xs text-gray-500">Time allocated</p>
                    </div>
                    <p className="text-sm font-medium text-blue-600">
                      {diagnosticTest.duration_minutes} minutes
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Questions</p>
                      <p className="text-xs text-gray-500">Test length</p>
                    </div>
                    <p className="text-sm font-medium text-blue-600">
                      {diagnosticTest.total_questions} questions
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push('/diagnostic-test/' + diagnosticTest.test_id)}
                    >
                      Start Diagnostic Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tests</CardTitle>
              <CardDescription>Scheduled practice tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Chemistry Mock Test', date: 'Tomorrow, 10:00 AM' },
                  { title: 'Biology Chapter Test', date: 'Dec 2, 2:00 PM' },
                  { title: 'Full Length Mock Test', date: 'Dec 5, 9:00 AM' },
                ].map((test, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <p className="text-sm font-medium text-gray-900">{test.title}</p>
                    <p className="text-xs text-gray-500">{test.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
