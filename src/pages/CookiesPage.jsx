// File: src/pages/CookiesPage.jsx
import React, { useEffect } from 'react';
import { Cookie, Settings, Eye, Shield } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const CookiesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // JSON-LD Schema for better SEO
  const cookieSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Cookie Policy - Dealcross",
    "description": "Official Cookie Policy for Dealcross. Learn how we use cookies for security, analytics, personalization, and platform optimization.",
    "url": "https://dealcross.net/cookies",
    "publisher": {
      "@type": "Organization",
      "name": "Dealcross",
      "url": "https://dealcross.net",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dealcross.net/logo.png"
      }
    },
    "mainEntity": {
      "@type": "Article",
      "headline": "Dealcross Cookie Policy",
      "dateModified": new Date().toISOString()
    }
  };

  return (
    <>
      <SEOHead
        title="Cookie Policy - Dealcross | How We Use Cookies for Security & Experience"
        description="Read Dealcross' Cookie Policy. Understand how we use essential, analytics, and functional cookies to improve security, user experience, fraud prevention, and platform performance."
        keywords="Dealcross cookie policy, how cookies work, website cookies, privacy cookies, analytics cookies, essential cookies, functional cookies, cookie consent, cookie settings"
      />

      {/* Add schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(cookieSchema)}
      </script>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8" role="main">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 md:p-12">

            {/* Header */}
            <header className="flex items-center gap-3 mb-6" role="banner">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Cookie className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Cookie Policy
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Last updated:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </header>

            {/* Content */}
            <article className="prose prose-lg dark:prose-invert max-w-none">

              {/* SECTION 1 */}
              <section id="what-are-cookies" className="mb-8">
                <h2 className="text-2xl font-bold">1. What Are Cookies?</h2>
                <p>
                  Cookies are small text files stored on your device when you visit
                  a website. They improve functionality, security, and user
                  experience by remembering your actions and preferences.
                </p>
                <p>
                  At <strong>Dealcross</strong>, we use cookies to enhance your
                  experience, secure your account, and analyze how our platform is
                  used.
                </p>
              </section>

              {/* SECTION 2 */}
              <section id="cookie-types" className="mb-8">
                <h2 className="text-2xl font-bold">2. Types of Cookies We Use</h2>

                {/* Essential cookies */}
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-xl font-semibold">Essential Cookies</h3>
                    </div>
                    <p>Required for core system functionality.</p>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li>Secure login & authentication</li>
                      <li>Fraud and CSRF protection</li>
                      <li>Session stability</li>
                      <li>Traffic load balancing</li>
                    </ul>
                  </div>

                  {/* Analytics cookies */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h3 className="text-xl font-semibold">Analytics Cookies</h3>
                    </div>
                    <p>Used to understand usage and improve performance.</p>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li>Google Analytics</li>
                      <li>User behavior insights</li>
                      <li>Feature optimization & A/B testing</li>
                    </ul>
                  </div>

                  {/* Functional cookies */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-xl font-semibold">Functional Cookies</h3>
                    </div>
                    <p>Enhance your personalized experience.</p>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li>Theme preferences (dark/light mode)</li>
                      <li>Language settings</li>
                      <li>Saved dashboard layout</li>
                      <li>Recent searches</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* SECTION 3: HOW WE USE COOKIES */}
              <section id="how-we-use-cookies" className="mb-8">
                <h2 className="text-2xl font-bold">3. How We Use Cookies</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Security & fraud prevention</li>
                  <li>Account authentication</li>
                  <li>Personalized dashboard experience</li>
                  <li>Performance analytics</li>
                  <li>Transaction protection</li>
                </ul>
              </section>

              {/* SECTION 4 – THIRD PARTY */}
              <section id="third-party-cookies" className="mb-8">
                <h2 className="text-2xl font-bold">4. Third-Party Cookies</h2>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Google Analytics</h4>
                      <p className="text-sm">
                        Used to understand visitor activity.
                        <a
                          href="https://policies.google.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 ml-1 underline"
                        >
                          Privacy Policy
                        </a>
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold">Payment Providers</h4>
                      <p className="text-sm">
                        Stripe, PayPal, and others may use cookies for fraud
                        detection.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold">Customer Support Tools</h4>
                      <p className="text-sm">
                        Tools like Intercom may set cookies for chat sessions.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 5 – COOKIE LIFESPAN */}
              <section id="cookie-duration" className="mb-8">
                <h2 className="text-2xl font-bold">5. How Long Do Cookies Last?</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                      Session Cookies
                    </h4>
                    <p className="text-sm">Deleted when browser closes.</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200">
                      Persistent Cookies
                    </h4>
                    <p className="text-sm">
                      Last between 30 days and 2 years.
                    </p>
                  </div>
                </div>
              </section>

              {/* SECTION 6 – MANAGING COOKIES */}
              <section id="managing-cookies" className="mb-8">
                <h2 className="text-2xl font-bold">6. Managing Cookie Preferences</h2>
                <p>You can control your cookie preferences via:</p>

                <h3 className="font-semibold mt-4">Browser Settings</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Chrome → Privacy & Security → Cookies</li>
                  <li>Firefox → Privacy & Security → Cookies</li>
                  <li>Safari → Privacy → Cookies</li>
                  <li>Edge → Cookies & Site Permissions</li>
                </ul>

                <h3 className="font-semibold mt-4">Dealcross Cookie Manager</h3>
                <p>Shown on your first visit, or accessible in settings.</p>
              </section>

              {/* SECTION 7 – DISABLING COOKIES */}
              <section id="disable-impact" className="mb-8">
                <h2 className="text-2xl font-bold">7. Impact of Disabling Cookies</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                  <p className="font-semibold">Warning:</p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Frequent logouts</li>
                    <li>Lost preferences</li>
                    <li>Reduced functionality</li>
                    <li>Weaker security</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 8 – DNT */}
              <section id="do-not-track" className="mb-8">
                <h2 className="text-2xl font-bold">8. Do Not Track (DNT)</h2>
                <p>
                  Some browsers send DNT signals. While standards are not yet
                  defined, Dealcross does not track users across third-party websites
                  for advertising.
                </p>
              </section>

              {/* SECTION 9 – UPDATES */}
              <section id="updates" className="mb-8">
                <h2 className="text-2xl font-bold">9. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy to reflect changes in law,
                  security, or platform improvements. Significant updates will be
                  clearly communicated.
                </p>
              </section>

              {/* SECTION 10 – CONTACT */}
              <section id="contact" className="mb-8">
                <h2 className="text-2xl font-bold">10. Contact Us</h2>
                <p>For questions regarding cookies or privacy, contact:</p>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold">Email</p>
                      <a
                        href="mailto:privacy@dealcross.net"
                        className="text-blue-600 dark:text-blue-400 underline"
                      >
                        privacy@dealcross.net
                      </a>
                    </div>

                    <div>
                      <p className="font-semibold">Data Protection Officer</p>
                      <a
                        href="mailto:dpo@dealcross.net"
                        className="text-blue-600 dark:text-blue-400 underline"
                      >
                        dpo@dealcross.net
                      </a>
                    </div>

                    <div>
                      <p className="font-semibold">Mail</p>
                      <p className="text-sm">
                        Dealcross Inc. <br />
                        123 Escrow Street <br />
                        New York, NY 10001 <br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiesPage;
