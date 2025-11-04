// File: src/pages/LandingPage.jsx
import React from 'react';
import SEOHead from '../components/SEOHead';
import HeroSection from '../components/HeroSection';
import DealsInProgress from '../components/DealsInProgress';
import HowItWorks from '../components/HowItWorks';
import TrustLevels from '../components/TrustLevels';
import FastPayouts from '../components/FastPayouts';
import PaymentMethods from '../components/PaymentMethods';
import TestimonialsSection from '../components/TestimonialsSection';
import APISection from '../components/APISection';
import FAQPreview from '../components/FAQPreview';
import StartTradingCTA from '../components/StartTradingCTA';
import BlogPreviewList from '../components/BlogPreviewList';
import ContactSection from '../components/ContactSection';

export default function LandingPage() {
  return (
    <>
      <SEOHead
        title="Dealcross - Secure Escrow & Trading Platform"
        description="Start secure escrow deals, trade shares, and manage wallet transactions on Dealcross."
        keywords="escrow, secure deals, trading, wallet, Dealcross, Bitcoin, USDT"
      />

      <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
        <HeroSection />
        <DealsInProgress />
        <HowItWorks />
        <TrustLevels />
        <FastPayouts />
        <PaymentMethods />
        <TestimonialsSection />
        <APISection />
        <FAQPreview />
        <StartTradingCTA />
        <BlogPreviewList />
        <ContactSection />
      </main>
    </>
  );
}
