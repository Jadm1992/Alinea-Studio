import posthog from 'posthog-js';

// Initialize PostHog and enable GA scripts
export const enableTracking = () => {
  // 1. Initialize PostHog
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY || 'YOUR_POSTHOG_KEY_HERE';
  if (posthogKey && posthogKey !== 'YOUR_POSTHOG_KEY_HERE') {
    posthog.init(posthogKey, {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
    });
  }

  // 2. Enable Google Analytics scripts
  if (typeof document !== 'undefined') {
    const scripts = document.querySelectorAll('script[data-cookiecategory="analytics"]');
    scripts.forEach((script) => {
      const newScript = document.createElement('script');
      Array.from(script.attributes).forEach(attr => {
        if (attr.name !== 'type' && attr.name !== 'data-cookiecategory') {
          newScript.setAttribute(attr.name, attr.value);
        }
      });
      newScript.text = script.innerHTML;
      script.parentNode?.replaceChild(newScript, script);
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  // Track in Google Analytics if initialized
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Track in PostHog
  posthog.capture(action, {
    category: category,
    label: label,
    value: value
  });
};
