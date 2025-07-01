import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { format } from 'date-fns';

interface DigitalClockProps {
  time: Date;
}

export function DigitalClock({ time }: DigitalClockProps) {
  const { colors } = useTheme();

  const timeString = format(time, 'h:mm');
  const ampm = format(time, 'a');
  const dateString = format(time, 'EEEE, MMMM d, yyyy');

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={[styles.time, { color: colors.text }]}>{timeString}</Text>
        <Text style={[styles.ampm, { color: colors.primary }]}>{ampm}</Text>
      </View>
      <Text style={[styles.date, { color: colors.textSecondary }]}>
        {dateString}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  time: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
  },
  ampm: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    marginBottom: 12,
    marginLeft: 4,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 4,
  },
});