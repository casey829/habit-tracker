// lib/analytics.ts

import { analytics, logEvent, setUserProperties } from '../lib/firebase'; // Make sure firebase.ts is in the same /lib directory

export const trackEvent = (eventName: string, parameters = {}) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
      console.log(`Event tracked: ${eventName}`);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

export const trackScreenView = (screenName: string) => {
  trackEvent('screen_view', { screen_name: screenName });
};

export const setUserProperty = (name: string, value: string) => {
  try {
    if (analytics) {
      setUserProperties(analytics, { [name]: value });
      console.log(`User property set: ${name} = ${value}`);
    }
  } catch (error) {
    console.error('Error setting user property:', error);
  }
};
