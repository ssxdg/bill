import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useBillStore } from '../store/useStore';
import { RecordForm } from '../components/RecordForm';
import { Colors, Spacing } from '../constants/theme';

export default function EditRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? Colors.dark : Colors.light;

  const { records, categories, settings, updateRecord } = useBillStore();
  const record = records.find((r) => r.id === id);

  if (!record) {
    return (
      <View style={[styles.notFound, { backgroundColor: C.background }]}>
        <Text style={{ color: C.textSecondary }}>记录不存在</Text>
      </View>
    );
  }

  const handleSubmit = async (data: {
    amount: number;
    categoryId: string;
    date: string;
    note: string;
  }) => {
    await updateRecord(id, data);
    router.back();
  };

  return (
    <RecordForm
      categories={categories}
      currency={settings.currency}
      initialData={{
        amount: String(record.amount),
        categoryId: record.categoryId,
        date: record.date,
        note: record.note,
      }}
      onSubmit={handleSubmit}
      submitLabel="保存修改"
    />
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
});
