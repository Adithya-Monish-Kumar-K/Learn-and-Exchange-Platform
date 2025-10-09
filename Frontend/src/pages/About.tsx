import React from 'react';
import { Users, Target, Award, Briefcase, ArrowLeft, Menu, X } from 'lucide-react';

const About: React.FC = () => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);

	return (
		<div className="min-h-screen bg-white">
			{/* Navbar copied from LandingPage */}
			<header className="border-b border-gray-100">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="font-semibold text-xl text-gray-900">
							SkillExchange
						</div>

						<nav className="hidden md:flex space-x-8">
							<a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
							<a href="/about" className="text-gray-900 font-medium transition-colors">About</a>
							<a href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
							<a href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
						</nav>

						<div className="hidden md:flex items-center gap-3">
							<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
								Get Started
							</button>
						</div>

						<button
							className="md:hidden"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							aria-label="Toggle menu"
						>
							{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
						</button>
					</div>

					{isMenuOpen && (
						<div className="md:hidden border-t border-gray-100 py-4">
							<div className="flex flex-col space-y-4">
								<a href="#" className="text-gray-600">Home</a>
								<a href="#" className="text-gray-900 font-medium">About</a>
								<a href="#features" className="text-gray-600">Features</a>
								<a href="#contact" className="text-gray-600">Contact</a>
								<a href="/" className="text-blue-600" onClick={() => setIsMenuOpen(false)}>Back to Home</a>
								<button className="bg-blue-600 text-white px-4 py-2 rounded-md w-fit">
									Get Started
								</button>
							</div>
						</div>
					)}
				</div>
			</header>

			{/* Page content */}
			<main className="py-16 lg:py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<section className="grid lg:grid-cols-2 gap-12 items-start mb-16">
						<div>
							<h1 className="text-4xl lg:text-5xl font-light text-gray-900 leading-tight mb-6">
								How SkillExchange Works
							</h1>
							<p className="text-lg text-gray-700 leading-relaxed mb-6">
								SkillExchange is a collaborative platform where people learn, share, and deliver real work through
								skill-based collaboration. Post tasks to get help, showcase your expertise to help others, and grow your
								reputation with verified reviews and earned credits.
							</p>
							<p className="text-lg text-gray-700 leading-relaxed">
								Whether you’re a student building your portfolio, a professional expanding your network, or a team
								recruiting talent, SkillExchange helps you match with the right people and turn ideas into outcomes.
							</p>
							<div className="mt-8">
								<a href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
									Back to Home
								</a>
							</div>
						</div>
						<div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-10">
							<div className="grid grid-cols-2 gap-6">
								<div className="bg-white p-6 rounded-xl border border-gray-100">
									<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
										<Target className="h-5 w-5 text-blue-600" />
									</div>
									<h3 className="text-gray-900 font-semibold mb-1">Post Tasks</h3>
									<p className="text-gray-600 text-sm">Describe what you need and set expectations.</p>
								</div>
								<div className="bg-white p-6 rounded-xl border border-gray-100">
									<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
										<Users className="h-5 w-5 text-green-600" />
									</div>
									<h3 className="text-gray-900 font-semibold mb-1">Find Collaborators</h3>
									<p className="text-gray-600 text-sm">Match with people who have the right skills.</p>
								</div>
								<div className="bg-white p-6 rounded-xl border border-gray-100">
									<div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
										<Award className="h-5 w-5 text-yellow-600" />
									</div>
									<h3 className="text-gray-900 font-semibold mb-1">Earn Reputation</h3>
									<p className="text-gray-600 text-sm">Complete tasks and collect reviews and credits.</p>
								</div>
								<div className="bg-white p-6 rounded-xl border border-gray-100">
									<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
										<Briefcase className="h-5 w-5 text-purple-600" />
									</div>
									<h3 className="text-gray-900 font-semibold mb-1">Grow Opportunities</h3>
									<p className="text-gray-600 text-sm">Turn collaboration into internships or paid work.</p>
								</div>
							</div>
						</div>
					</section>

					<section className="bg-white border border-gray-100 rounded-2xl p-8">
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Step-by-step</h2>
						<ol className="list-decimal list-inside text-gray-700 space-y-2">
							<li>Create your profile and highlight your skills.</li>
							<li>Post a task or browse tasks from others.</li>
							<li>Connect via chat, align on scope, and collaborate.</li>
							<li>Deliver work, exchange feedback, and earn credits.</li>
						</ol>
					</section>
				</div>
			</main>
		</div>
	);
};

export default About;
