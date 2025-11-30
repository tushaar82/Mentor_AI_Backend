"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { examAPI } from '@/lib/api';
import { ExamSelectionForm } from '@/components/onboarding/ExamSelectionForm';
import { ExamDateSelectionDialog } from '@/components/onboarding/ExamDateSelectionDialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingAPI } from '@/lib/api';

interface AvailableExam {
  exam_type: string;
  exam_name: string;
  available_dates: string[];
  subjects: string[];
}

interface ExamSelection {
  child_id: string;
  exam_type: string;
  exam_date: string;
  subject_preferences: Record<string, number>;
  days_until_exam: number;
  diagnostic_test_id: string;
  created_at: string;
}

export default function ExamSelectionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [availableExams, setAvailableExams] = useState<AvailableExam[]>([]);
  const [examSelection, setExamSelection] = useState<ExamSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [selectedExamName, setSelectedExamName] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [examDates, setExamDates] = useState<any[]>([]);
  const [childProfile, setChildProfile] = useState<any>(null);

  // Get parent_id from auth context and child_id from child profile
  const parentId = user?.id || '';
  const childId = childProfile?.child_id || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch child profile first
        try {
          const childResponse = await onboardingAPI.getChildProfile(user.id);
          setChildProfile(childResponse.data);
        } catch (err) {
          // No child profile exists, redirect to child profile creation
          router.push('/onboarding/child-profile');
          return;
        }
        
        // Fetch available exams
        const examsResponse = await examAPI.getAvailableExams();
        setAvailableExams(examsResponse.data.exams);
        
        // Check if exam selection already exists
        if (childProfile?.child_id) {
          try {
            const selectionResponse = await examAPI.getExamSelection(childProfile.child_id);
            setExamSelection(selectionResponse.data);
          } catch (err) {
            // No exam selection exists yet
            console.log('No exam selection found');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load exam information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleExamSelect = (examData: any) => {
    setExamSelection(examData);
    setShowForm(false);
  };

  const handleExamTypeSelect = (examType: string, examName: string, dates: any[]) => {
    setSelectedExamType(examType);
    setSelectedExamName(examName);
    setExamDates(dates);
    setShowDateDialog(true);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowDateDialog(false);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Exam Selection
            </CardTitle>
            <CardDescription className="text-center">
              Choose your target competitive exam and set subject preferences
            </CardDescription>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-center mt-6 space-x-2">
              <div className="h-2 w-8 bg-blue-600 rounded-full"></div>
              <div className="h-2 w-8 bg-blue-600 rounded-full"></div>
              <div className="h-2 w-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              Step 3 of 3: Exam Selection
            </p>
          </CardHeader>
        </Card>

        {examSelection ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Exam Selected</CardTitle>
              <CardDescription>
                Your exam selection has been saved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-600 mb-2">Exam Type</h3>
                    <p className={`text-xl font-bold ${examSelection.exam_type === 'JEE_COMBO' ? 'text-indigo-700' : 'text-blue-700'}`}>
                      {examSelection.exam_type === 'JEE_COMBO' ? 'JEE Main + Advanced' : examSelection.exam_type.replace('_', ' ')}
                    </p>
                    {examSelection.exam_type === 'JEE_COMBO' && (
                      <p className="text-sm text-indigo-600 mt-1">Comprehensive preparation for both exams</p>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-600 mb-2">Exam Date</h3>
                    <p className="text-xl font-bold text-blue-700">{new Date(examSelection.exam_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-600 mb-2">Days Until Exam</h3>
                    <p className="text-3xl font-bold text-green-600">{examSelection.days_until_exam}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-600 mb-2">Diagnostic Test</h3>
                  <p className="text-lg">Test ID: <span className="font-mono bg-white px-2 py-1 rounded">{examSelection.diagnostic_test_id}</span></p>
                </div>
              </div>
              <div className="mt-8 flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3"
                >
                  Change Exam
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Available Exams</CardTitle>
                <CardDescription>
                  Select one of the following competitive exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {availableExams.map((exam) => (
                    <Card key={exam.exam_type} className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 ${exam.exam_type === 'JEE_COMBO' ? 'md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50' : ''}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className={`text-xl text-center ${exam.exam_type === 'JEE_COMBO' ? 'text-indigo-700' : 'text-blue-700'}`}>
                          {exam.exam_name}
                          {exam.exam_type === 'JEE_COMBO' && (
                            <span className="block text-sm font-normal text-indigo-600 mt-1">Best value - Prepare for both exams</span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-600 mb-2">Upcoming Dates:</h4>
                          <div className="space-y-1">
                            {exam.available_dates.slice(0, exam.exam_type === 'JEE_COMBO' ? 4 : 2).map((date) => (
                              <div key={date} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>{new Date(date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                                <span className="text-sm text-blue-600 font-medium">
                                  {Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                                </span>
                              </div>
                            ))}
                            {exam.exam_type === 'JEE_COMBO' && exam.available_dates.length > 4 && (
                              <p className="text-sm text-gray-500 text-center">... and {exam.available_dates.length - 4} more dates</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-600 mb-2">Subjects:</h4>
                          <div className="flex flex-wrap gap-2">
                            {exam.subjects.map((subject) => (
                              <span key={subject} className={`px-3 py-1 rounded-full text-sm font-medium ${exam.exam_type === 'JEE_COMBO' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          className={`w-full mt-4 font-semibold py-3 ${exam.exam_type === 'JEE_COMBO' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                          onClick={() => {
                            // Get exam dates from JSON file
                            fetch('/data/exam_dates.json')
                              .then(response => response.json())
                              .then(data => {
                                const dates = data[exam.exam_type] || [];
                                handleExamTypeSelect(exam.exam_type, exam.exam_name, dates);
                              })
                              .catch(error => {
                                console.error('Error loading exam dates:', error);
                                // Fallback to showing form directly
                                setShowForm(true);
                              });
                          }}
                        >
                          Select This Exam
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showForm && (
          <ExamSelectionForm
            parentId={parentId}
            childId={childId}
            availableExams={availableExams}
            onSuccess={handleExamSelect}
            onCancel={() => setShowForm(false)}
            existingSelection={examSelection}
            preselectedExamType={selectedExamType}
            preselectedDate={selectedDate}
          />
        )}

        {showDateDialog && (
          <ExamDateSelectionDialog
            open={showDateDialog}
            onOpenChange={setShowDateDialog}
            examType={selectedExamType}
            examName={selectedExamName}
            dates={examDates}
            onSelectDate={handleDateSelect}
          />
        )}
      </div>
    </div>
  );
}