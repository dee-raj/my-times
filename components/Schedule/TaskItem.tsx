import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { format } from 'date-fns';
import { Edit, Trash, Check, Calendar, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface TaskProps {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: Date;
  isCompleted: boolean;
  reminderMinutes: number;
}

interface TaskItemProps {
  task: TaskProps;
  onComplete: (id: string) => void;
  onEdit: (task: TaskProps) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onComplete, onEdit, onDelete }: TaskItemProps) {
  const { colors } = useTheme();

  const dateStr = format(new Date(task.date), 'EEE, MMM d');
  const timeStr = format(new Date(task.time), 'h:mm a');

  const handleComplete = () => {
    onComplete(task.id);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: task.isCompleted ? 0.7 : 1,
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.checkButton,
          {
            backgroundColor: task.isCompleted ? colors.primary : colors.background,
            borderColor: task.isCompleted ? colors.primary : colors.border,
          }
        ]}
        onPress={handleComplete}
      >
        {task.isCompleted && <Check size={16} color="#FFFFFF" />}
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              textDecorationLine: task.isCompleted ? 'line-through' : 'none',
            }
          ]}
        >
          {task.title}
        </Text>

        {task.description && (
          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              }
            ]}
          >
            {task.description}
          </Text>
        )}

        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Calendar size={14} color={colors.textSecondary} style={styles.metadataIcon} />
            <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
              {dateStr}
            </Text>
          </View>

          <View style={styles.metadataItem}>
            <Clock size={14} color={colors.textSecondary} style={styles.metadataIcon} />
            <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
              {timeStr}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(task)}
          disabled={task.isCompleted}
        >
          <Edit
            size={18}
            color={task.isCompleted ? colors.textSecondary : colors.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(task.id)}
        >
          <Trash size={18} color={colors.error} />
        </TouchableOpacity>
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
    alignItems: 'flex-start',
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 3,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  metadataContainer: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metadataIcon: {
    marginRight: 4,
  },
  metadataText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});