// File: src/pages/BlogPage.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, ArrowRight, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { Link } from 'react-router-dom';

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', 'Security', 'Guides', 'Updates', 'Tips', 'Industry News'];

  // ============================ BLOG POSTS =============================
  const blogPosts = [
    {
      id: 1,
      title: '10 Tips for Safe Online Transactions',
      excerpt:
        'Learn essential security practices to protect yourself when buying or selling online.',
      author: 'Sarah Johnson',
      date: 'Nov 10, 2024',
      readTime: '5 min read',
      category: 'Security',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop',
      featured: true,
    },
    {
      id: 2,
      title: 'Understanding Escrow: A Complete Guide',
      excerpt:
        "Everything you need to know about how escrow works, when to use it, and why it's the safest way to transact.",
      author: 'Michael Chen',
      date: 'Nov 8, 2024',
      readTime: '8 min read',
      category: 'Guides',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop',
      featured: true,
    },
    {
      id: 3,
      title: 'New Feature: Multi-Currency Support',
      excerpt:
        "We're excited to announce support for 50+ currencies and major cryptocurrencies.",
      author: 'Dealcross Team',
      date: 'Nov 5, 2024',
      readTime: '3 min read',
      category: 'Updates',
      image: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=400&fit=crop',
      featured: false,
    },
    {
      id: 4,
      title: 'How to Avoid Common Scams',
      excerpt:
        'Recognize red flags and protect yourself from fraudsters with our comprehensive guide.',
      author: 'Emily Rodriguez',
      date: 'Nov 1, 2024',
      readTime: '6 min read',
      category: 'Security',
      image:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop',
      featured: false,
    },
    {
      id: 5,
      title: 'Cryptocurrency Escrow: The Future of Digital Trading',
      excerpt:
        'Explore how blockchain and cryptocurrency are reshaping secure transaction methods.',
      author: 'David Kumar',
      date: 'Oct 28, 2024',
      readTime: '7 min read',
      category: 'Industry News',
      image:
        'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop',
      featured: false,
    },
    {
      id: 6,
      title: 'Best Practices for Sellers on Dealcross',
      excerpt:
        'Maximize your success as a seller with tips for faster sales, better reviews, and repeat customers.',
      author: 'Jessica Williams',
      date: 'Oct 25, 2024',
      readTime: '5 min read',
      category: 'Tips',
      image:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
      featured: false,
    },
  ];

  // ============================ FILTERING =============================
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      post.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter((post) => post.featured);

  // ============================ UI =============================
  return (
    <>
      <SEOHead
        title="Blog - Dealcross | Escrow News, Guides & Updates"
        description="Stay updated with the latest escrow news, security tips, platform updates, and trading guides from Dealcross."
        keywords="dealcross blog, escrow news, trading guides, security tips, platform updates"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* ================= HEADER ================= */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Dealcross Blog</h1>
            <p className="text-xl text-blue-100 mb-8">
              Latest news, guides, and insights about secure online transactions
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 dark:bg-gray-800 dark:text-white border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= CATEGORY FILTER ================= */}
        <div className="max-w-7xl mx-auto px-4 -mt-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => {
                const normalized = cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(normalized)}
                    className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                      selectedCategory === normalized
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* ===== FEATURED ===== */}
          {searchQuery === '' && selectedCategory === 'all' && featuredPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Featured Articles
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.id}`}
                    className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-800 transition-all"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                          {post.category}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full text-white flex items-center justify-center text-sm font-semibold">
                            {post.author.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {post.author}
                            </p>
                            <p className="text-xs text-gray-500">{post.date}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ===== ALL POSTS / RESULTS ===== */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {searchQuery !== '' || selectedCategory !== 'all'
              ? `${filteredPosts.length} ${
                  filteredPosts.length === 1 ? 'Result' : 'Results'
                }`
              : 'Latest Articles'}
          </h2>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-800 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-gray-900/90 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{post.author}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // ===== EMPTY STATE =====
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search or filters.
              </p>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* ================= NEWSLETTER ================= */}
          <div className="mt-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter to get the latest articles and updates.
            </p>

            <form className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Subscribe
              </button>
            </form>

            <p className="text-xs text-blue-200 mt-3">We respect your privacy.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
