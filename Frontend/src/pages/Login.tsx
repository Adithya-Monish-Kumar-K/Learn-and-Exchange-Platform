import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { motion } from 'framer-motion';
import { BookOpen, Shield, Star } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      navigate('/user/dashboard', { replace: true });
    }
  }, [navigate]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await apiClient.login(form);
      const redirect = params.get('redirect') || '/user/dashboard';
      navigate(redirect, { replace: true });
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <h1 className="text-xl font-bold text-gray-900">Skill Exchange</h1>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden lg:flex w-full max-w-md items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 relative overflow-hidden"
          >
            {/* Floating Elements Animation */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-20 left-20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 15, 0],
                rotate: [0, -8, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute top-32 right-16"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
              className="absolute bottom-32 left-16"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl shadow-lg flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </motion.div>

            {/* Main Illustration */}
            <div className="relative z-10">
              <motion.svg
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                width="450"
                height="450"
                viewBox="0 0 450 450"
                className="drop-shadow-2xl"
              >
                {/* Background Circle */}
                <circle
                  cx="225"
                  cy="225"
                  r="180"
                  fill="url(#bgGradient)"
                  opacity="0.1"
                />

                {/* Stack of books - Enhanced */}
                <motion.g
                  animate={{ y: [0, -3, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <rect
                    x="140"
                    y="300"
                    width="170"
                    height="18"
                    rx="6"
                    fill="url(#book1)"
                  />
                  <rect
                    x="145"
                    y="280"
                    width="160"
                    height="18"
                    rx="6"
                    fill="url(#book2)"
                  />
                  <rect
                    x="150"
                    y="260"
                    width="150"
                    height="18"
                    rx="6"
                    fill="url(#book3)"
                  />
                  <rect
                    x="155"
                    y="240"
                    width="140"
                    height="18"
                    rx="6"
                    fill="url(#book4)"
                  />

                  {/* Book details */}
                  <rect
                    x="150"
                    y="302"
                    width="40"
                    height="3"
                    rx="1"
                    fill="rgba(255,255,255,0.6)"
                  />
                  <rect
                    x="155"
                    y="282"
                    width="35"
                    height="3"
                    rx="1"
                    fill="rgba(255,255,255,0.6)"
                  />
                  <rect
                    x="160"
                    y="262"
                    width="30"
                    height="3"
                    rx="1"
                    fill="rgba(255,255,255,0.6)"
                  />
                  <rect
                    x="165"
                    y="242"
                    width="25"
                    height="3"
                    rx="1"
                    fill="rgba(255,255,255,0.6)"
                  />
                </motion.g>

                {/* Open book on top - Enhanced */}
                <motion.g
                  animate={{
                    y: [0, -5, 0],
                    rotateX: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <path
                    d="M225 180 L170 210 L170 160 L225 130 L280 160 L280 210 Z"
                    fill="#FFFFFF"
                    stroke="url(#emeraldGradient)"
                    strokeWidth="3"
                  />
                  <line
                    x1="225"
                    y1="130"
                    x2="225"
                    y2="210"
                    stroke="url(#emeraldGradient)"
                    strokeWidth="2"
                  />

                  {/* Book pages with content */}
                  <line
                    x1="180"
                    y1="170"
                    x2="210"
                    y2="170"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="180"
                    y1="180"
                    x2="205"
                    y2="180"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="180"
                    y1="190"
                    x2="215"
                    y2="190"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="235"
                    y1="170"
                    x2="265"
                    y2="170"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="235"
                    y1="180"
                    x2="260"
                    y2="180"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="235"
                    y1="190"
                    x2="270"
                    y2="190"
                    stroke="#D1D5DB"
                    strokeWidth="1.5"
                  />
                </motion.g>

                {/* Character - Enhanced Student */}
                <motion.g
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <circle
                    cx="225"
                    cy="100"
                    r="30"
                    fill="#FEF3C7"
                    stroke="url(#emeraldGradient)"
                    strokeWidth="3"
                  />

                  {/* Hair - Modern style */}
                  <path
                    d="M200 80 Q225 60 250 80 Q240 65 225 65 Q210 65 200 80 Z"
                    fill="#10B981"
                  />
                  <path
                    d="M205 75 Q225 70 245 75 L240 70 Q225 65 210 70 Z"
                    fill="#059669"
                  />

                  {/* Eyes with sparkle */}
                  <circle cx="215" cy="95" r="3" fill="#1F2937" />
                  <circle cx="235" cy="95" r="3" fill="#1F2937" />
                  <circle cx="216" cy="93" r="1" fill="#FFFFFF" />
                  <circle cx="236" cy="93" r="1" fill="#FFFFFF" />

                  {/* Happy smile */}
                  <path
                    d="M210 110 Q225 120 240 110"
                    stroke="#1F2937"
                    strokeWidth="2"
                    fill="none"
                  />

                  {/* Body - Casual student look */}
                  <rect
                    x="205"
                    y="130"
                    width="40"
                    height="60"
                    rx="20"
                    fill="url(#emeraldGradient)"
                  />

                  {/* Backpack - Enhanced */}
                  <rect
                    x="180"
                    y="85"
                    width="20"
                    height="30"
                    rx="10"
                    fill="url(#tealGradient)"
                  />
                  <rect
                    x="250"
                    y="85"
                    width="20"
                    height="30"
                    rx="10"
                    fill="url(#tealGradient)"
                  />
                  <rect
                    x="195"
                    y="80"
                    width="60"
                    height="40"
                    rx="12"
                    fill="url(#darkTeal)"
                  />
                  <circle
                    cx="225"
                    cy="100"
                    r="8"
                    fill="rgba(255,255,255,0.3)"
                  />

                  {/* Arms in welcoming gesture */}
                  <ellipse
                    cx="185"
                    cy="155"
                    rx="15"
                    ry="25"
                    fill="#FEF3C7"
                    transform="rotate(-20 185 155)"
                  />
                  <ellipse
                    cx="265"
                    cy="155"
                    rx="15"
                    ry="25"
                    fill="#FEF3C7"
                    transform="rotate(20 265 155)"
                  />
                </motion.g>

                {/* Floating Knowledge Symbols - Enhanced */}
                <motion.g
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <circle
                    cx="120"
                    cy="120"
                    r="20"
                    fill="url(#blueGradient)"
                    opacity="0.9"
                  />
                  <text
                    x="120"
                    y="125"
                    textAnchor="middle"
                    className="text-sm font-bold"
                    fill="#FFFFFF"
                  >
                    A+
                  </text>
                </motion.g>

                <motion.g
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                >
                  <circle
                    cx="330"
                    cy="140"
                    r="18"
                    fill="url(#purpleGradient)"
                    opacity="0.9"
                  />
                  <text
                    x="330"
                    y="145"
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill="#FFFFFF"
                  >
                    ∑
                  </text>
                </motion.g>

                <motion.g
                  animate={{
                    x: [0, 10, 0],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                >
                  <circle
                    cx="100"
                    cy="280"
                    r="15"
                    fill="url(#orangeGradient)"
                    opacity="0.9"
                  />
                  <text
                    x="100"
                    y="285"
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill="#FFFFFF"
                  >
                    π
                  </text>
                </motion.g>

                <motion.g
                  animate={{
                    rotate: [0, 15, 0],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.5,
                  }}
                >
                  <circle
                    cx="350"
                    cy="300"
                    r="16"
                    fill="url(#pinkGradient)"
                    opacity="0.9"
                  />
                  <text
                    x="350"
                    y="305"
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill="#FFFFFF"
                  >
                    ♪
                  </text>
                </motion.g>

                {/* Success Path Visualization */}
                <motion.g
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    pathLength: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <path
                    d="M225 130 Q280 150 320 120 Q350 100 380 140"
                    stroke="url(#emeraldGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="8,4"
                    opacity="0.7"
                  />
                  <circle cx="380" cy="140" r="8" fill="url(#emeraldGradient)">
                    <animate
                      attributeName="r"
                      values="6;10;6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </motion.g>

                {/* Light bulb - Innovation symbol */}
                <motion.g
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <circle
                    cx="300"
                    cy="200"
                    r="12"
                    fill="url(#yellowGradient)"
                  />
                  <rect
                    x="296"
                    y="212"
                    width="8"
                    height="6"
                    rx="2"
                    fill="url(#orangeGradient)"
                  />
                  <path
                    d="M296 206 L300 202 L304 206"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </motion.g>

                {/* Reading Progress Indicators */}
                <motion.g
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <circle
                    cx="80"
                    cy="200"
                    r="25"
                    fill="none"
                    stroke="url(#emeraldGradient)"
                    strokeWidth="4"
                    strokeDasharray="20,5"
                    opacity="0.6"
                  />
                  <circle cx="80" cy="200" r="6" fill="url(#emeraldGradient)" />
                  <text
                    x="80"
                    y="205"
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill="#FFFFFF"
                  >
                    75%
                  </text>
                </motion.g>

                <motion.g
                  animate={{
                    rotate: [360, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <circle
                    cx="370"
                    cy="220"
                    r="20"
                    fill="none"
                    stroke="url(#tealGradient)"
                    strokeWidth="3"
                    strokeDasharray="15,3"
                    opacity="0.6"
                  />
                  <circle cx="370" cy="220" r="5" fill="url(#tealGradient)" />
                  <text
                    x="370"
                    y="225"
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill="#FFFFFF"
                  >
                    92%
                  </text>
                </motion.g>

                {/* Floating Stars - Achievement symbols */}
                <motion.g
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <path
                    d="M160 60 L162 66 L168 66 L163 70 L165 76 L160 72 L155 76 L157 70 L152 66 L158 66 Z"
                    fill="url(#goldGradient)"
                    opacity="0.9"
                  />
                </motion.g>

                <motion.g
                  animate={{
                    y: [0, 15, 0],
                    rotate: [0, -120, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                >
                  <path
                    d="M320 50 L321 54 L325 54 L322 57 L323 61 L320 59 L317 61 L318 57 L315 54 L319 54 Z"
                    fill="url(#silverGradient)"
                    opacity="0.8"
                  />
                </motion.g>

                <motion.g
                  animate={{
                    x: [0, -10, 0],
                    y: [0, -5, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                  }}
                >
                  <path
                    d="M90 350 L91 353 L94 353 L92 355 L93 358 L90 356 L87 358 L88 355 L86 353 L89 353 Z"
                    fill="url(#bronzeGradient)"
                    opacity="0.7"
                  />
                </motion.g>

                {/* Digital Particles */}
                <motion.g
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.5, 1.5, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    staggerChildren: 0.5,
                  }}
                >
                  <circle cx="140" cy="100" r="3" fill="#10B981" />
                  <circle cx="310" cy="90" r="2.5" fill="#06B6D4" />
                  <circle cx="60" cy="320" r="3.5" fill="#8B5CF6" />
                  <circle cx="380" cy="380" r="4" fill="#F59E0B" />
                  <circle cx="50" cy="150" r="2" fill="#EF4444" />
                  <circle cx="400" cy="250" r="3" fill="#EC4899" />
                </motion.g>

                {/* Gradient Definitions */}
                <defs>
                  <linearGradient
                    id="bgGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  <linearGradient
                    id="emeraldGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  <linearGradient
                    id="tealGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>

                  <linearGradient
                    id="darkTeal"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#0F766E" />
                    <stop offset="100%" stopColor="#134E4A" />
                  </linearGradient>

                  <linearGradient
                    id="book1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  <linearGradient
                    id="book2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#0891B2" />
                  </linearGradient>

                  <linearGradient
                    id="book3"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>

                  <linearGradient
                    id="book4"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>

                  <linearGradient
                    id="blueGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>

                  <linearGradient
                    id="purpleGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>

                  <linearGradient
                    id="orangeGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>

                  <linearGradient
                    id="pinkGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#DB2777" />
                  </linearGradient>

                  <linearGradient
                    id="yellowGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#FACC15" />
                  </linearGradient>

                  <linearGradient
                    id="goldGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FCD34D" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>

                  <linearGradient
                    id="silverGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#E5E7EB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                  </linearGradient>

                  <linearGradient
                    id="bronzeGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#92400E" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>

            {/* Enhanced Background Decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 right-20 w-32 h-32 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-gradient-to-br from-teal-300 to-green-400 rounded-full blur-3xl"></div>
            </div>

            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%" className="absolute inset-0">
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Floating Quote */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute bottom-4 right-16 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg max-w-xs"
            >
              <p className="text-sm text-gray-700 italic">
                "Alone we can do so little; together we can do so much."
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                - Helen Keller
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
            <p className="text-sm text-gray-600">
              Welcome back! Please enter your details
            </p>
          </div>

          {err && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{err}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
