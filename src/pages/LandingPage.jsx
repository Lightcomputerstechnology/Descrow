import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  MessageSquare, 
  Package, 
  CheckCircle, 
  TrendingUp, 
  Lock,
  Globe,
  Zap,
  Users,
  Code,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(0);

  // Live escrow transactions ticker
  const liveTransactions = [
    { buyer: 'Emily', seller: 'Joseph', item: 'MacBook Pro 16"', progress: 80, amount: 2500 },
    { buyer: 'Michael', seller: 'TechStore', item: 'iPhone 15 Pro', progress: 65, amount: 1200 },
    { buyer: 'Sarah', seller: 'Fashion Hub', item: 'Designer Jacket', progress: 95, amount: 450 },
    { buyer: 'David', seller: 'AutoParts Ltd', item: 'Car Battery', progress: 50, amount: 180 },
    { buyer: 'Lisa', seller: 'Electronics', item: 'Gaming Console', progress: 75, amount: 599 }
  ];

  // Auto-scroll transactions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTransaction((prev) => (prev + 1) % liveTransactions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Your money is held safely until delivery is confirmed. No fraud, no scams.'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Communicate directly with buyers and sellers within the platform.'
    },
    {
      icon: Package,
      title: 'Delivery Tracking',
      description: 'Track your package with GPS, photos, and delivery proof.'
    },
    {
      icon: CheckCircle,
      title: 'Dispute Resolution',
      description: 'Our team resolves disputes fairly within 24-48 hours.'
    },
    {
      icon: Globe,
      title: 'Multi-Currency',
      description: 'Support for USD, EUR, GBP, NGN, and 10+ major currencies.'
    },
    {
      icon: Lock,
      title: '2FA Security',
      description: 'Bank-level encryption and two-factor authentication.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Escrow',
      description: 'Buyer creates an escrow transaction and deposits funds',
      icon: '💰'
    },
    {
      step: 2,
      title: 'Seller Ships',
      description: 'Seller ships the item with delivery proof and tracking',
      icon: '📦'
    },
    {
      step: 3,
      title: 'Buyer Confirms',
      description: 'Buyer receives item and confirms satisfaction',
      icon: '✅'
    },
    {
      step: 4,
      title: 'Payment Released',
      description: 'Funds are automatically released to the seller',
      icon: '🎉'
    }
  ];

  const pricing = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      features: [
        '$500 max per transaction',
        '5 transactions per month',
        'Basic support',
        'Standard processing'
      ],
      highlight: false
    },
    {
      name: 'Basic',
      price: 10,
      period: 'month',
      features: [
        '$5,000 max per transaction',
        '50 transactions per month',
        'Priority support',
        'Fast processing'
      ],
      highlight: false
    },
    {
      name: 'Pro',
      price: 50,
      period: 'month',
      features: [
        '$50,000 max per transaction',
        'Unlimited transactions',
        '24/7 Priority support',
        'Instant processing',
        'API access'
      ],
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Unlimited transaction amount',
        'Unlimited transactions',
        'Dedicated account manager',
        'Custom integration',
        'White-label options'
      ],
      highlight: false
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'E-commerce Seller',
      image: '👩‍💼',
      quote: 'Dealcross has transformed how I do business online. My customers trust the escrow system and I get paid safely every time.'
    },
    {
      name: 'Michael Chen',
      role: 'Marketplace Owner',
      image: '👨‍💻',
      quote: 'Integrated Dealcross API in 2 hours. Transaction fraud dropped to zero. Best investment for our platform.'
    },
    {
      name: 'Amara Okafor',
      role: 'International Buyer',
      image: '👩',
      quote: 'Finally, a secure way to buy from overseas sellers. The delivery tracking and dispute resolution give me peace of mind.'
    }
  ];

  const faqs = [
    {
      question: 'How does escrow work?',
      answer: 'When a buyer creates an escrow, their payment is held securely by Dealcross. The seller ships the item, and once the buyer confirms receipt and satisfaction, we release the payment to the seller. Simple and secure.'
    },
    {
      question: 'What are the fees?',
      answer: 'Fees range from 2-5% depending on your tier. Free tier: 5%, Basic: 3%, Pro: 2%, Enterprise: 1.5%. No hidden charges.'
    },
    {
      question: 'Is my money safe?',
      answer: 'Yes! We use bank-level encryption, 2FA, and hold funds in segregated accounts. Your money is protected until delivery is confirmed.'
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We support all major payment methods: Cards (Visa, Mastercard), Bank Transfers, Mobile Money, and Cryptocurrencies (Bitcoin, Ethereum, USDT).'
    },
    {
      question: 'What if there\'s a dispute?',
      answer: 'Our dispute resolution team reviews all evidence and makes a fair decision within 24-48 hours. Both parties can submit proof.'
    },
    {
      question: 'Can I integrate Dealcross into my website?',
      answer: 'Yes! We provide a simple API for businesses to integrate escrow payments. Documentation and support included.'
    }
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Navbar */}
        <nav className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Dealcross</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
                <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">How It Works</a>
                <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Pricing</a>
                <a href="#api" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">API</a>
                <a href="#faq" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">FAQ</a>
              </div>

              {/* Right Side */}
              <div className="hidden md:flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Sign Up
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
                <a href="#how-it-works" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">How It Works</a>
                <a href="#pricing" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Pricing</a>
                <a href="#api" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">API</a>
                <a href="#faq" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">FAQ</a>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span className="dark:text-white">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Secure Escrow Payments for Global Trade
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Protect your online transactions with our trusted escrow service. Buy and sell with confidence, anywhere in the world.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-lg flex items-center justify-center gap-2"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition text-lg"
                  >
                    See How It Works
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">10,000+ Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bank-Level Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">150+ Countries</span>
                  </div>
                </div>
              </div>

              {/* Hero Image/Illustration */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl transform rotate-3 opacity-20"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Secured</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">$2,500</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">In Transit</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">$1,200</p>
                        </div>
                        <Package className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Payment Released</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">$450</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Transactions Ticker */}
        <section className="bg-gray-900 dark:bg-gray-950 py-4 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 text-white">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Live:</span>
                <div className="animate-pulse">
                  <span className="text-sm">
                    <strong>{liveTransactions[currentTransaction].buyer}</strong> buying{' '}
                    <strong>{liveTransactions[currentTransaction].item}</strong> from{' '}
                    <strong>{liveTransactions[currentTransaction].seller}</strong>
                    {' '}- {liveTransactions[currentTransaction].progress}% Complete
                    {' '}- ${liveTransactions[currentTransaction].amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
