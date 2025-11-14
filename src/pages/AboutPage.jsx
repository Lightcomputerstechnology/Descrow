// File: src/pages/AboutPage.jsx
import React, { useEffect } from 'react';
import { Shield, Users, Zap, Award, CheckCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Your transactions are protected with bank-level encryption and multi-layer security protocols.'
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'We prioritize user experience and satisfaction, providing 24/7 support for all your needs.'
    },
    {
      icon: Zap,
      title: 'Fast & Efficient',
      description: 'Quick transaction processing and instant notifications keep you informed every step of the way.'
    },
    {
      icon: Award,
      title: 'Trusted Platform',
      description: 'Thousands of successful transactions completed with zero fraud incidents since launch.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '100K+', label: 'Transactions' },
    { number: '$10M+', label: 'Secured' },
    { number: '99.9%', label: 'Uptime' }
  ];

  return (
    <>
      <SEOHead
        title="About Us - Dealcross | Secure Escrow Platform"
        description="Learn about Dealcross, the trusted escrow platform protecting online transactions worldwide. Our mission is to make online trading safe and secure for everyone."
        keywords="about dealcross, escrow platform, secure transactions, online safety, company information"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About Dealcross
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We're on a mission to make online transactions safe, secure, and trustworthy for everyone.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed text-center max-w-4xl mx-auto">
              At Dealcross, we believe that online transactions should be secure, transparent, and worry-free. 
              Our advanced escrow platform protects both buyers and sellers, ensuring that every deal is completed 
              fairly and safely. We leverage cutting-edge technology to provide real-time tracking, dispute resolution, 
              and payment protection, making us the trusted choice for thousands of users worldwide.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white dark:bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div 
                    key={index}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Why Choose Dealcross?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                'Bank-level encryption for all transactions',
                'Real-time tracking and notifications',
                '24/7 customer support',
                'Dispute resolution within 48 hours',
                'Multi-currency support',
                'No hidden fees or charges',
                'Mobile-friendly platform',
                'Instant payment processing'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Trading Securely?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Dealcross for their online transactions.
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Create Free Account
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
