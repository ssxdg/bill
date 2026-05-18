import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  useColorScheme,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryIcon } from './CategoryIcon';
import { ExpenseRecord } from '../utils/storage';
import { Category } from '../constants/categories';
import { Colors, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { formatDate, formatAmount } from '../utils/dateUtils';

interface Props {
  record: ExpenseRecord;
  category: Category | undefined;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecordItem({ record, category, currency, onEdit, onDelete }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? Colors.dark : Colors.light;

  const cat = category ?? {
    icon: 'dots-horizontal-circle',
    color: Colors.primary,
    name: '未知',
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof globalThis !== 'undefined' && 'confirm' in globalThis
        ? (globalThis as any).confirm('确认删除这条支出记录？')
        : true;
      if (confirmed) onDelete();
      return;
    }

    Alert.alert('删除记录', '确认删除这条支出记录？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.card }, Shadow.sm]}>
      <CategoryIcon icon={cat.icon} color={cat.color} size={46} iconSize={22} />
      <View style={styles.info}>
        <Text style={[styles.category, { color: C.text }]}>{cat.name}</Text>
        {record.note ? (
          <Text style={[styles.note, { color: C.textSecondary }]} numberOfLines={1}>
            {record.note}
          </Text>
        ) : null}
        <Text style={[styles.date, { color: C.textTertiary }]}>{formatDate(record.date)}</Text>
      </View>
      <Text style={[styles.amount, { color: cat.color }]}>
        -{formatAmount(record.amount, currency)}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={C.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
  },
  date: {
    fontSize: 11,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
});
