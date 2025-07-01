import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Alarm {
  id: string;
  time: Date ;
  label?: string;
  isActive: boolean;
  repeat?: string[]; // e.g., ['Mon', 'Wed']
  notificationId?: string | null;
}

// Configure notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,   // add this
      shouldShowList: true,     // add this
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
      await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
    } catch (error) {
      console.error('Error saving alarms:', error);
    }
  };

  const loadAlarms = async () => {
    try {
      const savedAlarms = await AsyncStorage.getItem('alarms');
      if (savedAlarms) {
        const parsedAlarms: Alarm[] = JSON.parse(savedAlarms);
        const formattedAlarms = parsedAlarms.map(alarm => ({
          ...alarm,
          time: new Date(alarm.time),
        }));
        setAlarms(formattedAlarms);
      }
    } catch (error) {
      console.error('Error loading alarms:', error);
    }
  };

  const scheduleAlarmNotification = async (alarm: Alarm): Promise<string | null> => {
    if (Platform.OS === 'web') return null;

    try {
      if (alarm.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(alarm.notificationId);
      }

      if (!alarm.isActive) return null;

      const alarmTime = new Date(alarm.time);
      const now = new Date();

      if (alarm.repeat && alarm.repeat.length > 0) {
        for (const day of alarm.repeat) {
          const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day);
          if (dayIndex !== -1) {
            const nextDate = new Date();
            const currentDay = nextDate.getDay();
            const daysUntilNext = (dayIndex - currentDay + 7) % 7;

            nextDate.setDate(nextDate.getDate() + daysUntilNext);
            nextDate.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);

            if (nextDate <= now) {
              nextDate.setDate(nextDate.getDate() + 7);
            }

            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: alarm.label || 'Alarm',
                body: `It's ${alarmTime.getHours() % 12 || 12}:${alarmTime.getMinutes().toString().padStart(2, '0')} ${alarmTime.getHours() >= 12 ? 'PM' : 'AM'}`,
                sound: true,
              },
              trigger: {
                type: 'calendar',
                weekday: dayIndex + 1,
                hour: nextDate.getHours(),
                minute: nextDate.getMinutes(),
                repeats: true,
              } as Notifications.CalendarTriggerInput,
            });


            return notificationId;
          }
        }
      } else {
        if (alarmTime <= now) {
          alarmTime.setDate(alarmTime.getDate() + 1);
        }

        const secondsUntilAlarm = Math.floor((alarmTime.getTime() - now.getTime()) / 1000);

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: alarm.label || 'Alarm',
            body: `It's ${alarmTime.getHours() % 12 || 12}:${alarmTime.getMinutes().toString().padStart(2, '0')} ${alarmTime.getHours() >= 12 ? 'PM' : 'AM'}`,
            sound: true,
          },
          trigger: {
            seconds: secondsUntilAlarm,
          } as Notifications.CalendarTriggerInput,
        });

        return notificationId;
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }

    return null;
  };

  const addAlarm = async (newAlarm: Alarm) => {
    if (Platform.OS !== 'web' && newAlarm.isActive) {
      const notificationId = await scheduleAlarmNotification(newAlarm);
      newAlarm.notificationId = notificationId;
    }

    const updatedAlarms = [...alarms, newAlarm];
    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
  };

  const updateAlarm = async (updatedAlarm: Alarm) => {
    if (Platform.OS !== 'web' && updatedAlarm.isActive) {
      const notificationId = await scheduleAlarmNotification(updatedAlarm);
      updatedAlarm.notificationId = notificationId;
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
      await Notifications.cancelScheduledNotificationAsync(alarmToDelete.notificationId);
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
              const notificationId = await scheduleAlarmNotification(updatedAlarm);
              updatedAlarm.notificationId = notificationId;
            } else if (alarm.notificationId) {
              await Notifications.cancelScheduledNotificationAsync(alarm.notificationId);
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
