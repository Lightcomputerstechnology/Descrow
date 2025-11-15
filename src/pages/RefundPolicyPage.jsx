// File: src/pages/RefundPolicyPage.jsx

import React, { useEffect } from 'react';
import { RefreshCw, Shield, Clock, AlertCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const RefundPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead
        title="Refund Policy | Dealcross Escrow Refunds, Dispute Resolutions & Buyer Protection"
        description="Learn about Dealcross's refund policy, dispute resolution process, refund timelines, non-refundable fees, partial refunds, and how to request a refund for escrow transactions."
        keywords="Dealcross refund policy, escrow refunds, dispute resolution, chargebacks, crypto refunds, buyer protection, seller protection, escrow rules, refund timelines"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 md:p-12">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Refund Policy
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Last updated:{' '}
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Body Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">

              {/* 1. Overview */}
              <section aria-labelledby="overview" className="mb-8">
                <h2 id="overview" className="text-2xl font-bold">
                  1. Overview
                </h2>
                <p>
                  At Dealcross, we prioritize fairness, transparency, and safety in every transaction. Our escrow
                  system ensures both buyers and sellers are protected from fraud, disputes, or delivery issues.
                  This Refund Policy outlines when refunds are issued and how they are processed.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Buyer Protection:</strong> All funds remain securely in escrow until delivery is confirmed.
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. Escrow Transaction Refunds */}
              <section aria-labelledby="escrow-refunds" className="mb-8">
                <h2 id="escrow-refunds" className="text-2xl font-bold">
                  2. Escrow Transaction Refunds
                </h2>

                <h3 className="text-xl font-semibold">2.1 Automatic Refunds</h3>
                <p>
                  Automatic full refunds (excluding fees) are issued when the following conditions apply:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>Seller declines the transaction before delivery</li>
                  <li>Seller fails to deliver within the agreed timeframe</li>
                  <li>Buyer and seller mutually cancel the transaction</li>
                  <li>Platform error prevents transaction completion</li>
                  <li>Seller account suspension before delivery</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">2.2 Dispute-Based Refunds</h3>
                <p>
                  If you're unsatisfied with your purchase, you may open a dispute within 7 days of delivery
                  confirmation. After investigation:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Full Refund:</strong> Item not received, counterfeit, or not as described</li>
                  <li><strong>Partial Refund:</strong> Minor issues or incomplete delivery</li>
                  <li><strong>No Refund:</strong> Buyer remorse or false claims</li>
                </ul>
              </section>

              {/* 3. Service Fee Refunds */}
              <section aria-labelledby="service-fees" className="mb-8">
                <h2 id="service-fees" className="text-2xl font-bold">3. Service Fee Refunds</h2>

                <h3 className="text-xl font-semibold">3.1 Non-Refundable Fees</h3>
                <p>The following fees cannot be refunded under any circumstances:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>Platform service fees</li>
                  <li>Payment processor fees</li>
                  <li>Crypto network/gas fees</li>
                  <li>International transfer fees</li>
                  <li>Speed-up or priority processing fees</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">3.2 Refundable Fees</h3>
                <p>Fees may be refunded if:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>Transaction is cancelled before seller acceptance</li>
                  <li>There is a platform-related technical issue</li>
                  <li>Seller violates Terms of Service</li>
                  <li>Transaction is proven fraudulent</li>
                </ul>
              </section>

              {/* 4. Refund Timeline */}
              <section aria-labelledby="timeline" className="mb-8">
                <h2 id="timeline" className="text-2xl font-bold">4. Refund Processing Timeline</h2>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold">Automatic Refunds</h4>
                      </div>
                      <p className="text-sm">Instant to wallet. Bank transfers: 1–3 business days.</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <h4 className="font-semibold">Dispute Refunds</h4>
                      </div>
                      <p className="text-sm">Processed 3–7 business days after resolution.</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold">Crypto Refunds</h4>
                      </div>
                      <p className="text-sm">Instant to wallet; withdrawal requires network confirmation.</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold">Credit Card Refunds</h4>
                      </div>
                      <p className="text-sm">5–10 business days depending on issuer.</p>
                    </div>

                  </div>
                </div>
              </section>

              {/* 5. Refund Methods */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold">5. Refund Methods</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li><strong>Original Payment Method</strong> (preferred)</li>
                  <li><strong>Dealcross Wallet</strong> (instant use / withdraw)</li>
                  <li><strong>Alternative Method</strong> (verification required)</li>
                </ol>
              </section>

              {/* 6. How to Request */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold">6. How to Request a Refund</h2>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>Open the transaction in your dashboard</li>
                  <li>Select “Open Dispute” or “Request Refund”</li>
                  <li>Choose a reason</li>
                  <li>Provide evidence</li>
                  <li>Submit request</li>
                  <li>Support reviews within 48–72 hours</li>
                </ol>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-1" />
                    <p className="text-sm">
                      Refund requests must be submitted within <strong>7 days</strong> of delivery confirmation.
                    </p>
                  </div>
                </div>
              </section>

              {/* 7. Partial Refunds */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold">7. Partial Refunds</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Minor defects</li>
                  <li>Incomplete orders</li>
                  <li>Late delivery</li>
                  <li>Slightly lower product quality</li>
                  <li>Mutual agreement</li>
                </ul>
              </section>

              {/* 8. Non-Refundable Situations */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold">8. Non-Refundable Situations</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Buyer remorse</li>
                  <li>Item matches description</li>
                  <li>Late dispute opening</li>
                  <li>False claims</li>
                  <li>Buyer-caused damage</li>
                  <li>Terms of Service violation</li>
                </ul>
              </section>

              {/* 9. Chargebacks */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold">9. Chargebacks</h2>
                <p>We strongly recommend contacting support before initiating a chargeback.</p>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-1" />
                    <p className="text-sm">
                      Unjustified chargebacks may result in account suspension and legal action.
                    </p>
                  </div>
                </div>
              </section>

              {/* 10. Appeal */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold">10. Refund Appeal Process</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Submit an appeal within 14 days</li>
                  <li>Provide new information</li>
                  <li>Explain your reasoning</li>
                  <li>Senior support review</li>
                  <li>Decision provided in 5–7 business days</li>
                </ol>
              </section>

              {/* 11. Policy Changes */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold">11. Changes to This Policy</h2>
                <p>
                  Dealcross may update this policy at any time. Significant changes will be communicated via email
                  or notifications.
                </p>
              </section>

              {/* 12. Contact */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold">12. Contact Us</h2>
                <p>If you need help with refunds or disputes:</p>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <p className="font-semibold text-sm">Email Support</p>
                    <a href="mailto:refunds@dealcross.net" className="text-blue-600 dark:text-blue-400 hover:underline">
                      refunds@dealcross.net
                    </a>
                  </div>

                  <div>
                    <p className="font-semibold text-sm">Live Chat</p>
                    <p className="text-sm">Available 24/7 inside your dashboard</p>
                  </div>

                  <div>
                    <p className="font-semibold text-sm">Phone Support</p>
                    <p className="text-sm">+1 (555) 123-4567 (Mon–Fri, 9 AM – 6 PM EST)</p>
                  </div>
                </div>
              </section>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicyPage;
