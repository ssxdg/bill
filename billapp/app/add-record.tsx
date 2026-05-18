import React from 'react';
import { router } from 'expo-router';
import { useBillStore } from '../store/useStore';
import { RecordForm } from '../components/RecordForm';

export default function AddRecordScreen() {
  const { categories, settings, addRecord } = useBillStore();

  const handleSubmit = async (data: {
    amount: number;
    categoryId: string;
    date: string;
    note: string;
  }) => {
    await addRecord(data);
    router.back();
  };

  return (
    <RecordForm
      categories={categories}
      currency={settings.currency}
      onSubmit={handleSubmit}
      submitLabel="添加记录"
    />
  );
}
