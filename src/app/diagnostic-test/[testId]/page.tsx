"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function DiagnosticTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;
  
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(180 * 60); // 180 minutes in seconds

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await fetch(`/api/diagnostic-test/${testId}`);
        if (response.ok) {
          const data = await response.json();
          setTestData(data);
        } else {
          setError('Failed to load diagnostic test');
        }
      } catch (err) {
        setError('Error loading diagnostic test');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  useEffect(() => {
    if (!testStarted || testCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTestCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleAnswer = (questionIndex: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < (testData?.total_questions || 200) - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    try {
      const response = await fetch(`/api/diagnostic-test/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          time_taken: 180 * 60 - timeRemaining
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError('Failed to submit test');
      }
    } catch (err) {
      setError('Error submitting test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Error
            </CardTitle>
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

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Diagnostic Test
              </CardTitle>
              <CardDescription className="text-center">
                {testData?.exam_type?.replace('_', ' ')} Assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-blue-600">
                    {testData?.total_questions || 200}
                  </div>
                  <div className="text-lg text-gray-600">
                    Questions
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.floor((testData?.duration_minutes || 180) / 60)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Hours
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(testData?.duration_minutes || 180) % 60}
                    </div>
                    <div className="text-sm text-gray-600">
                      Minutes
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {testData?.exam_type?.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Exam Type
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Before You Start
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Ensure you have a stable internet connection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Find a quiet place to take the test</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Have pen and paper ready for calculations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Once started, the test cannot be paused</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8"
                    onClick={handleStartTest}
                  >
                    Start Diagnostic Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-green-600">
                Test Completed!
              </CardTitle>
              <CardDescription className="text-center">
                Thank you for completing the diagnostic test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="text-lg">
                  Your responses have been recorded. We'll analyze your performance
                  and create a personalized learning plan.
                </div>
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8"
                  onClick={handleSubmitTest}
                >
                  Submit Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                Diagnostic Test
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-lg font-mono font-bold text-red-600">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {testData?.total_questions || 200}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentQuestion + 1) / (testData?.total_questions || 200)) * 100)}% Complete
          </span>
        </div>
        <Progress 
          value={((currentQuestion + 1) / (testData?.total_questions || 200)) * 100} 
          className="h-2 mb-6"
        />
      </div>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Question */}
              <div className="text-lg font-medium text-gray-900">
                Question {currentQuestion + 1}: Sample question would appear here
              </div>
              
              {/* Options would go here */}
              <div className="space-y-3 mt-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  Option A: Sample option
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  Option B: Sample option
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  Option C: Sample option
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  Option D: Sample option
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button 
                  onClick={handleNext}
                >
                  {currentQuestion === (testData?.total_questions || 200) - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}