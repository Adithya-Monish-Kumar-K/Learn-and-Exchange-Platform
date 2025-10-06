import React from 'react';
import { 
  Menu, 
  X, 
  Target, 
  Users, 
  Award, 
  Briefcase, 
  Search, 
  MessageCircle, 
  Shield, 
  Zap, 
  Star, 
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const FeaturesPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const mainFeatures = [
    {
      icon: Target,
      title: "Smart Task Matching",
      description: "Our AI-powered algorithm matches your skills with relevant projects, ensuring you find opportunities that truly fit your expertise and interests.",
      color: "blue",
      details: ["Intelligent skill assessment", "Personalized recommendations", "Real-time matching"]
    },
    {
      icon: Users,
      title: "Collaborative Workspace",
      description: "Work together seamlessly with integrated communication tools, file sharing, and project management features designed for remote collaboration.",
      color: "green",
      details: ["Real-time messaging", "File sharing", "Progress tracking"]
    },
    {
      icon: Award,
      title: "Credit & Reputation System",
      description: "Build your professional reputation through our transparent credit system. Earn recognition for quality work and unlock premium opportunities.",
      color: "yellow",
      details: ["Skill-based credits", "Peer reviews", "Achievement badges"]
    },
    {
      icon: Briefcase,
      title: "Talent Recruitment",
      description: "Access a curated network of skilled professionals. Find the perfect team members for your projects with detailed profiles and verified skills.",
      color: "purple",
      details: ["Verified profiles", "Skill assessments", "Portfolio showcase"]
    }
  ];

  const additionalFeatures = [
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find exactly what you need with powerful filters for skills, location, availability, and project type.",
      color: "indigo"
    },
    {
      icon: MessageCircle,
      title: "Integrated Messaging",
      description: "Communicate seamlessly with built-in chat, video calls, and project discussions.",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Protected transactions with escrow services and dispute resolution for peace of mind.",
      color: "green"
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description: "Stay updated with real-time alerts for new opportunities, messages, and project updates.",
      color: "orange"
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Comprehensive review system ensures high-quality deliverables and trusted partnerships.",
      color: "red"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track your progress, earnings, and skill development with detailed analytics and insights.",
      color: "teal"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; hover: string } } = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", hover: "hover:bg-blue-50" },
      green: { bg: "bg-green-100", text: "text-green-600", hover: "hover:bg-green-50" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600", hover: "hover:bg-yellow-50" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", hover: "hover:bg-purple-50" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600", hover: "hover:bg-indigo-50" },
      orange: { bg: "bg-orange-100", text: "text-orange-600", hover: "hover:bg-orange-50" },
      red: { bg: "bg-red-100", text: "text-red-600", hover: "hover:bg-red-50" },
      teal: { bg: "bg-teal-100", text: "text-teal-600", hover: "hover:bg-teal-50" }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-semibold text-xl text-gray-900">
              SkillExchange
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
              <a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <a href="/features" className="text-gray-900 font-medium">Features</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </nav>
            
            <div className="hidden md:block">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
            
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4">
              <div className="flex flex-col space-y-4">
                <a href="#" className="text-gray-600">Home</a>
                <a href="#" className="text-gray-600">About</a>
                <a href="#" className="text-gray-900 font-medium">Features</a>
                <a href="#" className="text-gray-600">Contact</a>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md w-fit">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
              Powerful <span className="text-blue-600">Features</span>
              <br />
              Built for Success
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the comprehensive suite of tools and features that make SkillExchange 
              the ultimate platform for skill sharing and professional growth.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to excel in your professional journey
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const colors = getColorClasses(feature.color);
              
              return (
                <div key={index} className={`bg-white p-8 rounded-xl shadow-sm ${colors.hover} transition-all duration-300 border border-gray-100`}>
                  <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={`h-8 w-8 ${colors.text}`} />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              Additional Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              More tools to enhance your experience and productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const colors = getColorClasses(feature.color);
              
              return (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              Platform Statistics
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of professionals already benefiting from our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-light text-gray-900 mb-2">50,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-light text-gray-900 mb-2">100,000+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-light text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Skill Categories</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-light text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">Platform Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-light text-white mb-6">
            Ready to explore all features?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your journey today and unlock the full potential of skill sharing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-md hover:bg-gray-100 transition-colors font-semibold text-lg flex items-center justify-center">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-md hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">© SkillExchange 2025</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Careers</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;