import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const SkillExchange: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <header className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Learn. Collaborate. Exchange Skills.
          </h1>
          <p className="text-gray-600 max-w-2xl mb-8">
            A collaborative platform to connect with peers, exchange expertise,
            build projects and grow together through real-time communication and
            structured tasks.
          </p>
          <div className="flex gap-4">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Login
            </Link>
          </div>
        </div>
      </header>
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid gap-8 md:grid-cols-3">
          <div className="p-6 border rounded-lg bg-white">
            <h3 className="font-semibold mb-2 text-gray-900">
              Post & Find Tasks
            </h3>
            <p className="text-sm text-gray-600">
              Define tasks or discover opportunities aligned with your skills.
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-white">
            <h3 className="font-semibold mb-2 text-gray-900">Real-time Chat</h3>
            <p className="text-sm text-gray-600">
              Communicate instantly with collaborators and teammates.
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-white">
            <h3 className="font-semibold mb-2 text-gray-900">
              Grow Reputation
            </h3>
            <p className="text-sm text-gray-600">
              Earn trust through successful task completion and reviews.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SkillExchange;
