'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingAPI, examAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, ArrowRight, Globe, Bell, UserCheck } from 'lucide-react';
import Link from 'next/link';

const preferencesSchema = z.object({
  language: z.enum(['en', 'hi', 'mr']).refine((val) => val !== undefined, {
    message: 'Please select a language',
  }),
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  push_notifications: z.boolean(),
  teaching_involvement: z.enum(['high', 'medium', 'low']).refine((val) => val !== undefined, {
    message: 'Please select your teaching involvement level',
  }),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी (Hindi)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
];

const involvementOptions = [
  { 
    value: 'high', 
    label: 'High', 
    description: 'I want to be deeply involved in my child\'s learning journey' 
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    description: 'I want to stay informed and provide guidance when needed' 
  },
  { 
    value: 'low', 
    label: 'Low', 
    description: 'I prefer minimal involvement, just important updates' 
  },
];

export default function ParentPreferencesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      email_notifications: true,
      sms_notifications: true,
      push_notifications: true,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Check if preferences already exist for this user
    const checkPreferences = async () => {
      try {
        await onboardingAPI.getPreferences(user.id);
        setPreferencesSaved(true);
        // If preferences already exist, check if child profile exists and redirect accordingly
        const checkChildProfile = async () => {
          try {
            await onboardingAPI.getChildProfile(user.id);
            // If child profile exists, check if exam selection exists
            try {
              await onboardingAPI.getExamSelection(response.data.child_id);
              // Both exist, redirect to dashboard
              router.push('/dashboard');
            } catch (err) {
              // Only child profile exists, redirect to exam selection
              router.push('/onboarding/exam-selection');
            }
          } catch (err) {
            // Child profile doesn't exist, redirect to child profile creation
            router.push('/onboarding/child-profile');
          }
        };
        
        checkChildProfile();
      } catch (err) {
        // Preferences don't exist, user needs to fill them
        setPreferencesSaved(false);
      }
    };
    
    checkPreferences();
  }, [user, router]);

  const onSubmit = async (data: PreferencesFormData) => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    
    try {
      await onboardingAPI.createPreferences(user.id, data);
      setPreferencesSaved(true);
      router.push('/onboarding/child-profile');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/auth"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Welcome to Mentor AI!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-gray-600"
            >
              Let's set up your preferences to personalize your experience
            </motion.p>
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center mt-6 space-x-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-2 w-8 bg-blue-600 rounded-full shadow-lg"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="h-2 w-8 bg-blue-600 rounded-full shadow-lg"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="h-2 w-8 bg-gray-300 rounded-full shadow-lg"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center text-sm text-gray-500 mt-2"
          >
            Step 1 of 2: Preferences
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    initial={{ rotate: -180 }}
                    animate={{ rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Globe className="w-5 h-5 text-blue-600" />
                  </motion.div>
                  Parent Preferences
                </CardTitle>
              </motion.div>
              <CardDescription className="text-gray-600">
                Help us customize your experience by setting your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Language Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-3"
                >
                  <Label className="text-base font-medium flex items-center gap-2">
                    <div className="w-5 h-5 text-blue-500">🌍</div>
                    Preferred Language
                  </Label>
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select your preferred language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.language && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.language.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Notification Preferences */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-4"
                >
                  <Label className="text-base font-medium flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Bell className="w-4 h-4 text-blue-500" />
                    </motion.div>
                    Notification Preferences
                  </Label>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="email_notifications"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="email_notifications"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="email_notifications" className="text-sm font-normal">
                        Email notifications for progress updates and important alerts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="sms_notifications"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="sms_notifications"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="sms_notifications" className="text-sm font-normal">
                        SMS notifications for urgent updates
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="push_notifications"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="push_notifications"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="push_notifications" className="text-sm font-normal">
                        Push notifications in the mobile app
                      </Label>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Teaching Involvement */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-3"
                >
                  <Label className="text-base font-medium flex items-center gap-2">
                    <motion.div
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <UserCheck className="w-4 h-4 text-purple-500" />
                    </motion.div>
                    Teaching Involvement Level
                  </Label>
                  <Controller
                    name="teaching_involvement"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select your involvement level" />
                        </SelectTrigger>
                        <SelectContent>
                          {involvementOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-gray-500">{option.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.teaching_involvement && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.teaching_involvement.message}
                    </motion.p>
                  )}
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 text-sm text-red-500 bg-red-50 rounded-md"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Preferences...
                    </>
                  ) : preferencesSaved ? (
                    <>
                      Go to Child Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Continue to Child Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}