import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
    </main>
  );
}
