import React from 'react';
import { Target, Users, Award, Briefcase, Shield, MessageSquare } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-semibold text-xl text-gray-900">SkillExchange</div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
              <a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <a href="/features" className="text-gray-900 font-medium transition-colors">Features</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-light text-gray-900">Platform Features</h1>
            <p className="text-lg text-gray-600 mt-3">Everything you need to learn, share, and build together</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Posting</h3>
              <p className="text-gray-600">Create tasks with clear requirements, deadlines, and rewards to attract the right talent.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Talent Discovery</h3>
              <p className="text-gray-600">Browse profiles, skills, and portfolios to find collaborators and mentors.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reputation & Credits</h3>
              <p className="text-gray-600">Earn credits and reviews as you contribute, building trust and visibility.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Opportunities</h3>
              <p className="text-gray-600">Turn successful collaborations into internships, freelance gigs, or long-term roles.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Messaging</h3>
              <p className="text-gray-600">Coordinate scope, share files, and stay aligned with built-in chat.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Accounts</h3>
              <p className="text-gray-600">Email verification and security measures keep the community trusted.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <a href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">Back to Home</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Features;
