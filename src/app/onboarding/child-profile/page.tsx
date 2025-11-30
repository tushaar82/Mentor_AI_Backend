'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, ArrowRight, User, GraduationCap, TrendingUp, Lock, Key } from 'lucide-react';
import Link from 'next/link';

const childProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  age: z.number().min(14, 'Age must be between 14 and 19').max(19, 'Age must be between 14 and 19'),
  grade: z.number().min(9, 'Grade must be between 9 and 12').max(12, 'Grade must be between 9 and 12'),
  current_level: z.enum(['beginner', 'intermediate', 'advanced']).refine((val) => val !== undefined, {
    message: 'Please select current level',
  }),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters').regex(/^[a-zA-Z0-9_@.]+$/, 'Username can contain letters, numbers, underscores, @, and .'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(50, 'Password must be less than 50 characters').regex(/^(?=.*[a-zA-Z])(?=.*[0-9]).+$/, 'Password must contain at least one letter and one number'),
});

type ChildProfileFormData = z.infer<typeof childProfileSchema>;

const gradeOptions = [
  { value: 9, label: 'Grade 9' },
  { value: 10, label: 'Grade 10' },
  { value: 11, label: 'Grade 11' },
  { value: 12, label: 'Grade 12' },
];

const levelOptions = [
  { 
    value: 'beginner', 
    label: 'Beginner', 
    description: 'Just starting with JEE/NEET preparation' 
  },
  { 
    value: 'intermediate', 
    label: 'Intermediate', 
    description: 'Have some foundation, need structured guidance' 
  },
  { 
    value: 'advanced', 
    label: 'Advanced', 
    description: 'Strong foundation, looking for advanced practice' 
  },
];

export default function ChildProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [childProfileSaved, setChildProfileSaved] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<ChildProfileFormData>({
    resolver: zodResolver(childProfileSchema),
  });

  const watchedValues = watch();

  // Debug: Log form state to console
  useEffect(() => {
    console.log('Form isValid:', isValid);
    console.log('Child profile saved:', childProfileSaved);
    console.log('Watched values:', watchedValues);
    
    // Debug: Check if all required fields have values when form is visible
    if (!childProfileSaved) {
      console.log('Form visibility check - Required fields:');
      console.log('Name:', watchedValues.name);
      console.log('Age:', watchedValues.age);
      console.log('Grade:', watchedValues.grade);
      console.log('Username:', watchedValues.username);
      console.log('Password:', watchedValues.password);
      console.log('Current Level:', watchedValues.current_level);
    }
  }, [isValid, childProfileSaved, watchedValues]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Check if child profile already exists for this user
    const checkChildProfile = async () => {
      try {
        const response = await onboardingAPI.getChildProfile(user.id);
        if (response.data) {
          setChildProfileSaved(true);
        } else {
          // Child profile doesn't exist, user needs to create one
          setChildProfileSaved(false);
        }
      } catch (err) {
        // Child profile doesn't exist, user needs to create one
        setChildProfileSaved(false);
      }
    };
    
    checkChildProfile();
  }, [user, router]);

  const onSubmit = async (data: ChildProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    
    try {
      await onboardingAPI.createChildProfile(user.id, data);
      setChildProfileSaved(true);
      
      // Check if preferences are also saved, then redirect accordingly
      try {
        await onboardingAPI.getPreferences(user.id);
        // Both preferences and child profile are saved, redirect to exam selection
        router.push('/onboarding/exam-selection');
      } catch (err) {
        // Only child profile is saved, redirect to exam selection
        router.push('/onboarding/exam-selection');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create child profile. Please try again.');
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

  // If child profile is already saved, show a message instead of the form
  if (childProfileSaved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Child Profile Already Created
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-600 mb-6"
              >
                Your child's profile has been successfully created. Let's continue to the next step.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center"
              >
                <Button
                  onClick={() => {
                    // Check if preferences also exist, then redirect accordingly
                    const checkAndRedirect = async () => {
                      try {
                        await onboardingAPI.getPreferences(user.id);
                        // Both exist, redirect to exam selection
                        router.push('/onboarding/exam-selection');
                      } catch (err) {
                        // Only child profile exists, redirect to exam selection
                        router.push('/onboarding/exam-selection');
                      }
                    };
                    
                    checkAndRedirect();
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                >
                  Continue to Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
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
            href="/onboarding/preferences"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Preferences
          </Link>
          
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Create Child Profile
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-600"
            >
              Tell us about your child to personalize their learning journey
            </motion.p>
          </div>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center mt-6 space-x-2"
          >
            <div className="h-2 w-8 bg-blue-600 rounded-full"></div>
            <div className="h-2 w-8 bg-blue-600 rounded-full"></div>
            <div className="h-2 w-8 bg-green-600 rounded-full animate-pulse"></div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center text-sm text-gray-500 mt-2"
          >
            Step 2 of 2: Child Profile
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  initial={{ rotate: -180 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <User className="w-5 h-5 text-indigo-600" />
                </motion.div>
                Child Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Please provide accurate information to help us create the best learning experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter child's full name"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                      {...register('name', { required: true })}
                    />
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500"
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="age" className="text-base font-medium flex items-center gap-2">
                      <div className="w-4 h-4 text-indigo-500">🎂</div>
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age (14-19)"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                      {...register('age', {
                        required: true,
                        valueAsNumber: true,
                        min: 14,
                        max: 19
                      })}
                    />
                    {errors.age && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500"
                      >
                        {errors.age.message}
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* Login Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-base font-medium flex items-center gap-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Key className="w-4 h-4 text-indigo-500" />
                      </motion.div>
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username (letters, numbers, _, @, .)"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                      {...register('username', { required: true })}
                    />
                    {errors.username && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500"
                      >
                        {errors.username.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-base font-medium flex items-center gap-2">
                      <motion.div
                        initial={{ rotate: -180 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                      >
                        <Lock className="w-4 h-4 text-indigo-500" />
                      </motion.div>
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password (min 8 chars, 1 letter, 1 number)"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                      {...register('password', { required: true })}
                    />
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* Academic Information */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <motion.div
                        initial={{ rotate: -180 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <GraduationCap className="w-4 h-4 text-purple-500" />
                      </motion.div>
                      Current Grade
                    </Label>
                    <Controller
                      name="grade"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                            <SelectValue placeholder="Select current grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.grade && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500"
                      >
                        {errors.grade.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </motion.div>
                      Current Level
                    </Label>
                    <Controller
                      name="current_level"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                            <SelectValue placeholder="Select current level" />
                          </SelectTrigger>
                          <SelectContent>
                            {levelOptions.map((option) => (
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
                    {errors.current_level && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500"
                      >
                        {errors.current_level.message}
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* Information Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 shadow-sm"
                >
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="font-medium text-indigo-900 mb-2 flex items-center gap-2"
                  >
                    <div className="w-5 h-5 text-indigo-500">💡</div>
                    Why this information matters
                  </motion.h3>
                  <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-indigo-700 space-y-2"
                  >
                    <motion.li
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-indigo-500">🎯</span>
                      <span>Age and grade help us provide age-appropriate content</span>
                    </motion.li>
                    <motion.li
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-indigo-500">🛤️</span>
                      <span>Current level allows us to create personalized learning paths</span>
                    </motion.li>
                    <motion.li
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-indigo-500">🎓</span>
                      <span>This information ensures your child gets the right challenge level</span>
                    </motion.li>
                    <motion.li
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      transition={{ delay: 1.0 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-indigo-500">🔐</span>
                      <span>Username and password will be used for your child's personal login</span>
                    </motion.li>
                  </motion.ul>
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
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                  disabled={isLoading || (!isValid && !childProfileSaved)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : childProfileSaved ? (
                    <>
                      Go to Exam Selection
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Complete Setup
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