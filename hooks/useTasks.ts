import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a Task type
export interface Task {
  id: string;
  title: string;
  date: Date;
  time: Date;
  isCompleted: boolean;
  notificationId?: string;
  reminderMinutes?: number;
}

// Hook return type
interface UseTasksReturn {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  upcomingTasks: Task[];
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        const parsedTasks: Task[] = JSON.parse(savedTasks);
        const formattedTasks = parsedTasks.map(task => ({
          ...task,
          date: new Date(task.date),
          time: new Date(task.time),
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const scheduleTaskNotification = async (task: Task): Promise<string | null> => {
    if (Platform.OS === 'web' || task.isCompleted) return null;

    try {
      if (task.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(task.notificationId);
      }

      const taskDate = new Date(task.date);
      const taskTime = new Date(task.time);
      const scheduledTime = new Date(taskDate);
      scheduledTime.setHours(taskTime.getHours(), taskTime.getMinutes(), 0, 0);

      const reminderTime = new Date(scheduledTime);
      reminderTime.setMinutes(reminderTime.getMinutes() - (task.reminderMinutes || 60));

      if (reminderTime > new Date()) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Reminder: ${task.title}`,
            body: `Coming up in ${task.reminderMinutes === 60 ? '1 hour' : `${task.reminderMinutes} minutes`}`,
            sound: true,
          },
          trigger: { date: reminderTime } as Notifications.DateTriggerInput,
        });

        return notificationId;
      }

      return null;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  const addTask = async (newTask: Task) => {
    if (Platform.OS !== 'web' && !newTask.isCompleted) {
      const notificationId = await scheduleTaskNotification(newTask);
      newTask.notificationId = notificationId ?? undefined;
    }

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const updateTask = async (updatedTask: Task) => {
    if (Platform.OS !== 'web' && !updatedTask.isCompleted) {
      const notificationId = await scheduleTaskNotification(updatedTask);
      updatedTask.notificationId = notificationId ?? undefined;
    }

    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);

    if (Platform.OS !== 'web' && taskToDelete?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId);
    }

    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const completeTask = async (id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        if (Platform.OS !== 'web' && task.notificationId && !task.isCompleted) {
          Notifications.cancelScheduledNotificationAsync(task.notificationId);
        }

        return {
          ...task,
          isCompleted: !task.isCompleted,
          notificationId: task.isCompleted ? task.notificationId : undefined,
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const upcomingTasks = tasks.filter(task => !task.isCompleted);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    upcomingTasks,
  };
}
