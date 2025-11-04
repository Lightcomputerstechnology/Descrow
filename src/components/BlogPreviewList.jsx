// File: src/components/BlogPreviewList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const BlogPreviewList = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const blogPosts = [
    {
      title: '5 Tips for Safe Online Trading',
      excerpt: 'Learn how to protect yourself from scams and fraudulent sellers when trading online.',
      date: 'March 15, 2025',
      link: '/blog/safe-online-trading'
    },
    {
      title: 'Understanding Escrow Services',
      excerpt: 'A complete guide to how escrow services work and why they are essential for secure transactions.',
      date: 'March 10, 2025',
      link: '/blog/understanding-escrow'
    },
    {
      title: 'Cryptocurrency Payments Explained',
      excerpt: 'Everything you need to know about accepting Bitcoin, Ethereum, and other cryptocurrencies.',
      date: 'March 5, 2025',
      link: '/blog/cryptocurrency-payments'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Latest from Our Blog
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Tips, guides, and industry insights
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={post.link}
                className="block bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
              >
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">
                  {post.date}
                </p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                  {post.excerpt}
                </p>
                <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200">
                  Read More →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/blog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
          >
            View All Posts →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreviewList;
