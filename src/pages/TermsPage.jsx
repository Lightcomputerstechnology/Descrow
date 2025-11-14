// File: src/pages/TermsPage.jsx
import React, { useEffect } from 'react';
import SEOHead from '../components/SEOHead';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead
        title="Terms of Service - Dealcross | User Agreement"
        description="Read Dealcross's terms of service to understand the rules and guidelines for using our secure escrow platform."
        keywords="terms of service, user agreement, dealcross terms, legal terms"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Agreement to Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  By accessing or using Dealcross ("Platform," "Service," "we," "us," or "our"), you agree to be bound 
                  by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use 
                  our services. These Terms apply to all users, including buyers, sellers, and visitors.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Eligibility
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  To use Dealcross, you must:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Be at least 18 years of age</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be prohibited from using our services under applicable laws</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Account Registration and Security
                </h2>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  3.1 Account Creation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  You must create an account to use certain features of our Platform. You agree to provide accurate, 
                  current, and complete information during registration and to update such information as necessary.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  3.2 Account Security
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all 
                  activities that occur under your account. You must immediately notify us of any unauthorized use 
                  of your account or any other security breach.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Escrow Services
                </h2>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  4.1 How It Works
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Dealcross provides escrow services that hold funds securely until both parties fulfill their 
                  obligations. The process includes:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                  <li>Buyer deposits funds into escrow</li>
                  <li>Seller delivers goods or services</li>
                  <li>Buyer confirms receipt and satisfaction</li>
                  <li>Funds are released to seller</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  4.2 Fees
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We charge a service fee for each transaction. Fees are clearly displayed before you complete a 
                  transaction. All fees are non-refundable unless otherwise stated.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. User Responsibilities
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  As a user of Dealcross, you agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Provide accurate transaction information</li>
                  <li>Communicate honestly with other parties</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not use the Platform for fraudulent or illegal activities</li>
                  <li>Not attempt to circumvent our escrow system</li>
                  <li>Not engage in money laundering or terrorist financing</li>
                  <li>Respond promptly to transaction-related communications</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Prohibited Activities
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  You may not:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Use the Platform for any illegal purpose</li>
                  <li>Impersonate another person or entity</li>
                  <li>Upload malicious code or viruses</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Harass, threaten, or defraud other users</li>
                  <li>Sell prohibited items (weapons, drugs, stolen goods, etc.)</li>
                  <li>Manipulate or interfere with the Platform's operation</li>
                  <li>Scrape or harvest data from the Platform</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Dispute Resolution
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  In the event of a dispute between parties:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Users should first attempt to resolve the issue directly</li>
                  <li>Either party may open a formal dispute through our Platform</li>
                  <li>We will investigate and may request additional documentation</li>
                  <li>Our decision on dispute resolution is final and binding</li>
                  <li>Disputes must be filed within 30 days of transaction completion</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Intellectual Property
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  All content on the Platform, including text, graphics, logos, images, and software, is the property 
                  of Dealcross or its licensors and is protected by copyright, trademark, and other intellectual 
                  property laws. You may not reproduce, distribute, or create derivative works without our express 
                  written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Limitation of Liability
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>We provide the Platform "as is" without warranties of any kind</li>
                  <li>We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>Our total liability shall not exceed the fees paid by you in the past 12 months</li>
                  <li>We are not responsible for user-generated content or third-party actions</li>
                  <li>We do not guarantee uninterrupted or error-free service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Indemnification
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  You agree to indemnify and hold harmless Dealcross, its affiliates, officers, directors, employees, 
                  and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising 
                  from your use of the Platform, violation of these Terms, or infringement of any third-party rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  11. Termination
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time for violation of these Terms, 
                  suspicious activity, or any other reason at our sole discretion. Upon termination, your right to use 
                  the Platform will immediately cease. You may also close your account at any time by contacting support.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  12. Changes to Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We may modify these Terms at any time. We will notify you of significant changes via email or by 
                  posting a notice on the Platform. Your continued use of the Platform after changes take effect 
                  constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  13. Governing Law
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  These Terms are governed by the laws of the State of New York, United States, without regard to its 
                  conflict of law provisions. Any disputes arising from these Terms or your use of the Platform shall 
                  be resolved in the courts located in New York, NY.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  14. Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Email:</strong>{' '}
                    <a href="mailto:legal@dealcross.net" className="text-blue-600 dark:text-blue-400 hover:underline">
                      legal@dealcross.net
                    </a>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    <strong className="text-gray-900 dark:text-white">Address:</strong> 123 Escrow Street, New York, NY 10001
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    <strong className="text-gray-900 dark:text-white">Phone:</strong> +1 (555) 123-4567
                  </p>
                </div>
              </section>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 mt-8">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Note:</strong> By using Dealcross, you acknowledge that you have read, understood, and agree 
                  to be bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;
