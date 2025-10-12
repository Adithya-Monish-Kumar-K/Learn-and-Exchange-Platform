import React from 'react';
import { Menu, X, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    // Show success message (in a real app, you'd handle this properly)
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-2xl text-gray-900">
              SkillExchange
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Home</a>
              <a href="/about" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">About</a>
              <a href="/features" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Features</a>
              <a href="/contact" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Contact</a>
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

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
              Get in <span className="text-blue-600">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about SkillExchange? Want to suggest a feature or report an issue? 
              We'd love to hear from you. Our team is here to help you make the most of your skill-sharing journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 h-full">
                <h2 className="text-2xl font-light text-gray-900 mb-8">
                  Contact Information
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">hello@skillexchange.com</p>
                      <p className="text-gray-600">support@skillexchange.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500">Mon-Fri, 9am-6pm EST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Office</h3>
                      <p className="text-gray-600">123 Innovation Drive</p>
                      <p className="text-gray-600">San Francisco, CA 94105</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Response Time</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We typically respond to all inquiries within 24 hours during business days. 
                    For urgent matters, please call our support line.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-light text-gray-900 mb-8">
                  Send us a Message
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                  >
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
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

export default ContactPage;