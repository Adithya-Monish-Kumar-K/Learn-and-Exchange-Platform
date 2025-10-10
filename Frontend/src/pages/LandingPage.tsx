import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, Briefcase, ArrowRight, Menu, X } from 'lucide-react';


const SkillExchange: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-2xl text-gray-900">
              SkillExchange
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Home</a>
              <a href="/about" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">About</a>
              <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Features</a>
              <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Contact</a>
            </nav>
            
            <div className="hidden md:flex gap-3">
              <Link to="/login">
                <button className="text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors font-medium">
                  Log In
                </button>
              </Link>
              <Link to="/signup">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Join Now
                </button>
              </Link>
            </div>
            
            <button 
              className="md:hidden text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <a href="#" className="text-gray-700">Home</a>
                <a href="#" className="text-gray-700">About</a>
                <a href="#" className="text-gray-700">Features</a>
                <a href="#" className="text-gray-700">Contact</a>
                <Link to="/login">
                <button className="text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors font-medium">
                  Log In
                </button>
              </Link>
                <Link to="/signup">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg w-fit">
                    Join Now
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="py-16 lg:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('assets/skills.png')"}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Exchange Skills.
                <br />
                Build Opportunities.
                <br />
                <br />
              </h1>
              <p className="text-xl text-white leading-relaxed max-w-lg">
                A modern way to learn, share, <br />and collaborate through real skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/signup">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium">
                    Join Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </Link>
                <Link to="/about">
                  <button className="border-2 border-gray-300 text-white px-8 py-3 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors font-medium">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="lg:pl-12">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-lg border border-blue-100">
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">20k+</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-md">
                  <p className="text-sm mb-2 opacity-90">Connect & Collaborate</p>
                  <p className="text-lg font-semibold mb-4">Start exchanging skills today</p>
                  <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium w-full">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-600 font-semibold mb-3 uppercase tracking-wide">Features</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover, share, and grow your skills with our comprehensive platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Post Tasks</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your projects and find skilled collaborators to bring your ideas to life.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Showcase Skills</h3>
              <p className="text-gray-600 leading-relaxed">
                Display your expertise and connect with others who need your unique abilities.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Credits</h3>
              <p className="text-gray-600 leading-relaxed">
                Build reputation and earn rewards as you help others achieve their goals.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="h-7 w-7 text-sky-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recruit Talent</h3>
              <p className="text-gray-600 leading-relaxed">
                Find the perfect team members and build lasting professional relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-600 font-semibold mb-3 uppercase tracking-wide">Why Choose Us</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Join thousands of professionals
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 text-center border border-blue-100">
              <div className="text-6xl font-bold text-blue-600 mb-2">20k+</div>
              <p className="text-gray-700 font-medium text-lg">Active specialists already on the platform</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 text-center border border-blue-100">
              <div className="text-6xl font-bold text-blue-600 mb-2">100k+</div>
              <p className="text-gray-700 font-medium text-lg">Skills exchanged successfully</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 text-center border border-blue-100">
              <div className="text-6xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-700 font-medium text-lg">Different skill categories available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to transform your career?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals already growing through skill exchange
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-10 py-4 rounded-lg hover:bg-blue-50 transition-colors font-bold text-lg shadow-lg">
              Start Today for Free
            </button>
            <button className="border-2 border-white text-white px-10 py-4 rounded-lg hover:bg-white/10 transition-colors font-bold text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="font-bold text-2xl text-gray-900 mb-4">
                SkillExchange
              </div>
              <p className="text-gray-600 mb-4">© SkillExchange 2025</p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <div className="space-y-3">
                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">About Us</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Careers</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <div className="space-y-3">
                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Support</h4>
              <div className="space-y-3">
                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SkillExchange;