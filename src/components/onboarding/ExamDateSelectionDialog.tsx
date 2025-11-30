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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Select Exam Date for {examName}
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose your preferred exam date. Make sure to apply before the last date.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-6">
          {dates.map((dateInfo, index) => {
            const daysRemaining = calculateDaysRemaining(dateInfo.date);
            const applicationDaysRemaining = calculateApplicationDaysRemaining(dateInfo.last_date_to_apply);
            const isUrgent = applicationDaysRemaining <= 30;
            const isPastApplication = applicationDaysRemaining < 0;
            
            return (
              <div 
                key={index} 
                className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                  isPastApplication ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'
                }`}
                onClick={() => !isPastApplication && onSelectDate(dateInfo.date)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {new Date(dateInfo.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      {dateInfo.exam_type && (
                        <Badge className={getExamTypeColor(dateInfo.exam_type)}>
                          {getExamTypeLabel(dateInfo.exam_type)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-1">{dateInfo.session}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-sm">
                        Exam Date: {new Date(dateInfo.date).toLocaleDateString()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-sm ${
                          isUrgent ? 'border-red-500 text-red-600' : ''
                        }`}
                      >
                        Last Date to Apply: {new Date(dateInfo.last_date_to_apply).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {daysRemaining}
                      </div>
                      <div className="text-sm text-gray-500">days until exam</div>
                    </div>
                    
                    <div>
                      <div className={`text-lg font-semibold ${
                        isUrgent ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {applicationDaysRemaining}
                      </div>
                      <div className="text-sm text-gray-500">
                        {isPastApplication ? 'days past deadline' : 'days to apply'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}