"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { examAPI } from '@/lib/api';

interface ExamDate {
  date: string;
  session: string;
  last_date_to_apply: string;
  exam_type?: string;
}

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

interface ExamSelectionFormProps {
  parentId: string;
  childId: string;
  availableExams: AvailableExam[];
  onSuccess: (selection: ExamSelection) => void;
  onCancel: () => void;
  existingSelection?: ExamSelection | null;
  preselectedExamType?: string;
  preselectedDate?: string;
}

export function ExamSelectionForm({
  parentId,
  childId,
  availableExams,
  onSuccess,
  onCancel,
  existingSelection,
  preselectedExamType,
  preselectedDate
}: ExamSelectionFormProps) {
  const [selectedExamType, setSelectedExamType] = useState<string>(
    existingSelection?.exam_type || preselectedExamType || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    existingSelection?.exam_date || preselectedDate || ''
  );
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);

  // Calculate days remaining until exam
  const calculateDaysRemaining = (dateString: string) => {
    const examDate = new Date(dateString);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Fetch exam dates when exam type changes
  useEffect(() => {
    if (!selectedExamType) return;
    
    const fetchExamDates = async () => {
      setLoadingDates(true);
      try {
        const response = await fetch('/exam_dates.json');
        const data = await response.json();
        setExamDates(data[selectedExamType] || []);
      } catch (error) {
        console.error('Error loading exam dates:', error);
        setExamDates([]);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchExamDates();
  }, [selectedExamType]);

  // Handle exam type change
  const handleExamTypeChange = (examType: string) => {
    setSelectedExamType(examType);
    setSelectedDate('');
    setExamDates([]);
  };

  // Validate form before submission
  const validateForm = () => {
    if (!selectedExamType) {
      return { valid: false, message: 'Please select an exam type' };
    }
    
    if (!selectedDate) {
      return { valid: false, message: 'Please select an exam date' };
    }
    
    return { valid: true, message: '' };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    
    setLoading(true);
    
    try {
      // Create equal subject preferences automatically
      const exam = availableExams.find(e => e.exam_type === selectedExamType);
      let subjectPreferences: Record<string, number> = {};
      
      if (exam) {
        const equalWeight = Math.floor(100 / exam.subjects.length);
        const remainder = 100 - (equalWeight * exam.subjects.length);
        
        exam.subjects.forEach((subject, index) => {
          subjectPreferences[subject] = equalWeight + (index === 0 ? remainder : 0);
        });
      }
      
      const examData = {
        exam_type: selectedExamType as 'JEE_MAIN' | 'JEE_ADVANCED' | 'JEE_COMBO' | 'NEET',
        exam_date: new Date(selectedDate).toISOString(),
        subject_preferences: subjectPreferences
      };
      
      if (existingSelection) {
        // Update existing selection
        const response = await examAPI.updateSubjectPreferences(
          parentId,
          childId,
          subjectPreferences
        );
        onSuccess(response.data);
        alert('✅ Exam preferences updated successfully!');
      } else {
        // Create new selection
        const response = await examAPI.selectExam(
          parentId,
          childId,
          examData
        );
        onSuccess(response.data);
        alert('🎉 Exam selected successfully! Redirecting to your diagnostic test...');
      }
    } catch (error: any) {
      console.error('Error saving exam selection:', error);
      alert(error.response?.data?.detail || '❌ Failed to save exam selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {existingSelection ? '📝 Update Exam Selection' : '🎯 Select Your Target Exam'}
        </CardTitle>
        <CardDescription className="text-base">
          {existingSelection
            ? 'Update your target exam and preparation preferences'
            : 'Choose your target competitive exam to get a personalized study plan'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam Type Selection */}
          <div className="space-y-3">
            <Label htmlFor="exam-type" className="text-base font-medium">📚 Which exam are you preparing for?</Label>
            <Select
              value={selectedExamType}
              onValueChange={handleExamTypeChange}
              disabled={!!existingSelection}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select an exam type" />
              </SelectTrigger>
              <SelectContent>
                {availableExams.map((exam) => (
                  <SelectItem key={exam.exam_type} value={exam.exam_type}>
                    <div className="flex items-center">
                      <span>{exam.exam_name}</span>
                      {exam.exam_type === 'JEE_COMBO' && <span className="ml-2 text-sm text-indigo-600">(Recommended)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Date Selection */}
          {selectedExamType && (
            <div className="space-y-3">
              <Label htmlFor="exam-date" className="text-base font-medium">📅 When is your exam?</Label>
              {loadingDates ? (
                <div className="flex items-center justify-center h-12 border rounded-md">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <Select
                  value={selectedDate}
                  onValueChange={setSelectedDate}
                  disabled={!!existingSelection}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select an exam date" />
                  </SelectTrigger>
                  <SelectContent>
                    {examDates.map((dateInfo, index) => {
                      const daysLeft = calculateDaysRemaining(dateInfo.date);
                      return (
                        <SelectItem key={index} value={dateInfo.date}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span>{new Date(dateInfo.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</span>
                              <span className="text-sm text-gray-500">{dateInfo.session}</span>
                            </div>
                            <span className={`text-sm ml-2 font-medium ${
                              daysLeft <= 30 ? 'text-red-600' : 
                              daysLeft <= 60 ? 'text-yellow-600' : 
                              'text-green-600'
                            }`}>
                              {daysLeft} days
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Days Remaining Display */}
          {selectedDate && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-800">Days Until Exam</h3>
                <div className={`text-3xl font-bold my-2 ${
                  calculateDaysRemaining(selectedDate) <= 30 ? 'text-red-600' : 
                  calculateDaysRemaining(selectedDate) <= 60 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {calculateDaysRemaining(selectedDate)}
                </div>
                <p className="text-sm text-blue-700">
                  {calculateDaysRemaining(selectedDate) <= 30 ? '⚠️ Limited time - Start preparing now!' : 
                   calculateDaysRemaining(selectedDate) <= 60 ? '⏰ Time to get serious about preparation' : 
                   '✅ Good time to prepare thoroughly'}
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-500">
              {existingSelection ? 'You can update subject preferences' : 'This will create your personalized study plan'}
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedExamType || !selectedDate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8 8 0 01-8 8"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {existingSelection ? '📝 Update' : '🚀 Select'} Exam
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}