'use client';

import { motion } from 'framer-motion';
import { Target, Zap, BarChart3, Users, Calendar, Award } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Personalized Learning Paths',
    description: 'AI analyzes your strengths and weaknesses to create a customized study plan tailored to your needs.',
  },
  {
    icon: Zap,
    title: 'Smart Practice Tests',
    description: 'Adaptive tests that adjust difficulty based on your performance, ensuring optimal learning.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Track your progress with comprehensive insights and performance metrics across all subjects.',
  },
  {
    icon: Users,
    title: 'Parent Dashboard',
    description: 'Parents can monitor their children\'s progress and receive regular updates on performance.',
  },
  {
    icon: Calendar,
    title: 'Study Scheduling',
    description: 'Smart scheduling system that helps you manage your time effectively and stay on track.',
  },
  {
    icon: Award,
    title: 'Gamification',
    description: 'Earn badges, compete on leaderboards, and stay motivated with our engaging reward system.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to accelerate your learning and help you achieve your goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <feature.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
