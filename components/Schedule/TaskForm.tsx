import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface Task {
  id?: string;
  title: string;
  description?: string;
  date: Date;
  time: Date;
  reminderMinutes: number;
  isCompleted?: boolean;
}

interface TaskFormProps {
  initialValues?: Task;
  onSubmit: (values: Task) => void;
  onCancel: () => void;
}

export function TaskForm({ initialValues, onSubmit, onCancel }: TaskFormProps) {
  const { colors } = useTheme();
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [date, setDate] = useState(initialValues?.date || new Date());
  const [time, setTime] = useState(initialValues?.time || new Date());
  const [reminderMinutes, setReminderMinutes] = useState(initialValues?.reminderMinutes || 60);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateConfirm = (selectedDate: Date) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDatePicker(false);
    setDate(selectedDate || date);
  };

  const handleTimeConfirm = (selectedTime: Date) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowTimePicker(false);
    setTime(selectedTime || time);
  };

  const handleReminderChange = (minutes: number) => {
    setReminderMinutes(minutes);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      return; // Don't submit if title is empty
    }

    const newTask = {
      id: initialValues?.id || Date.now().toString(),
      title,
      description,
      date,
      time,
      reminderMinutes,
      isCompleted: initialValues?.isCompleted || false,
    };
    onSubmit(newTask);
  };

  const dateDisplay = format(new Date(date), 'EEEE, MMMM d, yyyy');
  const timeDisplay = format(new Date(time), 'h:mm a');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Title</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Description (optional)</Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add details about your task"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimePicker}>
          <Text style={[styles.label, { color: colors.text }]}>Date</Text>
          <TouchableOpacity
            style={[
              styles.dateTimeButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateTimeText, { color: colors.text }]}>{dateDisplay}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateTimePicker}>
          <Text style={[styles.label, { color: colors.text }]}>Time</Text>
          <TouchableOpacity
            style={[
              styles.dateTimeButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[styles.dateTimeText, { color: colors.text }]}>{timeDisplay}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.reminderContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Reminder</Text>
        <View style={styles.reminderOptions}>
          {[15, 30, 60, 120].map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.reminderOption,
                reminderMinutes === minutes && { backgroundColor: colors.primaryLight },
                { borderColor: colors.border }
              ]}
              onPress={() => handleReminderChange(minutes)}
            >
              <Text
                style={[
                  styles.reminderText,
                  { color: reminderMinutes === minutes ? colors.primary : colors.text }
                ]}
              >
                {minutes < 60
                  ? `${minutes} min before`
                  : `${minutes / 60} ${minutes === 60 ? 'hour' : 'hours'} before`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            {
              backgroundColor: title.trim() ? colors.primary : colors.textSecondary,
              opacity: title.trim() ? 1 : 0.7,
            }
          ]}
          onPress={handleSubmit}
          disabled={!title.trim()}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            {initialValues ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker - only for native platforms */}
      {Platform.OS !== 'web' && (
        <>
          <DateTimePicker
            isVisible={showDatePicker}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker(false)}
            date={new Date(date)}
          />
          <DateTimePicker
            isVisible={showTimePicker}
            mode="time"
            onConfirm={handleTimeConfirm}
            onCancel={() => setShowTimePicker(false)}
            date={new Date(time)}
          />
        </>
      )}

      {/* Web Pickers */}
      {Platform.OS === 'web' && showDatePicker && (
        <View style={[styles.webPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <input
            type="date"
            value={format(new Date(date), 'yyyy-MM-dd')}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              setDate(newDate);
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
          <View style={styles.webPickerButtons}>
            <TouchableOpacity
              style={[styles.webPickerButton, { borderColor: colors.border }]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.webPickerButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={{ color: '#FFFFFF' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {Platform.OS === 'web' && showTimePicker && (
        <View style={[styles.webPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
          <View style={styles.webPickerButtons}>
            <TouchableOpacity
              style={[styles.webPickerButton, { borderColor: colors.border }]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.webPickerButton, { backgroundColor: colors.primary }]}
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
  inputContainer: {
    marginBottom: 16,
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
  textArea: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 100,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateTimePicker: {
    flex: 1,
    marginRight: 8,
  },
  dateTimeButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateTimeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  reminderContainer: {
    marginBottom: 24,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  reminderOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    margin: 4,
  },
  reminderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
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
  webPicker: {
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
  webPickerButtons: {
    flexDirection: 'row',
    marginTop: 16,
    width: '100%',
    justifyContent: 'space-between',
  },
  webPickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
});