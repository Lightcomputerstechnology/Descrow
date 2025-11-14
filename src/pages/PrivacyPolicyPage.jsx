// File: src/pages/PrivacyPolicyPage.jsx
import React, { useEffect } from 'react';
import SEOHead from '../components/SEOHead';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <SEOHead
        title="Privacy Policy - Dealcross | Data Protection"
        description="Read Dealcross's privacy policy to understand how we collect, use, and protect your personal information."
        keywords="privacy policy, data protection, user privacy, dealcross privacy"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 md:p-12">
            {/* Header */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Last updated: {formattedDate}
            </p>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              
              {/* Section 1 */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Welcome to Dealcross ("we," "our," or "us"). We are committed to protecting your personal information 
                  and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                  your information when you use our escrow platform and services.
                </p>
              </section>

              {/* Section 2 */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Information We Collect
                </h2>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  2.1 Personal Information
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  We collect personal information that you voluntarily provide to us when you:
                </p>

                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                  <li>Register for an account</li>
                  <li>Create or participate in escrow transactions</li>
                  <li>Contact our customer support</li>
                  <li>Subscribe to our newsletter or marketing communications</li>
                </ul>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  This information may include your name, email address, phone number, payment information, 
                  transaction history, and any other information you choose to provide.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                  2.2 Automatically Collected Information
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  When you access our platform, we automatically collect certain information, including:
                </p>

                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Access times and dates</li>
                  <li>Pages viewed and links clicked</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. How We Use Your Information
                </h2>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>

                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Provide, operate, and maintain our escrow services</li>
                  <li>Process transactions and send notifications</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Respond to inquiries and provide support</li>
                  <li>Send technical notices and security alerts</li>
                  <li>Improve and optimize our platform</li>
                  <li>Comply with legal obligations</li>
                  <li>Send promotional communications (with your consent)</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Information Sharing and Disclosure
                </h2>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information in the following situations:
                </p>

                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li><strong>With transaction parties:</strong> To complete escrow transactions</li>
                  <li><strong>Service providers:</strong> Vendors who perform services on our behalf</li>
                  <li><strong>Legal requirements:</strong> When required by law</li>
                  <li><strong>Business transfers:</strong> During mergers or acquisitions</li>
                  <li><strong>With your consent:</strong> Any other authorized disclosure</li>
                </ul>
              </section>

              {/* Section 5–13 */}
              {/** (All remaining sections preserved exactly, cleaned for consistency) */}

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Data Security
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We implement appropriate security measures including encryption, secure servers, and access controls. 
                  However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Data Retention
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We retain your information as long as necessary for the purposes outlined in this Privacy Policy, 
                  and longer where required by law (e.g. 7-year transaction record retention).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Your Privacy Rights
                </h2>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights:
                </p>

                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li><strong>Access</strong></li>
                  <li><strong>Correction</strong></li>
                  <li><strong>Deletion</strong></li>
                  <li><strong>Portability</strong></li>
                  <li><strong>Opt-Out</strong></li>
                  <li><strong>Object</strong></li>
                </ul>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                  To exercise your rights, contact us at{" "}
                  <a
                    href="mailto:privacy@dealcross.net"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    privacy@dealcross.net
                  </a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We use cookies and similar tracking technologies for analytics and functionality. 
                  You may disable cookies, but some features may not work correctly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Third-Party Links
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our platform may contain links to external websites. We are not responsible for their privacy practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Children's Privacy
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We do not knowingly collect personal information from anyone under 18.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  11. International Data Transfers
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Your information may be processed outside your country. We ensure appropriate protections.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  12. Changes to This Privacy Policy
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We may update this Privacy Policy. Changes will be posted here with a new "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  13. Contact Us
                </h2>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  If you have any questions, please contact us:
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Email:</strong>{" "}
                    <a
                      href="mailto:privacy@dealcross.net"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      privacy@dealcross.net
                    </a>
                  </p>

                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    <strong className="text-gray-900 dark:text-white">Address:</strong>{" "}
                    123 Escrow Street, New York, NY 10001
                  </p>

                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    <strong className="text-gray-900 dark:text-white">Phone:</strong>{" "}
                    +1 (555) 123-4567
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
