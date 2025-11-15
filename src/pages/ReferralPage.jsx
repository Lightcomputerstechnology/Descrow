// FILE: src/pages/ReferralPage.jsx

import React, { useEffect, useState } from 'react';
import {
  Gift,
  Users,
  DollarSign,
  Copy,
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ReferralPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });

  // Generate Referral Code
  useEffect(() => {
    window.scrollTo(0, 0);
    const currentUser = authService.getCurrentUser();

    if (currentUser) {
      setUser(currentUser);

      const generatedCode = `${currentUser.name
        .substring(0, 4)
        .toUpperCase()}${currentUser._id?.substring(0, 4) || '1234'}`;

      setReferralCode(generatedCode);
    }
  }, []);

  const getReferralLink = () =>
    `https://dealcross.net/signup?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getReferralLink()).then(() => {
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleShare = (platform) => {
    const link = getReferralLink();
    const text = `Join me on Dealcross and get $10 credit! Use my referral code: ${referralCode}`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        link
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        link
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`,
      email: `mailto:?subject=${encodeURIComponent(
        'Join Dealcross'
      )}&body=${encodeURIComponent(text + '\n\n' + link)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Benefits
  const benefits = [
    {
      icon: DollarSign,
      title: '$20 Per Referral',
      description:
        'Earn $20 for each friend who signs up and completes their first transaction'
    },
    {
      icon: Gift,
      title: '$10 Friend Bonus',
      description:
        'Your friends get $10 credit on their first transaction when they use your code'
    },
    {
      icon: TrendingUp,
      title: 'Unlimited Earnings',
      description:
        'No limit on how many friends you can refer or how much you can earn'
    },
    {
      icon: Award,
      title: 'Instant Payouts',
      description:
        "Earnings are credited to your wallet immediately after your friend's first transaction"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Share Your Link',
      description:
        'Send your unique referral link to friends via social media or messaging apps'
    },
    {
      step: 2,
      title: 'Friend Signs Up',
      description:
        'Your friend creates an account using your referral link and receives $10 credit'
    },
    {
      step: 3,
      title: 'Complete Transaction',
      description:
        'When your friend completes their first escrow transaction, rewards are unlocked'
    },
    {
      step: 4,
      title: 'Get Rewarded',
      description:
        'Earn $20 instantly in your Dealcross wallet—withdraw anytime'
    }
  ];

  return (
    <>
      <SEOHead
        title="Dealcross Referral Program | Earn $20 Per Referral"
        description="Invite friends to Dealcross and earn $20 for every successful referral. Unlimited earnings, instant payouts, and your friends get $10 credit."
        keywords="dealcross referral program, earn money referring friends, affiliate dealcross, referral bonus, make money online"
        canonical="https://dealcross.net/referral"
        ogTitle="Earn $20 Per Referral on Dealcross"
        ogDescription="Join the Dealcross referral program. Earn $20 per referral and give your friends $10 credit."
      />

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'PromotionCard',
          name: 'Dealcross Referral Program',
          description:
            'Earn $20 for every friend you refer to Dealcross. Your friends get $10 credit.',
          url: 'https://dealcross.net/referral'
        })}
      </script>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">

        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none"></div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              <span>Limited Time: Double Rewards!</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Earn $20 for Every Friend
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Share Dealcross with others and earn instantly. They get $10, you get $20.
            </p>

            {/* Referral Card */}
            {user ? (
              <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">

                {/* Referral Code */}
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-left">
                  Your Referral Code
                </label>

                <div className="flex items-center gap-3 mb-6">
                  <input
                    type="text"
                    readOnly
                    value={referralCode}
                    aria-label="Your referral code"
                    className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-mono text-2xl font-bold text-center text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleCopyLink}
                    aria-label="Copy referral code"
                    className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                  >
                    {copied ? <CheckCircle className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  </button>
                </div>

                {/* Referral Link */}
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-left">
                  Your Referral Link
                </label>

                <div className="flex items-center gap-3 mb-6">
                  <input
                    type="text"
                    readOnly
                    value={getReferralLink()}
                    aria-label="Referral link field"
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition font-semibold"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Social Share */}
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-left">
                  Share Via
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'twitter', name: 'Twitter', icon: '𝕏', color: 'bg-black' },
                    { id: 'facebook', name: 'Facebook', icon: 'f', color: 'bg-blue-600' },
                    { id: 'linkedin', name: 'LinkedIn', icon: 'in', color: 'bg-blue-700' },
                    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-green-600' },
                    { id: 'email', name: 'Email', icon: '✉', color: 'bg-gray-600' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      aria-label={`Share on ${btn.name}`}
                      onClick={() => handleShare(btn.id)}
                      className={`${btn.color} hover:opacity-90 text-white px-4 py-3 rounded-lg transition font-semibold text-sm flex items-center justify-center gap-1`}
                    >
                      {btn.icon} {btn.name}
                    </button>
                  ))}
                </div>

              </div>
            ) : (
              <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Sign in to get your referral code and start earning instantly.
                </p>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-semibold"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-8 py-4 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl transition font-semibold"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* STATS */}
        {user && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: 'Total Referrals',
                  value: referralStats.totalReferrals,
                  icon: Users,
                  color: 'text-blue-600'
                },
                {
                  label: 'Total Earnings',
                  value: `$${referralStats.totalEarnings}`,
                  icon: DollarSign,
                  color: 'text-green-600'
                },
                {
                  label: 'Pending Earnings',
                  value: `$${referralStats.pendingEarnings}`,
                  icon: TrendingUp,
                  color: 'text-yellow-600'
                }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </span>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

          </section>
        )}

        {/* BENEFITS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Why Join Our Referral Program?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              One of the highest-paying referral programs in the industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-xl transition"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {b.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4">

            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Start earning in 4 simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, i) => (
                <div key={i} className="relative">

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 h-full border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full font-bold text-xl mb-4">
                      {step.step}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mt-3">
                      {step.description}
                    </p>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="mt-10 space-y-4">
            {[
              {
                q: 'When do I get paid?',
                a: 'You receive $20 immediately after your referred friend completes their first escrow transaction.'
              },
              {
                q: 'Is there a limit to referrals?',
                a: 'No. Refer unlimited friends and earn unlimited rewards.'
              },
              {
                q: 'How does my friend get their bonus?',
                a: 'Your friend gets $10 instantly after signing up using your referral link.'
              },
              {
                q: 'Can I withdraw my earnings?',
                a: 'Yes. Withdraw anytime to your bank account or use it within Dealcross.'
              },
              {
                q: 'What qualifies as a completed transaction?',
                a: 'A full escrow process: payment, confirmation, and completed delivery.'
              }
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-center rounded-3xl p-10 text-white relative overflow-hidden">

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Start Earning?
              </h2>
              <p className="text-lg text-blue-100 mt-4 max-w-2xl mx-auto">
                Join thousands of users earning passive income by sharing Dealcross.
              </p>

              {user ? (
                <button
                  onClick={handleCopyLink}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition font-bold text-lg shadow-xl mt-6"
                >
                  Copy My Referral Link
                </button>
              ) : (
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition font-bold text-lg shadow-xl mt-6"
                >
                  Sign Up & Get Started
                </button>
              )}
            </div>

          </div>
        </section>

      </main>
    </>
  );
};

export default ReferralPage;
