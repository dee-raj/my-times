import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { PlusCircle, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { useAlarms } from '@/hooks/useAlarms';
import { AlarmItem } from '@/components/Alarms/AlarmItem';
import { AlarmForm } from '@/components/Alarms/AlarmForm';

import type { Alarm } from '@/hooks/useAlarms'; // Assuming you have this type defined

export default function AlarmsScreen() {
  const { colors } = useTheme();
  const { alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm } = useAlarms();

  // editingAlarm typed as Alarm or null
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddAlarm = useCallback((newAlarm: Alarm) => {
    addAlarm(newAlarm);
    setShowForm(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [addAlarm]);

  const handleEditAlarm = useCallback((alarm: Alarm) => {
    setEditingAlarm(alarm);
    setShowForm(true);
  }, []);

  const handleUpdateAlarm = useCallback((updatedAlarm: Alarm) => {
    updateAlarm(updatedAlarm);
    setShowForm(false);
    setEditingAlarm(null);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [updateAlarm]);

  const handleDeleteAlarm = useCallback((id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this alarm?')) {
        deleteAlarm(id);
      }
    } else {
      Alert.alert(
        'Delete Alarm',
        'Are you sure you want to delete this alarm?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            onPress: () => {
              deleteAlarm(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            },
            style: 'destructive',
          },
        ]
      );
    }
  }, [deleteAlarm]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Alarms</Text>
        <TouchableOpacity
          onPress={() => {
            setEditingAlarm(null);
            setShowForm(true);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          style={styles.addButton}
          accessibilityLabel="Add new alarm"
        >
          <PlusCircle size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No alarms set. Tap the + button to add one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmItem
              alarm={item}
              onToggle={toggleAlarm}
              onEdit={handleEditAlarm}
              onDelete={handleDeleteAlarm}
            />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {showForm && (
        <View style={styles.formOverlay} pointerEvents="box-none">
          <BlurView intensity={Platform.OS === 'ios' ? 15 : 30} style={styles.blur} tint="dark">
            <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  {editingAlarm ? 'Edit Alarm' : 'Add Alarm'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowForm(false);
                    setEditingAlarm(null);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  accessibilityLabel="Close alarm form"
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <AlarmForm
                initialValues={editingAlarm ?? undefined}
                onSubmit={editingAlarm ? handleUpdateAlarm : handleAddAlarm}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAlarm(null);
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
  },
  addButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  formOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
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
  formTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
});
