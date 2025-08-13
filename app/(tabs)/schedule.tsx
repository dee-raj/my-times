import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useTasks } from '@/hooks/useTasks';
import { TaskItem } from '@/components/Schedule/TaskItem';
import { TaskForm } from '@/components/Schedule/TaskForm';
import { BlurView } from 'expo-blur';
import { PlusCircle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import type { Task } from '@/hooks/useTasks';  // Your main Task type (id: string, required)

interface TaskFormValues {
  time: Date;
  date: Date;
  id?: string;                // optional here, because new task may not have id yet
  title: string;
  reminderMinutes: number;    // non-optional for the form (default to 0)
  // add any other Task fields here if needed, matching Task shape but optional id
}

interface TaskFormProps {
  initialValues?: TaskFormValues | null;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

// Simple helper to generate unique IDs (you can replace with your preferred ID generation)
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Convert form values to full Task (guaranteed id)
  const convertToTask = (values: TaskFormValues): Task => ({
    ...values,
    id: values.id ?? generateId(),
    reminderMinutes: values.reminderMinutes ?? 0,
    date: values.date ?? new Date(),
    time: values.time ?? new Date(),
    isCompleted: false
  });

  const handleAddTask = (newTaskValues: TaskFormValues) => {
    const taskToAdd = convertToTask(newTaskValues);
    addTask(taskToAdd);
    setShowForm(false);
    setEditingTask(null);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleUpdateTask = (updatedTaskValues: TaskFormValues) => {
    if (!updatedTaskValues.id) {
      // Should never happen on update, but safeguard
      console.warn('Trying to update a task without id');
      return;
    }
    const taskToUpdate = convertToTask(updatedTaskValues);
    updateTask(taskToUpdate);
    setShowForm(false);
    setEditingTask(null);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(id);
      }
    } else {
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            onPress: () => {
              deleteTask(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Schedule</Text>
        <TouchableOpacity
          onPress={() => {
            setEditingTask(null);
            setShowForm(true);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          style={styles.addButton}
        >
          <PlusCircle size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No scheduled tasks. Tap the + button to add one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={{ ...item, reminderMinutes: item.reminderMinutes ?? 0 }}
              onComplete={completeTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {showForm && (
        <View style={styles.formOverlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 15 : 30} style={styles.blur} tint="dark">
            <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  {editingTask ? 'Edit Task' : 'Add Task'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowForm(false);
                    setEditingTask(null);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TaskForm
                initialValues={
                  editingTask
                    ? { ...editingTask, reminderMinutes: editingTask.reminderMinutes ?? 0 }
                    : undefined
                }
                onSubmit={editingTask ? handleUpdateTask : handleAddTask}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTask(null);
                }}
              />
            </View>
          </BlurView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontFamily: 'Inter-Bold', fontSize: 28 },
  addButton: { padding: 8 },
  list: { padding: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: { fontFamily: 'Inter-Regular', fontSize: 16, textAlign: 'center' },
  formOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blur: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  formContainer: {
    width: '90%',
    height: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: { fontFamily: 'Inter-Bold', fontSize: 20 },
});
