"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowLeft, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { examAPI, onboardingAPI } from '@/lib/api';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface DaySlot {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  timeSlots: TimeSlot[];
}

interface ChildProfile {
  child_id: string;
  name: string;
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

interface ScheduledTest {
  test_id: string;
  exam_type: string;
  student_id: string;
  generation_date: string;
  start_date?: string;
  submission_date?: string;
  status: string;
}

export default function ScheduleDiagnosticPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [examSelection, setExamSelection] = useState<ExamSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<DaySlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        setLoading(true);
        
        // Check if user has completed onboarding FIRST (before showing any content)
        try {
          const statusResponse = await examAPI.getOnboardingStatus(user.id);
          const status = statusResponse.data;
          
          // If onboarding is complete, redirect to parent dashboard immediately with a small delay to ensure smooth transition
          if (status?.onboarding_complete) {
            setTimeout(() => {
              router.push('/parent-dashboard');
            }, 100); // Small delay to ensure smooth redirect
            return;
          }
          
          // Set checking status to false after check is complete
          setIsCheckingStatus(false);
        } catch (err) {
          console.log('Could not check onboarding status, proceeding with normal flow');
          setIsCheckingStatus(false);
        }
        
        // Check if user already has a scheduled test in localStorage
        const scheduledTest = localStorage.getItem('scheduled_test');
        if (scheduledTest) {
          const testData = JSON.parse(scheduledTest);
          if (testData.status === 'scheduled') {
            router.push('/parent-dashboard');
            return;
          }
        }
        
        // Fetch child profile
        try {
          const childResponse = await onboardingAPI.getChildProfile(user.id);
          const childData = childResponse.data;
          setChildProfile(childData);
          
          // Check if user already has scheduled tests
          if (childData?.child_id) {
            try {
              const scheduledTestsResponse = await examAPI.getScheduledTests(childData.child_id);
              const scheduledTests = scheduledTestsResponse.data;
              
              // If user has already scheduled a test, redirect to parent dashboard
              if (scheduledTests && scheduledTests.length > 0) {
                const hasScheduledTest = scheduledTests.some((test: ScheduledTest) => 
                  test.status === 'scheduled' || test.status === 'pending'
                );
                if (hasScheduledTest) {
                  router.push('/parent-dashboard');
                  return;
                }
              }
            } catch (err) {
              // No scheduled tests found, continue with scheduling flow
              console.log('No scheduled tests found, proceeding with scheduling');
            }
            
            // Fetch exam selection
            try {
              const examResponse = await examAPI.getExamSelection(childData.child_id);
              setExamSelection(examResponse.data);
            } catch (err) {
              console.error('No exam selection found:', err);
              setError('No exam selection found. Please select an exam first.');
              return;
            }
          }
        } catch (err) {
          // No child profile exists, redirect to child profile creation
          router.push('/onboarding/child-profile');
          return;
        }
        
        // Generate available time slots for current month
        generateTimeSlots();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load scheduling information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const generateTimeSlots = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    const slots: DaySlot[] = [];
    
    // Get the first day of the current month
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Generate calendar days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateString = date.toISOString().split('T')[0];
      
      // Skip past dates and weekends
      if (date < today || date.getDay() === 0 || date.getDay() === 6) {
        slots.push({
          date,
          dateString,
          dayName,
          dayNumber: day,
          isCurrentMonth: true,
          timeSlots: []
        });
        continue;
      }
      
      const timeSlots: TimeSlot[] = [
        { id: `${dateString}-09:00`, time: '09:00 AM', available: true },
        { id: `${dateString}-11:00`, time: '11:00 AM', available: true },
        { id: `${dateString}-14:00`, time: '02:00 PM', available: true },
        { id: `${dateString}-16:00`, time: '04:00 PM', available: true },
        { id: `${dateString}-18:00`, time: '06:00 PM', available: true },
      ];
      
      slots.push({
        date,
        dateString,
        dayName,
        dayNumber: day,
        isCurrentMonth: true,
        timeSlots
      });
    }
    
    setAvailableSlots(slots);
  };

  const handleDateSelect = (day: DaySlot) => {
    if (day.timeSlots.length > 0) {
      setSelectedDate(day.date);
      setShowTimeSlots(true);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleScheduleTest = async () => {
    if (!selectedDate || !selectedTime || !childProfile) {
      alert('Please select both date and time for your diagnostic test');
      return;
    }

    setScheduling(true);
    
    try {
      // Create a diagnostic test ID
      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Schedule the test via API
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(' ')[0].split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Call the backend API to schedule the test
      const result = await examAPI.scheduleDiagnosticTest({
        child_id: childProfile.child_id,
        exam_type: examSelection?.exam_type || '',
        scheduled_date: scheduledDateTime.toISOString(),
        test_id: testId,
      });
      
      alert(`Diagnostic test scheduled for ${scheduledDateTime.toLocaleString()}`);
      
      // Save the scheduled test data to localStorage for dashboard display
      const scheduledTestData = {
        test_id: testId,
        exam_type: examSelection?.exam_type,
        scheduled_date: scheduledDateTime.toISOString(),
        status: 'scheduled',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('scheduled_test', JSON.stringify(scheduledTestData));
      
      // Redirect to the parent dashboard (parents should go to parent-dashboard)
      router.push('/parent-dashboard');
    } catch (err) {
      console.error('Error scheduling test:', err);
      setError('Failed to schedule diagnostic test. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const daySlot = availableSlots.find(slot => slot.dayNumber === day);
      days.push(daySlot || null);
    }
    
    return days;
  };

  const formatMonthYear = () => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  if (isCheckingStatus || loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-white">
                Schedule Diagnostic Test
              </CardTitle>
              <CardDescription className="text-center text-blue-100">
                Choose a convenient time slot for your {examSelection?.exam_type?.replace('_', ' ')} diagnostic test
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exam Information */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Exam Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-600 mb-1">Student Name</h3>
                    <p className="text-lg font-medium text-blue-900">{childProfile?.name}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-600 mb-1">Target Exam</h3>
                    <p className="text-lg font-medium text-green-900">{examSelection?.exam_type?.replace('_', ' ')}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-600 mb-1">Exam Date</h3>
                    <p className="text-lg font-medium text-purple-900">
                      {examSelection?.exam_date ? new Date(examSelection.exam_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-600 mb-1">Days Until Exam</h3>
                    <p className="text-lg font-medium text-orange-900">{examSelection?.days_until_exam || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Select Date
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeMonth(-1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeMonth(1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-center">
                  {formatMonthYear()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth().map((day, index) => (
                    <div
                      key={index}
                      className={`aspect-square flex items-center justify-center rounded-lg border ${
                        day === null 
                          ? 'border-gray-100' 
                          : day.timeSlots.length > 0 
                            ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer font-medium text-blue-900'
                            : 'border-gray-200 bg-gray-50 text-gray-400'
                      }`}
                      onClick={() => day && handleDateSelect(day)}
                    >
                      {day ? day.dayNumber : ''}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Slots Modal */}
          {showTimeSlots && selectedDate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Select Time for {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableSlots
                      .find(slot => slot.dateString === selectedDate.toISOString().split('T')[0])
                      ?.timeSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            className={`w-full justify-start ${
                              selectedTime === slot.time 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'hover:bg-blue-50'
                            }`}
                            onClick={() => handleTimeSelect(slot.time)}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            {slot.time}
                          </Button>
                        ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowTimeSlots(false);
                        setSelectedTime(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setShowTimeSlots(false);
                        handleScheduleTest();
                      }}
                      disabled={!selectedTime}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Confirm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Selected Slot Summary */}
          {selectedDate && selectedTime && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Selected Time Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-900 text-lg">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-blue-700 text-lg">Time: {selectedTime}</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <Button
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={handleScheduleTest}
                    disabled={scheduling}
                  >
                    {scheduling ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Scheduling...
                      </span>
                    ) : (
                      'Schedule Diagnostic Test'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}