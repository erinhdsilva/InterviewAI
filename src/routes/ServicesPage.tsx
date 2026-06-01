'use client';

import React from 'react';
import {
  Rocket,
  BarChart2,
  FileText,
  Calendar,
  Headphones,
  MessageCircle
} from 'lucide-react';

const services = [
  {
    icon: <Rocket className="w-12 h-12 text-indigo-600 mb-4" />, 
    title: 'Mock Interview Sessions',
    description: 'Real-time AI-driven mock interviews tailored to your role and experience level.',
    link: '/services/mock-interviews'
  },
  {
    icon: <BarChart2 className="w-12 h-12 text-indigo-600 mb-4" />, 
    title: 'Performance Analytics',
    description: 'Get detailed feedback and analytics on your mock interview performances.',
    link: '/services/analytics'
  },
  {
    icon: <FileText className="w-12 h-12 text-indigo-600 mb-4" />, 
    title: 'Resume Builder',
    description: 'Create and optimize your resume with AI-powered suggestions and templates.',
    link: '/services/resume-builder'
  },
  {
    icon: <Calendar className="w-12 h-12 text-indigo-600 mb-4" />, 
    title: 'Interview Scheduling',
    description: 'Seamlessly book practice sessions and real interviews with integrated calendar sync.',
    link: '/services/scheduling'
  },
  {
    icon: <Headphones className="w-12 h-12 text-indigo-600 mb-4" />, 
    title: '24/7 Support',
    description: 'Round-the-clock AI and human support to answer your queries anytime.',
    link: '/services/support'
  },
  {
    icon: <MessageCircle className="w-12 h-12 text-indigo-600 mb-4" />, 
    title: 'AI Coaching Insights',
    description: 'Receive personalized AI-driven feedback and coaching tips to improve your mock interview performance.',
    link: '/services/ai-coaching'
  }
];

const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Our Services
        </h1>
        <p className="text-lg text-gray-600">
          Explore the range of AI-powered tools and features that MockMate AI offers to help you succeed in your interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95"
          >
            <div className="flex justify-center">
              {service.icon}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 text-center">
              {service.title}
            </h3>
            <p className="text-gray-600 text-center">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
