// File: src/pages/CareersPage.jsx
import React, { useEffect } from 'react';
import {
  Briefcase,
  Heart,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Award,
  Coffee
} from 'lucide-react';
import SEOHead from '../components/SEOHead';

const CareersPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openPositions = [
    {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote / New York, NY',
      type: 'Full-time',
      description: 'Build scalable features for our escrow platform using React, Node.js, and MongoDB.'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create intuitive user experiences and beautiful interfaces for millions of users.'
    },
    {
      title: 'Customer Success Manager',
      department: 'Support',
      location: 'Remote / San Francisco, CA',
      type: 'Full-time',
      description: 'Help our users succeed with world-class support and relationship management.'
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Maintain and scale our infrastructure to handle millions of secure transactions.'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote / New York, NY',
      type: 'Full-time',
      description: 'Drive growth through creative campaigns and data-driven marketing strategies.'
    },
    {
      title: 'Security Engineer',
      department: 'Security',
      location: 'Remote',
      type: 'Full-time',
      description: 'Protect our platform and users with cutting-edge security practices.'
    }
  ];

  const benefits = [
    { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision insurance.' },
    { icon: TrendingUp, title: 'Equity & Growth', description: 'Stock options & clear career growth paths.' },
    { icon: Globe, title: 'Remote First', description: 'Work from anywhere with flexible schedules.' },
    { icon: Coffee, title: 'Work-Life Balance', description: 'Unlimited PTO & generous parental leave.' },
    { icon: Zap, title: 'Learning Budget', description: '$2,000 yearly learning and development budget.' },
    { icon: Award, title: 'Competitive Salary', description: 'Top-tier salaries with annual performance bonuses.' }
  ];

  const values = [
    { title: 'Customer Obsessed', description: 'We build features with users at the center.' },
    { title: 'Move Fast', description: 'We ship quickly, iterate fast, and learn continuously.' },
    { title: 'Transparency', description: 'We communicate openly and build trust with honesty.' },
    { title: 'Excellence', description: 'We set high standards and take pride in quality.' }
  ];

  // Prepare JSON-LD for job schema markup
  const jobPostingSchema = openPositions.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: new Date().toISOString(),
    employmentType: job.type,
    hiringOrganization: {
      "@type": "Organization",
      name: "Dealcross",
      sameAs: "https://dealcross.net",
      logo: "https://dealcross.net/logo.png"
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location
      }
    }
  }));

  return (
    <>
      <SEOHead
        title="Careers at Dealcross | Join Our Team"
        description="Explore remote-friendly opportunities at Dealcross. We're hiring engineers, designers, marketers, security experts and more. Build the future of secure transactions."
        keywords="Dealcross careers, hiring, tech jobs, remote jobs, engineering careers, startup jobs, product designer jobs"
        schemaData={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://dealcross.net"
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Careers",
                item: "https://dealcross.net/careers"
              }
            ]
          },
          ...jobPostingSchema
        ]}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* ======================== HERO SECTION ======================== */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <Briefcase className="w-16 h-16 text-white mx-auto mb-6" aria-hidden="true" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Build the Future of Trust
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join our mission to make online transactions safe and secure for everyone worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#openings"
                className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-gray-100 transition shadow-xl"
                aria-label="View open job positions"
              >
                View Open Positions
              </a>
              <a
                href="#culture"
                className="px-8 py-4 bg-blue-700 text-white font-bold text-lg rounded-xl hover:bg-blue-800 transition border-2 border-white/30"
                aria-label="Learn about our company culture"
              >
                Learn About Our Culture
              </a>
            </div>
          </div>
        </section>

        {/* ======================== STATS ======================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '50+', label: 'Team Members' },
              { number: '12', label: 'Countries' },
              { number: '$5M', label: 'Series A Funding' },
              { number: '4.9/5', label: 'Glassdoor Rating' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ======================== MISSION ======================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Dealcross is building the infrastructure for trust in online commerce—
            making every transaction safe, transparent, and protected.
          </p>
        </section>

        {/* ======================== BENEFITS ======================== */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Benefits & Perks
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                We take care of our team so they can do their best work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================== VALUES ======================== */}
        <section id="culture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              The principles that guide how we build and collaborate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{idx + 1}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ======================== OPEN POSITIONS ======================== */}
        <section id="openings" className="bg-white dark:bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Open Positions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Join our growing team.</p>
            </div>

            <div className="space-y-4">
              {openPositions.map((position, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {position.title}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                          {position.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" aria-hidden="true" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" aria-hidden="true" />
                          {position.location}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {position.description}
                      </p>
                    </div>

                    <a
                      href={`mailto:careers@dealcross.net?subject=${encodeURIComponent(
                        `Application for ${position.title}`
                      )}`}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold whitespace-nowrap text-center"
                      aria-label={`Apply for ${position.title}`}
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* GENERAL APPLICATION */}
            <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Don't See the Perfect Role?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                We're always looking for exceptional people. Send your resume and tell us how you can contribute.
              </p>
              <a
                href="mailto:careers@dealcross.net?subject=General%20Application"
                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-bold shadow-lg"
                aria-label="Submit a general job application"
              >
                Send General Application
              </a>
            </div>
          </div>
        </section>

        {/* ======================== LIFE AT DEALCROSS ======================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Life at Dealcross
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">A look inside our culture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
                title: 'Collaborative Team',
                description: 'Work with talented people who support one another.'
              },
              {
                image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop',
                title: 'Modern Workspace',
                description: 'State-of-the-art work environment in major cities.'
              },
              {
                image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
                title: 'Team Events',
                description: 'Regular team-building and company retreats.'
              }
            ].map((item, idx) => (
              <article
                key={idx}
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image}
                    loading="lazy"
                    alt={`${item.title} - ${item.description}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ======================== CTA SECTION ======================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <Users className="w-16 h-16 mx-auto mb-6" aria-hidden="true" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join us in building the future of secure digital commerce.
              </p>

              <a
                href="#openings"
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition font-bold text-lg shadow-xl"
              >
                View Open Positions
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default CareersPage;
