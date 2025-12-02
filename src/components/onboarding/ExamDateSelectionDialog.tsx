"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ExamDate {
  date: string;
  session: string;
  last_date_to_apply: string;
  exam_type?: string;
}

interface ExamDateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examType: string;
  examName: string;
  dates: ExamDate[];
  onSelectDate: (date: string) => void;
}

export function ExamDateSelectionDialog({
  open,
  onOpenChange,
  examType,
  examName,
  dates,
  onSelectDate
}: ExamDateSelectionDialogProps) {
  const calculateDaysRemaining = (dateString: string) => {
    const examDate = new Date(dateString);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateApplicationDaysRemaining = (dateString: string) => {
    const applicationDate = new Date(dateString);
    const today = new Date();
    const diffTime = applicationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExamTypeColor = (examType: string) => {
    switch (examType) {
      case 'JEE_MAIN':
        return 'bg-blue-100 text-blue-700';
      case 'JEE_ADVANCED':
        return 'bg-purple-100 text-purple-700';
      case 'NEET':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getExamTypeLabel = (examType: string) => {
    switch (examType) {
      case 'JEE_MAIN':
        return 'JEE Main';
      case 'JEE_ADVANCED':
        return 'JEE Advanced';
      case 'NEET':
        return 'NEET';
      default:
        return examType;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
            📅 Select Exam Date for {examName}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Choose your preferred exam date. Plan ahead to ensure adequate preparation time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-6">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 flex items-center">
              <span className="mr-2">💡</span>
              <strong>Pro Tip:</strong> Choose a date that gives you at least 3-4 months of preparation time for optimal results.
            </p>
          </div>
          
          {dates.map((dateInfo, index) => {
            const daysRemaining = calculateDaysRemaining(dateInfo.date);
            const applicationDaysRemaining = calculateApplicationDaysRemaining(dateInfo.last_date_to_apply);
            const isUrgent = applicationDaysRemaining <= 30;
            const isPastApplication = applicationDaysRemaining < 0;
            const isRecommended = index === 0; // Recommend the first date
            
            return (
              <div
                key={index}
                  className={`border rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer relative ${
                    isPastApplication ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-400 bg-white'
                  } ${isRecommended ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => !isPastApplication && onSelectDate(dateInfo.date)}
              >
                {isRecommended && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {new Date(dateInfo.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-lg text-gray-600">{new Date(dateInfo.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                      {dateInfo.exam_type && (
                        <Badge className={`${getExamTypeColor(dateInfo.exam_type)} text-sm px-3 py-1`}>
                          {getExamTypeLabel(dateInfo.exam_type)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 text-base mb-3">{dateInfo.session}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">📅 Exam Date</p>
                        <p className="font-semibold">{new Date(dateInfo.date).toLocaleDateString()}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        isUrgent ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                      }`}>
                        <p className="text-sm text-gray-600 mb-1">⏰ Application Deadline</p>
                        <p className={`font-semibold ${
                          isUrgent ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {new Date(dateInfo.last_date_to_apply).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center lg:text-right">
                    <div className={`inline-flex items-center justify-center rounded-lg p-4 ${
                      daysRemaining <= 60 ? 'bg-red-50' : daysRemaining <= 120 ? 'bg-yellow-50' : 'bg-green-50'
                    }`}>
                      <div className="text-3xl font-bold mb-1">
                        {daysRemaining}
                      </div>
                      <div className="text-sm text-gray-600">days until exam</div>
                      {daysRemaining <= 60 && (
                        <p className="text-xs text-red-600 mt-1">⚠️ Limited time - Start preparing now!</p>
                      )}
                    </div>
                    
                    <div className={`inline-flex items-center justify-center rounded-lg p-3 mt-2 ${
                      isPastApplication ? 'bg-gray-100' : isUrgent ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <div className="text-lg font-semibold">
                        {applicationDaysRemaining}
                      </div>
                      <div className="text-sm text-gray-600">
                        {isPastApplication ? 'days past deadline' : 'days to apply'}
                      </div>
                      {!isPastApplication && isUrgent && (
                        <p className="text-xs text-red-600 mt-1">⏰ Apply soon!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Select a date to proceed with exam selection
          </div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}