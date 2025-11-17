// File: src/components/SEOHead.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ title, description, keywords, image, url }) => {
  const defaultTitle = 'Dealcross - Secure Escrow & Trading Platform';
  const defaultDescription = 'Secure escrow payments for global trade. Buy and sell with confidence using our trusted platform.';
  const defaultKeywords = 'escrow, secure deals, trading, wallet, Dealcross, Bitcoin, USDT, online payments';
  const defaultImage = 'https://dealcross.net/og-image.jpg';
  const defaultUrl = 'https://dealcross.net';

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || defaultUrl} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || defaultUrl} />
      <meta property="twitter:title" content={title || defaultTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || defaultImage} />

      {/* Additional SEO */}
      <link rel="canonical" href={url || defaultUrl} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Dealcross" />
    </Helmet>
  );
};

export default SEOHead;
