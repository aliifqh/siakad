import React from 'react';

interface ExamplePageProps {
  title: string;
  description: string;
  features: string[];
}

export default function ExamplePage({ title, description, features }: ExamplePageProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Features
          </h2>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-blue-800 dark:text-blue-200">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-green-900 dark:text-green-100 mb-4">
            Tech Stack
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">
                Next.js
              </span>
              <span className="text-green-800 dark:text-green-200">React Framework</span>
            </div>
            <div className="flex items-center">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">
                TypeScript
              </span>
              <span className="text-green-800 dark:text-green-200">Type Safety</span>
            </div>
            <div className="flex items-center">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">
                Tailwind
              </span>
              <span className="text-green-800 dark:text-green-200">Styling</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
          Get Started
        </button>
      </div>
    </div>
  );
}
