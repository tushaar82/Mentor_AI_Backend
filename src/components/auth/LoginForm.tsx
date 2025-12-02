'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().min(3, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Detect if this is a student login (username) or parent login (email)
      const isEmail = data.email.includes('@');
      const isStudentLogin = !isEmail;
      
      console.log('Login attempt:', { email: data.email, isEmail, isStudentLogin });
      
      const userData = await login(data.email, data.password, isStudentLogin);
      
      console.log('Login successful, user role:', userData.role);
      
      // Students go directly to their dashboard
      if (userData.role === 'student' || userData.is_student) {
        console.log('Redirecting to student dashboard');
        router.push('/dashboard');
        return;
      }
      
      // Parents: Check onboarding status
      console.log('Parent login, checking onboarding status');
      try {
        const { examAPI } = await import('@/lib/api');
        const statusResponse = await examAPI.getOnboardingStatus(userData.id);
        const status = statusResponse.data;
        
        console.log('Onboarding status:', status);
        
        // If onboarding is complete, redirect to parent dashboard
        if (status.is_complete) {
          router.push('/parent-dashboard');
        } else {
          // Otherwise, redirect to the appropriate onboarding step
          if (!status.preferences_completed) {
            router.push('/onboarding/preferences');
          } else if (!status.child_profile_completed) {
            router.push('/onboarding/child-profile');
          } else if (!status.exam_selection_completed) {
            router.push('/onboarding/exam-selection');
          } else {
            router.push('/onboarding/preferences');
          }
        }
      } catch (statusErr) {
        console.error('Failed to check onboarding status:', statusErr);
        // If status check fails, default to parent dashboard
        router.push('/parent-dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email or Username</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="text"
            placeholder="you@example.com or username"
            className="pl-10"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 text-sm text-red-500 bg-red-50 rounded-md"
        >
          {error}
        </motion.div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="text-xs text-center text-gray-500 mt-4 p-3 bg-blue-50 rounded-md">
        <p className="font-medium text-gray-700 mb-1">Login Instructions:</p>
        <p><strong>Parents:</strong> Use your email address</p>
        <p><strong>Students:</strong> Use your username (provided by parent)</p>
      </div>
    </motion.form>
  );
}
