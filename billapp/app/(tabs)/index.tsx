import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useBillStore } from '../../store/useStore';
import { RecordItem } from '../../components/RecordItem';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { getBillingPeriod, formatAmount } from '../../utils/dateUtils';
import { ExpenseRecord } from '../../utils/storage';

export default function BillListScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? Colors.dark : Colors.light;

  const { records, categories, settings, deleteRecord } = useBillStore();
  const [currentDate, setCurrentDate] = useState(dayjs());

  const { periodStart, periodEnd } = useMemo(
    () => getBillingPeriod(currentDate, settings.billingStartDay),
    [currentDate, settings.billingStartDay]
  );

  const periodRecords = useMemo(
    () =>
      records.filter((r) => {
        const d = dayjs(r.date);
        return (
          (d.isAfter(periodStart) || d.isSame(periodStart, 'day')) &&
          (d.isBefore(periodEnd) || d.isSame(periodEnd, 'day'))
        );
      }),
    [records, periodStart, periodEnd]
  );

  const totalAmount = useMemo(
    () => periodRecords.reduce((sum, r) => sum + r.amount, 0),
    [periodRecords]
  );

  const groupedRecords = useMemo(() => {
    const groups: { [date: string]: ExpenseRecord[] } = {};
    periodRecords.forEach((r) => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => (a.id < b.id ? 1 : -1)),
        total: items.reduce((s, i) => s + i.amount, 0),
      }));
  }, [periodRecords]);

  const prevPeriod = () => setCurrentDate((d) => d.subtract(1, 'month'));
  const nextPeriod = () => {
    const next = currentDate.add(1, 'month');
    if (next.isAfter(dayjs(), 'month')) return;
    setCurrentDate(next);
  };

  const isCurrentPeriod = currentDate.isSame(dayjs(), 'month');

  const periodLabel =
    settings.billingStartDay === 1
      ? currentDate.format('YYYY年MM月')
      : `${periodStart.format('MM/DD')} ~ ${periodEnd.format('MM/DD')}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: C.text }]}>记账本</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.push('/add-record')}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={[styles.summaryCard, Shadow.lg]}>
        <View style={styles.periodNav}>
          <TouchableOpacity onPress={prevPeriod} style={styles.navBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Text style={styles.periodLabel}>{periodLabel}</Text>
          <TouchableOpacity
            onPress={nextPeriod}
            style={[styles.navBtn, isCurrentPeriod && styles.navBtnDisabled]}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={isCurrentPeriod ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.totalLabel}>本期总支出</Text>
        <Text style={styles.totalAmount}>{formatAmount(totalAmount, settings.currency)}</Text>
        <Text style={styles.recordCount}>{periodRecords.length} 笔记录</Text>
      </View>

      {/* List */}
      {groupedRecords.length === 0 ? (
        <EmptyState
          icon="receipt-text-outline"
          title="暂无记录"
          subtitle="点击右上角 + 添加第一笔支出"
        />
      ) : (
        <FlatList
          data={groupedRecords}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group }) => (
            <View style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Text style={[styles.dateText, { color: C.textSecondary }]}>
                  {group.date === dayjs().format('YYYY-MM-DD')
                    ? '今天'
                    : group.date === dayjs().subtract(1, 'day').format('YYYY-MM-DD')
                    ? '昨天'
                    : dayjs(group.date).format('MM月DD日 dddd')}
                </Text>
                <Text style={[styles.dateDayTotal, { color: C.textTertiary }]}>
                  -{formatAmount(group.total, settings.currency)}
                </Text>
              </View>
              {group.items.map((record) => {
                const cat = categories.find((c) => c.id === record.categoryId);
                return (
                  <RecordItem
                    key={record.id}
                    record={record}
                    category={cat}
                    currency={settings.currency}
                    onEdit={() =>
                      router.push({ pathname: '/edit-record', params: { id: record.id } })
                    }
                    onDelete={() => deleteRecord(record.id)}
                  />
                );
              })}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
      paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  navBtn: {
    padding: 4,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  periodLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 120,
    textAlign: 'center',
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  totalAmount: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  recordCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  dateGroup: {
    marginBottom: Spacing.md,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingHorizontal: 2,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateDayTotal: {
    fontSize: 12,
    fontWeight: '500',
  },
});
