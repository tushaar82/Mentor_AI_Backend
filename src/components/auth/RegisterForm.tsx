'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email_address: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  repeat_password: z.string().min(6, 'Password confirmation must be at least 6 characters'),
}).refine((data) => data.password === data.repeat_password, {
  message: "Passwords don't match",
  path: ["repeat_password"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register: registerUser, login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await registerUser(data);
      setSuccessMessage('Registration successful! You can now login with your credentials.');
      // Auto-login after successful registration
      try {
        const userData = await login(data.email_address, data.password);
        
        // Registration is only for parents, so always go to onboarding
        // Check onboarding status
        try {
          const { examAPI } = await import('@/lib/api');
          const statusResponse = await examAPI.getOnboardingStatus(userData.id);
          const status = statusResponse.data;
          
          // If onboarding is complete, redirect to parent dashboard
          if (status.is_complete) {
            router.push('/parent-dashboard');
          } else {
            // For new registrations, always start with preferences
            router.push('/onboarding/preferences');
          }
        } catch (statusErr) {
          // If status check fails, default to preferences page
          router.push('/onboarding/preferences');
        }
      } catch (loginErr: any) {
        // If auto-login fails, show success message and let user login manually
        setSuccessMessage('Registration successful! Please login with your credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="pl-10"
            {...register('name')}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobile_number">Mobile Number</Label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="mobile_number"
            type="tel"
            placeholder="+91XXXXXXXXXX"
            className="pl-10"
            {...register('mobile_number')}
          />
        </div>
        {errors.mobile_number && (
          <p className="text-sm text-red-500">{errors.mobile_number.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_address">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email_address"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            {...register('email_address')}
          />
        </div>
        {errors.email_address && (
          <p className="text-sm text-red-500">{errors.email_address.message}</p>
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

      <div className="space-y-2">
        <Label htmlFor="repeat_password">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="repeat_password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            {...register('repeat_password')}
          />
        </div>
        {errors.repeat_password && (
          <p className="text-sm text-red-500">{errors.repeat_password.message}</p>
        )}
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
        <strong>Note:</strong> This platform is for parents only. After registration, you can add your children to your account.
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

      {successMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 text-sm text-green-600 bg-green-50 rounded-md"
        >
          {successMessage}
        </motion.div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </motion.form>
  );
}
