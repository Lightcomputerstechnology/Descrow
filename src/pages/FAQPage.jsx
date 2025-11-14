// File: src/pages/FAQPage.jsx
import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'What is Dealcross and how does it work?',
          a: 'Dealcross is a secure escrow platform that protects both buyers and sellers in online transactions. We hold the buyer\'s payment securely until the seller delivers the goods or services. Once the buyer confirms satisfaction, we release the funds to the seller. This ensures both parties are protected throughout the transaction.'
        },
        {
          q: 'How do I create an account?',
          a: 'Creating an account is simple! Click the "Sign Up" button, provide your email address, create a password, and verify your email. You can start using Dealcross immediately after verification. For enhanced security and higher transaction limits, we recommend completing identity verification.'
        },
        {
          q: 'Is Dealcross free to use?',
          a: 'Registration is completely free. We charge a small service fee (typically 3-5%) on each transaction to cover payment processing and platform maintenance. The exact fee is displayed before you confirm any transaction. There are no hidden charges or monthly fees.'
        },
        {
          q: 'What currencies do you support?',
          a: 'We support major currencies including USD, EUR, GBP, and popular cryptocurrencies like Bitcoin (BTC), Ethereum (ETH), and USDT. You can view the complete list of supported currencies in your account settings.'
        }
      ]
    },
    {
      category: 'Transactions',
      questions: [
        {
          q: 'How long does a transaction take?',
          a: 'Transaction timing varies depending on the agreement between buyer and seller. Once the buyer deposits funds (usually instant), the seller has the agreed timeframe to deliver. After delivery, the buyer typically has 3-7 days to confirm receipt. If confirmed earlier, funds are released immediately.'
        },
        {
          q: 'What happens if there\'s a problem with my order?',
          a: 'If you\'re unsatisfied with the goods or services received, you can open a dispute within the transaction window. Our dispute resolution team will investigate both sides, request evidence, and make a fair decision. Disputes are typically resolved within 48-72 hours.'
        },
        {
          q: 'Can I cancel a transaction?',
          a: 'Yes, transactions can be cancelled before the seller ships/delivers. Both parties must agree to the cancellation. If funds were already deposited, they will be returned to the buyer within 1-3 business days. After shipment, cancellation requires dispute resolution.'
        },
        {
          q: 'How do I track my transaction?',
          a: 'All transactions are tracked in real-time through your dashboard. You\'ll receive email and in-app notifications for every status change. You can also enable SMS notifications for important updates. Sellers can upload tracking numbers for physical shipments.'
        }
      ]
    },
    {
      category: 'Payments & Fees',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept credit/debit cards (Visa, Mastercard, American Express), bank transfers, PayPal, and various cryptocurrencies including Bitcoin, Ethereum, and USDT. Payment method availability may vary by country.'
        },
        {
          q: 'How are fees calculated?',
          a: 'Our fee structure is transparent: 3% for standard transactions, 2% for verified accounts with high transaction volume, and 5% for cryptocurrency transactions. There are no hidden fees. The exact fee is always shown before you confirm a transaction.'
        },
        {
          q: 'When do I receive my money as a seller?',
          a: 'Funds are released to your Dealcross wallet immediately after the buyer confirms receipt and satisfaction. From your wallet, you can withdraw to your bank account (1-3 business days) or crypto wallet (instant for most cryptocurrencies).'
        },
        {
          q: 'Are there withdrawal fees?',
          a: 'Bank transfers have a flat fee of $2.50 per withdrawal. Cryptocurrency withdrawals have network fees (varies by blockchain). There\'s no fee for keeping funds in your Dealcross wallet. We also offer free withdrawals for premium verified accounts.'
        }
      ]
    },
    {
      category: 'Security',
      questions: [
        {
          q: 'How secure is Dealcross?',
          a: 'Security is our top priority. We use bank-level 256-bit SSL encryption, two-factor authentication, and store funds in segregated accounts. Our platform undergoes regular security audits and penetration testing. We\'ve never had a security breach since launch.'
        },
        {
          q: 'What is two-factor authentication (2FA)?',
          a: 'Two-factor authentication adds an extra layer of security to your account. After entering your password, you\'ll need to provide a code from your phone (via SMS or authenticator app). This prevents unauthorized access even if someone knows your password.'
        },
        {
          q: 'How do you protect my personal information?',
          a: 'We comply with GDPR and international data protection standards. Your personal information is encrypted and never shared with third parties without your consent. We only collect data necessary for transaction processing and fraud prevention. Read our Privacy Policy for full details.'
        },
        {
          q: 'What if my account is compromised?',
          a: 'If you suspect unauthorized access, immediately change your password and contact our support team. We\'ll freeze your account, investigate suspicious activity, and help secure your funds. We also offer account recovery options and insurance for verified accounts.'
        }
      ]
    },
    {
      category: 'Disputes & Support',
      questions: [
        {
          q: 'How do I open a dispute?',
          a: 'To open a dispute, go to your transaction details and click "Open Dispute." Provide a clear description of the issue and upload any supporting evidence (photos, screenshots, messages). Both parties will be notified, and our team will investigate within 24 hours.'
        },
        {
          q: 'How long does dispute resolution take?',
          a: 'Most disputes are resolved within 48-72 hours. Complex cases may take up to 7 days. We investigate thoroughly, reviewing all evidence from both parties. Our decisions are final and binding. You\'ll be notified immediately when a decision is made.'
        },
        {
          q: 'What evidence should I provide for disputes?',
          a: 'For buyers: photos/videos of damaged goods, screenshots of conversations, shipping receipts. For sellers: proof of shipment with tracking, photos of items before shipping, communication records. The more evidence you provide, the faster we can resolve the dispute.'
        },
        {
          q: 'How can I contact customer support?',
          a: 'We offer 24/7 support via: live chat (instant response), email at support@dealcross.net (response within 4 hours), phone at +1 (555) 123-4567 (Mon-Fri 9AM-6PM EST). For urgent issues, use live chat for fastest response.'
        }
      ]
    },
    {
      category: 'Account & Verification',
      questions: [
        {
          q: 'Why should I verify my account?',
          a: 'Verified accounts enjoy: higher transaction limits ($10,000+ per transaction), lower fees (2% vs 3%), priority customer support, free withdrawals, and a "Verified" badge that increases trust with trading partners. Verification takes 24-48 hours.'
        },
        {
          q: 'What documents are needed for verification?',
          a: 'You\'ll need: a government-issued ID (passport, driver\'s license, or national ID card), proof of address (utility bill or bank statement less than 3 months old), and a selfie holding your ID. All documents must be clear and unedited.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, you can delete your account at any time from Settings > Account > Delete Account. Note: you must complete all pending transactions and withdraw your funds first. Account deletion is permanent and cannot be undone.'
        },
        {
          q: 'How do I change my email or phone number?',
          a: 'Go to Settings > Security > Update Contact Info. You\'ll need to verify your identity via 2FA and confirm the change through both old and new email addresses or phone numbers. Changes take effect immediately after verification.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <>
      <SEOHead
        title="FAQ - Dealcross | Frequently Asked Questions"
        description="Find answers to common questions about Dealcross escrow platform, transactions, payments, security, and more."
        keywords="dealcross faq, escrow questions, transaction help, payment questions, security questions, how does escrow work"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <HelpCircle className="w-16 h-16 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Quick answers to common questions about Dealcross
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQ..."
                  className="w-full pl-12 pr-4 py-4 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-800 dark:text-white text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No results found for "{searchQuery}". Try a different search term.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFaqs.map((category, catIndex) => (
                <div key={catIndex} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {category.category}
                  </h2>
                  <div className="space-y-4">
                    {category.questions.map((faq, faqIndex) => {
                      const globalIndex = `${catIndex}-${faqIndex}`;
                      const isOpen = openIndex === globalIndex;

                      return (
                        <div
                          key={faqIndex}
                          className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          >
                            <span className="font-semibold text-gray-900 dark:text-white pr-4">
                              {faq.q}
                            </span>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                                isOpen ? 'transform rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {faq.a}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still Have Questions */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Contact Support
              </a>
              <a
                href="/docs"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold border border-gray-300 dark:border-gray-700"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
