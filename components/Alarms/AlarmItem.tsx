import React, { useRef } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, Platform
} from 'react-native';
import { format } from 'date-fns';
import { Edit, Trash, Bell } from 'lucide-react-native';
import { Switch } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Alarm } from '@/hooks/useAlarms';
import { useTheme } from '@/context/ThemeContext';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string, value: boolean) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

export function AlarmItem({ alarm, onToggle, onEdit, onDelete }: AlarmItemProps) {
  const { colors } = useTheme();

  const toggleTimeout = useRef<number | null>(null);
  const debounceDelay = 300; // ms

  const timeString = format(new Date(alarm.time), 'h:mm');
  const ampm = format(new Date(alarm.time), 'a');

  const getRepeatText = () => {
    if (!alarm.repeat || alarm.repeat.length === 0) {
      return 'Once';
    }
    if (alarm.repeat.length === 7) {
      return 'Every day';
    }
    if (alarm.repeat.length === 5 &&
      alarm.repeat.includes('Mon') &&
      alarm.repeat.includes('Tue') &&
      alarm.repeat.includes('Wed') &&
      alarm.repeat.includes('Thu') &&
      alarm.repeat.includes('Fri')) {
      return 'Weekdays';
    }
    if (alarm.repeat.length === 2 &&
      alarm.repeat.includes('Sat') &&
      alarm.repeat.includes('Sun')) {
      return 'Weekends';
    }
    return alarm.repeat.join(', ');
  };

  const handleToggle = () => {
    if (toggleTimeout.current !== null) {
      // debounce active, ignore toggle
      return;
    }
    onToggle(alarm.id, !alarm.isActive);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTimeout.current = setTimeout(() => {
      toggleTimeout.current = null;
    }, debounceDelay);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.leftContent}>
        <Bell
          size={18}
          color={alarm.isActive ? colors.primary : colors.textSecondary}
          style={styles.icon}
        />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.timeContainer}>
          <Text style={[styles.time, { color: colors.text }]}>{timeString}</Text>
          <Text style={[styles.ampm, { color: colors.textSecondary }]}>{ampm}</Text>
        </View>

        <View style={styles.detailsContainer}>
          {alarm.label && (
            <Text style={[styles.label, { color: colors.text }]}>{alarm.label}</Text>
          )}
          <Text style={[styles.repeat, { color: colors.textSecondary }]}>
            {getRepeatText()}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(alarm)}
        >
          <Edit size={18} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(alarm.id)}
        >
          <Trash size={18} color={colors.error} />
        </TouchableOpacity>

        <Switch
          value={alarm.isActive}
          onValueChange={handleToggle}
          trackColor={{ false: '#767577', true: colors.primaryLight }}
          thumbColor={alarm.isActive ? colors.primary : '#f4f3f4'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  leftContent: {
    marginRight: 12,
    justifyContent: 'center',
  },
  icon: {
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  time: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  ampm: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 4,
  },
  detailsContainer: {
    flexDirection: 'column',
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 2,
  },
  repeat: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 4,
  },
});
