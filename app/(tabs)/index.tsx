import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { DigitalClock } from '@/components/Clock/DigitalClock';
import { AnalogClock } from '@/components/Clock/AnalogClock';
import { useVoiceAnnouncement } from '@/hooks/useVoiceAnnouncement';
import { UpcomingEvents } from '@/components/Schedule/UpcomingEvents';
import { useTasks } from '@/hooks/useTasks';
import { useAlarms } from '@/hooks/useAlarms';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { announceTimeIfHour } = useVoiceAnnouncement();
  const { upcomingTasks } = useTasks();
  const { activeAlarms } = useAlarms();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check if it's exactly on the hour for announcement
      if (now.getMinutes() === 0 && now.getSeconds() === 0) {
        announceTimeIfHour(now);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [announceTimeIfHour]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Time Manager</Text>
      </View>

      <View style={styles.clockContainer}>
        <AnalogClock size={Platform.OS === 'web' ? 220 : 160} />
        <DigitalClock time={currentTime} />
      </View>

      <View style={styles.contentContainer}>
        <UpcomingEvents events={upcomingTasks} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 8,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});