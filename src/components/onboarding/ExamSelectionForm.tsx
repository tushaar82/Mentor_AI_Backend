"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { examAPI } from '@/lib/api';

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
  const [loading, setLoading] = useState(false);

  // Get subjects for the selected exam type
  const selectedExam = availableExams.find(exam => exam.exam_type === selectedExamType);
  const subjects = selectedExam?.subjects || [];

  // Initialize subject preferences when exam type changes
  const handleExamTypeChange = (examType: string) => {
    setSelectedExamType(examType);
    setSelectedDate('');
  };

  // Validate form before submission
  const validateForm = () => {
    if (!selectedExamType) {
      alert('Please select an exam type');
      return false;
    }
    
    if (!selectedDate) {
      alert('Please select an exam date');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
        exam_date: selectedDate,
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
        alert('Exam preferences updated successfully');
      } else {
        // Create new selection
        const response = await examAPI.selectExam(
          parentId,
          childId,
          examData
        );
        onSuccess(response.data);
        alert('Exam selected successfully');
      }
    } catch (error: any) {
      console.error('Error saving exam selection:', error);
      alert(error.response?.data?.detail || 'Failed to save exam selection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingSelection ? 'Update Exam Selection' : 'Select Exam'}
        </CardTitle>
        <CardDescription>
          {existingSelection
            ? 'Update your target exam and date'
            : 'Choose your target competitive exam'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="exam-type">Exam Type</Label>
            <Select
              value={selectedExamType}
              onValueChange={handleExamTypeChange}
              disabled={!!existingSelection} // Don't allow changing exam type after selection
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an exam type" />
              </SelectTrigger>
              <SelectContent>
                {availableExams.map((exam) => (
                  <SelectItem key={exam.exam_type} value={exam.exam_type}>
                    {exam.exam_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Date Selection */}
          {selectedExamType && (
            <div className="space-y-2">
              <Label htmlFor="exam-date">Exam Date</Label>
              <Select
                value={selectedDate}
                onValueChange={setSelectedDate}
                disabled={!!existingSelection} // Don't allow changing date after selection
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam date" />
                </SelectTrigger>
                <SelectContent>
                  {selectedExam?.available_dates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject Information */}
          {subjects.length > 0 && (
            <div className="space-y-4">
              <Label>Subjects</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {subjects.map((subject) => (
                  <div key={subject} className="p-3 border rounded-lg bg-gray-50">
                    <span className="font-medium">{subject}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Subject preferences will be automatically set to equal distribution.
                {selectedExamType === 'JEE_COMBO' && (
                  <span className="block mt-1 text-indigo-600 font-medium">
                    <strong>Note:</strong> JEE Combo prepares you for both JEE Main and Advanced exams with a comprehensive study plan.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6"
            >
              {loading ? 'Saving...' : (existingSelection ? 'Update Selection' : 'Select Exam')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}