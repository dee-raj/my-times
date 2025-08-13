import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, Switch } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface AlarmFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AlarmForm({ initialValues, onSubmit, onCancel }: AlarmFormProps) {
  const { colors } = useTheme();
  const [time, setTime] = useState(initialValues?.time || new Date());
  const [label, setLabel] = useState(initialValues?.label || '');
  const [repeat, setRepeat] = useState(initialValues?.repeat || []);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);

  const handleTimeConfirm = (selectedTime: Date) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowTimePicker(false);
    setTime(selectedTime || time);
  };


  const toggleDay = (day: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setRepeat((prev: string[]) => {
      let updated: string[];
      if (prev.includes(day)) {
        updated = prev.filter(d => d !== day);
      } else {
        updated = [...prev, day];
      }
      // Sort according to daysOfWeek order
      return daysOfWeek.filter(d => updated.includes(d));
    });
  };

  const handleSubmit = () => {
    if (!time || isNaN(time.getTime())) {
      alert('Please select a valid time for the alarm.');
      return;
    }
    const newAlarm = {
      id: initialValues?.id || Date.now().toString(),
      time,
      label,
      repeat,
      isActive,
    };
    onSubmit(newAlarm);
  };

  const timeDisplay = format(new Date(time), 'h:mm a');

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity
        onPress={() => setShowTimePicker(true)}
        style={[styles.timeContainer, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}
      >
        <Text style={[styles.timeText, { color: colors.primary }]}>{timeDisplay}</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Label</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={label}
          onChangeText={setLabel}
          placeholder="Alarm label (optional)"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.repeatContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Repeat</Text>
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                {
                  backgroundColor: repeat.includes(day) ? colors.primaryLight : colors.background,
                  borderColor: repeat.includes(day) ? colors.primary : colors.border,
                },
              ]}
              onPress={() => toggleDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: repeat.includes(day) ? colors.primary : colors.text },
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Toggle */}
      <View style={styles.activeToggleContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Active</Text>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ false: '#767577', true: colors.primaryLight }}
          thumbColor={isActive ? colors.primary : '#f4f3f4'}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!label && !repeat.length}
          style={[styles.button, styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            {initialValues ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Picker - only for native platforms */}
      {Platform.OS !== 'web' && (
        <DateTimePicker
          isVisible={showTimePicker}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePicker(false)}
          date={new Date(time)}
        />
      )}

      {/* Time Picker for Web */}
      {Platform.OS === 'web' && showTimePicker && (
        <View style={[styles.webTimePicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <input
            type="time"
            value={format(new Date(time), 'HH:mm')}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':');
              const newTime = new Date();
              newTime.setHours(parseInt(hours, 10));
              newTime.setMinutes(parseInt(minutes, 10));
              setTime(newTime);
            }}
            style={{
              fontSize: 18,
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              backgroundColor: colors.background,
            }}
          />
          <View style={styles.webTimePickerButtons}>
            <TouchableOpacity
              accessible
              accessibilityLabel="Cancel Time Picker"
              style={[styles.webTimeButton, { borderColor: colors.border }]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.webTimeButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={{ color: '#FFFFFF' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  timeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  repeatContainer: {
    marginBottom: 24,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    margin: 4,
  },
  dayText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  activeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  submitButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  webTimePicker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
  },
  webTimePickerButtons: {
    flexDirection: 'row',
    marginTop: 16,
    width: '100%',
    justifyContent: 'space-between',
  },
  webTimeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
});