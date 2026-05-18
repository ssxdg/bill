import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  useColorScheme,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryIcon } from './CategoryIcon';
import { Category } from '../constants/categories';
import { Colors, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { getDateString, formatDate } from '../utils/dateUtils';

interface FormData {
  amount: string;
  categoryId: string;
  date: string;
  note: string;
}

interface Props {
  categories: Category[];
  currency: string;
  initialData?: FormData;
  onSubmit: (data: { amount: number; categoryId: string; date: string; note: string }) => void;
  submitLabel?: string;
}

export function RecordForm({ categories, currency, initialData, onSubmit, submitLabel = '保存' }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? Colors.dark : Colors.light;

  const [amount, setAmount] = useState(initialData?.amount ?? '');
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId ?? (categories[0]?.id ?? '')
  );
  const [date, setDate] = useState(initialData?.date ?? getDateString());
  const [note, setNote] = useState(initialData?.note ?? '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amountError, setAmountError] = useState('');

  const selectedCat = categories.find((c) => c.id === categoryId);

  const handleSubmit = () => {
    Keyboard.dismiss();
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setAmountError('请输入有效金额');
      return;
    }
    if (!categoryId) {
      return;
    }
    setAmountError('');
    onSubmit({ amount: num, categoryId, date, note: note.trim() });
  };

  const handleDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) setDate(getDateString(selected));
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: C.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Amount */}
      <View style={[styles.amountCard, { backgroundColor: Colors.primary }]}>
        <Text style={styles.amountLabel}>支出金额</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>{currency}</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={(v) => { setAmount(v); setAmountError(''); }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.5)"
            returnKeyType="done"
          />
        </View>
        {amountError ? (
          <Text style={styles.errorText}>{amountError}</Text>
        ) : null}
      </View>

      {/* Category */}
      <View style={[styles.section, { backgroundColor: C.card }, Shadow.sm]}>
        <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>选择分类</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                categoryId === cat.id && {
                  backgroundColor: cat.color + '18',
                  borderColor: cat.color,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setCategoryId(cat.id)}
            >
              <CategoryIcon icon={cat.icon} color={cat.color} size={40} iconSize={20} />
              <Text
                style={[
                  styles.categoryName,
                  { color: categoryId === cat.id ? cat.color : C.textSecondary },
                ]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date */}
      <TouchableOpacity
        style={[styles.row, { backgroundColor: C.card }, Shadow.sm]}
        onPress={() => setShowDatePicker(true)}
      >
        <MaterialCommunityIcons name="calendar" size={22} color={Colors.primary} />
        <View style={styles.rowContent}>
          <Text style={[styles.rowLabel, { color: C.textSecondary }]}>日期</Text>
          <Text style={[styles.rowValue, { color: C.text }]}>{formatDate(date)}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={C.textTertiary} />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(date)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* Note */}
      <View style={[styles.row, { backgroundColor: C.card }, Shadow.sm]}>
        <MaterialCommunityIcons name="pencil-outline" size={22} color={Colors.primary} />
        <TextInput
          style={[styles.noteInput, { color: C.text }]}
          value={note}
          onChangeText={setNote}
          placeholder="备注（可选）"
          placeholderTextColor={C.textTertiary}
          maxLength={50}
          returnKeyType="done"
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: Colors.primary }]}
        onPress={handleSubmit}
        activeOpacity={0.85}
      >
        <Text style={styles.submitText}>{submitLabel}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  amountCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadow.lg,
  },
  amountLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: '#fff',
    fontSize: 42,
    fontWeight: '800',
    padding: 0,
  },
  errorText: {
    color: '#FFCDD2',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  noteInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  submitBtn: {
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadow.md,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
