import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { trackEvent, enableTracking } from '../lib/analytics';
import { isEuropeanUser } from '../utils/geolocation';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  const setConsentCookie = (value: string) => {
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1); 
    document.cookie = `cookie_consent=${value}; expires=${expirationDate.toUTCString()}; path=/`;
    localStorage.setItem('alinea_cookie_consent', value);
  };

  useEffect(() => {
    const cookieConsent = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cookie_consent='));

    if (cookieConsent) {
      const val = cookieConsent.split('=')[1];
      localStorage.setItem('alinea_cookie_consent', val);
      if (val === 'accepted') enableTracking();
    } else {
      const localStorageConsent = localStorage.getItem('alinea_cookie_consent');
      if (localStorageConsent) {
        setConsentCookie(localStorageConsent);
        if (localStorageConsent === 'accepted') enableTracking();
      } else {
        if (!isEuropeanUser()) {
          setConsentCookie('accepted');
          enableTracking();
          trackEvent('cookie_consent', 'System', 'Auto-Accepted (Non-EU)');
        } else {
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, []);

  const handleAccept = () => {
    setConsentCookie('accepted');
    setIsVisible(false);
    enableTracking();
    trackEvent('cookie_consent', 'System', 'Accepted');
  };

  const handleDecline = () => {
    setConsentCookie('declined');
    setIsVisible(false);
    trackEvent('cookie_consent', 'System', 'Declined');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[100] rounded-2xl shadow-2xl p-6 border backdrop-blur-xl transition-colors duration-300"
          style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
        >
          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-black/10"
            style={{ color: 'var(--theme-text-secondary)' }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner"
              style={{ background: 'linear-gradient(135deg, var(--theme-secondary), var(--theme-highlight))', color: 'var(--theme-bg)' }}
            >
              <Cookie className="w-6 h-6" />
            </div>
            <div className="pr-2">
              <h3 className="font-bold text-base mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                Alinea Studio Analytics
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--theme-text-secondary)' }}>
                To continuously improve your AI experience, we use anonymous analytics to track feature usage and app performance. We never collect personally identifiable information.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  className="text-sm font-bold py-2.5 px-5 rounded-xl transition-all hover:scale-105 active:scale-95 flex-1 shadow-md"
                  style={{ backgroundColor: 'var(--theme-text-primary)', color: 'var(--theme-bg)' }}
                >
                  Accept All
                </button>
                <button
                  onClick={handleDecline}
                  className="text-sm font-semibold py-2.5 px-5 rounded-xl border transition-all hover:opacity-80 active:scale-95 flex-1"
                  style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
