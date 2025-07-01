import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { format, isToday, isTomorrow } from 'date-fns';
import { Calendar, Clock } from 'lucide-react-native';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: Date;
  isCompleted?: boolean; // ← Add this line
}

interface UpcomingEventsProps {
  events: Event[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const { colors } = useTheme();

  const sortedEvents = [...events]
    .filter(event => !event.isCompleted)
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const timeA = new Date(a.time);
      const timeB = new Date(b.time);

      dateA.setHours(timeA.getHours(), timeA.getMinutes());
      dateB.setHours(timeB.getHours(), timeB.getMinutes());

      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5); // Take the next 5 events

  const getFormattedDate = (date: Date) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) {
      return 'Today';
    } else if (isTomorrow(eventDate)) {
      return 'Tomorrow';
    } else {
      return format(eventDate, 'EEE, MMM d');
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No upcoming events. Add tasks in the Schedule tab.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Upcoming Events</Text>

      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.eventItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.eventHeader}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{item.title}</Text>
            </View>

            <View style={styles.eventDetails}>
              <View style={styles.eventDetail}>
                <Calendar size={14} color={colors.textSecondary} style={styles.icon} />
                <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                  {getFormattedDate(item.date)}
                </Text>
              </View>

              <View style={styles.eventDetail}>
                <Clock size={14} color={colors.textSecondary} style={styles.icon} />
                <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                  {format(new Date(item.time), 'h:mm a')}
                </Text>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 16,
  },
  eventItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    marginRight: 4,
  },
  eventDetailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});