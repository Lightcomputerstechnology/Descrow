import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome_to_dealcross: "Secure Escrow Payments",
      subtitle: "for Global Trade",
      your_trusted_escrow: "Protect your online transactions with our trusted escrow service. Buy and sell with confidence, anywhere in the world.",
      get_started: "Get Started Free",
      learn_more: "See How It Works",
      view_docs: "View Documentation"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
