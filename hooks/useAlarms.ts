import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Alarm {
  id: string;
  time: Date;
  label?: string;
  isActive: boolean;
  repeat?: string[]; // e.g., ['Mon', 'Wed']
  notificationId?: string[] | null; // changed to array of strings
}

// Configure notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    loadAlarms();
  }, []);

  const saveAlarms = async (updatedAlarms: Alarm[]) => {
    try {
      // Convert Date objects to ISO strings for storage
      const serialized = updatedAlarms.map(alarm => ({
        ...alarm,
        time: alarm.time.toISOString(),
      }));
      await AsyncStorage.setItem('alarms', JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving alarms:', error);
    }
  };

  const loadAlarms = async () => {
    try {
      const savedAlarms = await AsyncStorage.getItem('alarms');
      if (savedAlarms) {
        // Parse and tell TS what shape is expected (time is string here)
        const parsedAlarms = JSON.parse(savedAlarms) as (Omit<Alarm, 'time'> & { time: string })[];

        // Map and convert time string to Date object for each alarm
        const formattedAlarms: Alarm[] = parsedAlarms.map(alarm => ({
          ...alarm,
          time: new Date(alarm.time),
        }));
        setAlarms(formattedAlarms);
      }
    } catch (error) {
      console.error('Error loading alarms:', error);
    }
  };


  const cancelNotifications = async (notificationIds: string[] | null | undefined) => {
    if (!notificationIds) return;
    await Promise.all(
      notificationIds.map(id =>
        Notifications.cancelScheduledNotificationAsync(id).catch(e => {
          console.warn('Failed to cancel notification', id, e);
        })
      )
    );
  };

  const scheduleAlarmNotification = async (alarm: Alarm): Promise<string[] | null> => {
    if (Platform.OS === 'web') return null;

    try {
      // Cancel old notifications if any
      await cancelNotifications(alarm.notificationId);

      if (!alarm.isActive) return null;

      const alarmTime = new Date(alarm.time);
      const now = new Date();

      // Helper for formatted time string
      const formatTime = () => {
        const hour12 = alarmTime.getHours() % 12 || 12;
        const minutes = alarmTime.getMinutes().toString().padStart(2, '0');
        const ampm = alarmTime.getHours() >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      };

      if (alarm.repeat && alarm.repeat.length > 0) {
        const notificationIds: string[] = [];
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (const day of alarm.repeat) {
          const dayIndex = weekdays.indexOf(day);
          if (dayIndex === -1) continue;

          const nextDate = new Date();
          const currentDay = nextDate.getDay();
          let daysUntilNext = (dayIndex - currentDay + 7) % 7;

          // If today and time already passed, schedule for next week
          if (daysUntilNext === 0) {
            nextDate.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);
            if (nextDate <= now) {
              daysUntilNext = 7;
            }
          }

          nextDate.setDate(nextDate.getDate() + daysUntilNext);
          nextDate.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: alarm.label || 'Alarm',
              body: `It's ${formatTime()}`,
              sound: true,
            },
            trigger: {
              repeats: true,
              weekday: dayIndex + 1,
              hour: alarmTime.getHours(),
              minute: alarmTime.getMinutes(),
            } as Notifications.CalendarTriggerInput,
          });

          notificationIds.push(notificationId);
        }

        return notificationIds;
      } else {
        if (alarmTime <= now) {
          alarmTime.setDate(alarmTime.getDate() + 1);
        }

        const secondsUntilAlarm = Math.floor((alarmTime.getTime() - now.getTime()) / 1000);

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: alarm.label || 'Alarm',
            body: `It's ${formatTime()}`,
            sound: true,
          },
          trigger: {
            seconds: secondsUntilAlarm,
            repeats: false,
          } as Notifications.NotificationTriggerInput,
        });

        return [notificationId];
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  const addAlarm = async (newAlarm: Alarm) => {
    if (Platform.OS !== 'web' && newAlarm.isActive) {
      const notificationIds = await scheduleAlarmNotification(newAlarm);
      newAlarm.notificationId = notificationIds;
    }

    const updatedAlarms = [...alarms, newAlarm];
    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
  };

  const updateAlarm = async (updatedAlarm: Alarm) => {
    if (Platform.OS !== 'web' && updatedAlarm.isActive) {
      const notificationIds = await scheduleAlarmNotification(updatedAlarm);
      updatedAlarm.notificationId = notificationIds;
    } else if (Platform.OS !== 'web' && updatedAlarm.notificationId) {
      await cancelNotifications(updatedAlarm.notificationId);
      updatedAlarm.notificationId = null;
    }

    const updatedAlarms = alarms.map(alarm =>
      alarm.id === updatedAlarm.id ? updatedAlarm : alarm
    );

    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
  };

  const deleteAlarm = async (id: string) => {
    const alarmToDelete = alarms.find(alarm => alarm.id === id);

    if (Platform.OS !== 'web' && alarmToDelete?.notificationId) {
      await cancelNotifications(alarmToDelete.notificationId);
    }

    const updatedAlarms = alarms.filter(alarm => alarm.id !== id);
    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
  };

  const toggleAlarm = async (id: string, isActive: boolean) => {
    const updatedAlarms = await Promise.all(
      alarms.map(async alarm => {
        if (alarm.id === id) {
          const updatedAlarm = { ...alarm, isActive };

          if (Platform.OS !== 'web') {
            if (isActive) {
              const notificationIds = await scheduleAlarmNotification(updatedAlarm);
              updatedAlarm.notificationId = notificationIds;
            } else if (alarm.notificationId) {
              await cancelNotifications(alarm.notificationId);
              updatedAlarm.notificationId = null;
            }
          }

          return updatedAlarm;
        }
        return alarm;
      })
    );

    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
  };

  const activeAlarms = alarms.filter(alarm => alarm.isActive);

  return {
    alarms,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    activeAlarms,
  };
}
