'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { examAPI } from '@/lib/api';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isLoading && user) {
        // Students go directly to their dashboard
        if (user.role === 'student') {
          router.push('/dashboard');
          return;
        }
        
        // Parents: Check onboarding status
        try {
          const statusResponse = await examAPI.getOnboardingStatus(user.id);
          const status = statusResponse.data;
          
          // If onboarding is complete, redirect to parent dashboard
          if (status.is_complete) {
            router.push('/parent-dashboard');
          }
        } catch (err) {
          // If status check fails, stay on landing page
          console.log('Could not check onboarding status');
        }
      }
    };

    checkOnboardingStatus();
  }, [user, isLoading, router]);

  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
    </main>
  );
}
