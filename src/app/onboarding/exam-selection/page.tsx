"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { examAPI } from '@/lib/api';
import { ExamSelectionForm } from '@/components/onboarding/ExamSelectionForm';
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
  const [showForm, setShowForm] = useState(true);
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
        console.log('Exam Selection Page: Starting data fetch...');
        console.log('User ID:', user.id);
        
        // Fetch child profile first
        let childData;
        try {
          console.log('Fetching child profile...');
          const childResponse = await onboardingAPI.getChildProfile(user.id);
          childData = childResponse.data;
          setChildProfile(childData);
          console.log('Child profile loaded:', childData);
        } catch (err) {
          console.error('No child profile found:', err);
          // No child profile exists, redirect to child profile creation
          router.push('/onboarding/child-profile');
          return;
        }
        
        // Fetch available exams
        console.log('Fetching available exams...');
        const examsResponse = await examAPI.getAvailableExams();
        console.log('Available exams:', examsResponse.data);
        setAvailableExams(examsResponse.data.exams || examsResponse.data);
        
        // Check if exam selection already exists
        if (childData?.child_id) {
          try {
            console.log('Checking for existing exam selection...');
            const selectionResponse = await examAPI.getExamSelection(childData.child_id);
            setExamSelection(selectionResponse.data);
            console.log('Exam selection found, redirecting to schedule diagnostic');
            
            // If exam selection exists, redirect to schedule diagnostic page
            router.push('/schedule-diagnostic');
            return;
          } catch (err) {
            // No exam selection exists yet - this is expected
            console.log('No exam selection found - showing form');
          }
        }
        
        console.log('Ready to show exam selection form');
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
    // Redirect to schedule diagnostic page
    router.push('/schedule-diagnostic');
  };


  // Show loading state while loading data
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
                  onClick={() => router.push('/parent-dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : showForm && parentId && childId && availableExams.length > 0 ? (
          <ExamSelectionForm
            parentId={parentId}
            childId={childId}
            availableExams={availableExams}
            onSuccess={handleExamSelect}
            onCancel={() => router.push('/parent-dashboard')}
            existingSelection={examSelection}
          />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">Loading exam selection form...</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}