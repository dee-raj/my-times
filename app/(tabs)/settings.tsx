import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { Palette, Volume2, Moon, Bell, Clock, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(60); // Default: 1 hour

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleReminderChange = (minutes: number) => {
    setReminderMinutes(minutes);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Palette size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          </View>

          <View style={[styles.settingItem, { borderColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Toggle between light and dark theme
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Volume2 size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Audio</Text>
          </View>

          <View style={[styles.settingItem, { borderColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Voice Announcements</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Announce time at the top of each hour
              </Text>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={toggleVoice}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={voiceEnabled ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          </View>

          <Text style={[styles.settingLabel, { color: colors.text, marginBottom: 8, paddingHorizontal: 16 }]}>
            Reminder time before events
          </Text>

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
                    ? `${minutes} min`
                    : `${minutes / 60} ${minutes === 60 ? 'hour' : 'hours'}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          </View>

          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 8,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
  },
  reminderOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  reminderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});