import { useCallback } from 'react';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export function useVoiceAnnouncement() {
  // Announce time function
  const announceTimeIfHour = useCallback((date: Date) => {
    // Format hour for announcement
    const hour = date.getHours();
    const hourString = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';

    // Create the announcement text
    const announcement = `It's ${hourString} ${period}`;

    // Use speech synthesis to announce the time
    if (Platform.OS !== 'web') {
      Speech.speak(announcement, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } else {
      // Web fallback using browser's Speech Synthesis API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.lang = 'en-US';
        utterance.pitch = 1.0;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, []);

  return { announceTimeIfHour };
}