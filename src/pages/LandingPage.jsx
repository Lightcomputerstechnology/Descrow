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
  ArrowRight,
  ChevronDown
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default dark mode
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // Live escrow transactions ticker - Expanded list
  const liveTransactions = [
    { buyer: 'Emily', seller: 'Joseph', item: 'MacBook Pro 16"', progress: 80, amount: 2500 },
    { buyer: 'Michael', seller: 'TechStore', item: 'iPhone 15 Pro', progress: 65, amount: 1200 },
    { buyer: 'Sarah', seller: 'Fashion Hub', item: 'Designer Jacket', progress: 95, amount: 450 },
    { buyer: 'David', seller: 'AutoParts Ltd', item: 'Car Battery', progress: 50, amount: 180 },
    { buyer: 'Lisa', seller: 'Electronics', item: 'Gaming Console', progress: 75, amount: 599 },
    { buyer: 'James', seller: 'Smart Devices', item: 'Smartwatch', progress: 90, amount: 350 },
    { buyer: 'Maria', seller: 'Home Decor', item: 'Luxury Lamp', progress: 45, amount: 220 },
    { buyer: 'Ahmed', seller: 'Tech Shop', item: 'Wireless Headphones', progress: 85, amount: 280 },
    { buyer: 'Sophie', seller: 'Beauty Store', item: 'Skincare Set', progress: 60, amount: 150 },
    { buyer: 'Ryan', seller: 'Sports Gear', item: 'Running Shoes', progress: 70, amount: 130 }
  ];

  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);

  // Auto-scroll transactions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTransactionIndex((prev) => (prev + 1) % liveTransactions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

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
      answer: 'Fees are deducted immediately when the escrow is funded and range from 2-5% depending on your tier. Free tier: 5%, Basic: 3%, Pro: 2%, Enterprise: 1.5%. No hidden charges.'
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
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        {/* Navbar */}
        <nav className="sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <Shield className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Dealcross</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition">Home</a>
                <a href="#deals" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition">Deals</a>
                <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition">Contact</a>
                <a href="#docs" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition">Docs</a>
                <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition">Upgrade</a>
              </div>

              {/* Right Side */}
              <div className="hidden md:flex items-center gap-3">
                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <span className="text-xl">{languages.find(l => l.name === selectedLanguage)?.flag}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedLanguage}</span>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>

                  {languageMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLanguage(lang.name);
                            setLanguageMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <span className="text-xl">{lang.flag}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition"
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
        </nav>

        {/* Mobile Sidebar Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">Dealcross</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <a href="#" className="block text-lg text-blue-500 font-medium">Home</a>
                  <a href="#deals" className="block text-lg text-gray-700 dark:text-gray-300">Deals</a>
                  <a href="#share-trading" className="block text-lg text-gray-700 dark:text-gray-300">Share Trading</a>
                  <a href="#contact" className="block text-lg text-gray-700 dark:text-gray-300">Contact</a>
                  <a href="#docs" className="block text-lg text-gray-700 dark:text-gray-300">Docs</a>
                  <a href="#pricing" className="block text-lg text-blue-500 font-medium">Upgrade</a>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full px-6 py-3 border-2 border-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Sign Up
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                    >
                      {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
                    </button>
                  </div>

                  {/* Language Selector Mobile */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Language</p>
                    <div className="space-y-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setSelectedLanguage(lang.name)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                            selectedLanguage === lang.name
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                              : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent'
                          }`}
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section - STATIC (no animations) */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 dark:from-gray-900 dark:via-blue-950 dark:to-black py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Secure Escrow Payments<br />for Global Trade
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Protect your online transactions with our trusted escrow service. Buy and sell with confidence, anywhere in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-lg flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition text-lg"
                >
                  See How It Works
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-blue-100">10,000+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-blue-100">Bank-Level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-blue-100">150+ Countries</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Transactions Ticker - UNLIMITED SCROLL */}
        <section id="deals" className="bg-gray-900 dark:bg-black py-4 overflow-hidden">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 text-white animate-pulse">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">Live Deals:</span>
              <div>
                <span className="text-sm">
                  <strong>{liveTransactions[currentTransactionIndex].buyer}</strong> buying{' '}
                  <strong>{liveTransactions[currentTransactionIndex].item}</strong> from{' '}
                  <strong>{liveTransactions[currentTransactionIndex].seller}</strong>
                  {' '}- {liveTransactions[currentTransactionIndex].progress}% Complete
                  {' '}- ${liveTransactions[currentTransactionIndex].amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Dealcross?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Everything you need for secure online transactions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl hover:shadow-lg transition border border-gray-200 dark:border-gray-800"
                  >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
