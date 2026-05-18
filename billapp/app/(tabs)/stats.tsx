import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';
import { useBillStore } from '../../store/useStore';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { getBillingPeriod, formatAmount, getLast6Months } from '../../utils/dateUtils';
import { EmptyState } from '../../components/EmptyState';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function StatsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? Colors.dark : Colors.light;

  const { records, categories, settings } = useBillStore();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const dailyChartScrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

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

  // Pie chart data by category
  const pieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    periodRecords.forEach((r) => {
      catMap[r.categoryId] = (catMap[r.categoryId] ?? 0) + r.amount;
    });
    return Object.entries(catMap)
      .map(([catId, value]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          value,
          color: cat?.color ?? Colors.primary,
          label: cat?.name ?? '其他',
          catId,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [periodRecords, categories]);

  // Daily bar chart data
  const dailyData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    periodRecords.forEach((r) => {
      dayMap[r.date] = (dayMap[r.date] ?? 0) + r.amount;
    });
    const days: { value: number; label: string; frontColor: string }[] = [];
    let cur = periodStart.clone();
    while (cur.isBefore(periodEnd) || cur.isSame(periodEnd, 'day')) {
      const key = cur.format('YYYY-MM-DD');
      days.push({
        value: parseFloat((dayMap[key] ?? 0).toFixed(2)),
        label: cur.format('D'),
        frontColor: Colors.primary,
      });
      cur = cur.add(1, 'day');
    }
    return days;
  }, [periodRecords, periodStart, periodEnd]);

  const dailyBarWidth = dailyData.length <= 15 ? 22 : 14;
  const dailySpacing = dailyData.length <= 15 ? 12 : 8;
  const dailySlotWidth = dailyBarWidth + dailySpacing;
  const dailyChartWidth = Math.max(SCREEN_WIDTH - Spacing.lg * 4, dailyData.length * dailySlotWidth + 56);

  const dailyInitialIndex = useMemo(() => {
    const today = dayjs();
    if (
      (today.isAfter(periodStart) || today.isSame(periodStart, 'day')) &&
      (today.isBefore(periodEnd) || today.isSame(periodEnd, 'day'))
    ) {
      return Math.max(0, today.diff(periodStart, 'day'));
    }

    if (periodRecords.length > 0) {
      const latest = periodRecords
        .map((record) => dayjs(record.date))
        .sort((a, b) => (a.isBefore(b) ? 1 : -1))[0];
      return Math.max(0, latest.diff(periodStart, 'day'));
    }

    return 0;
  }, [periodRecords, periodStart, periodEnd]);

  useEffect(() => {
    const visibleWidth = SCREEN_WIDTH - Spacing.lg * 4;
    const targetX = Math.max(0, dailyInitialIndex * dailySlotWidth - visibleWidth / 2);
    const timer = setTimeout(() => {
      dailyChartScrollRef.current?.scrollTo({ x: targetX, animated: false });
    }, 100);

    return () => clearTimeout(timer);
  }, [dailyInitialIndex, dailySlotWidth, currentDate, settings.billingStartDay]);

  // 6-month comparison
  const monthlyData = useMemo(() => {
    const months = getLast6Months();
    return months.map((m) => {
      const { periodStart: ps, periodEnd: pe } = getBillingPeriod(
        dayjs().year(m.year).month(m.month).date(settings.billingStartDay),
        settings.billingStartDay
      );
      const total = records
        .filter((r) => {
          const d = dayjs(r.date);
          return (
            (d.isAfter(ps) || d.isSame(ps, 'day')) &&
            (d.isBefore(pe) || d.isSame(pe, 'day'))
          );
        })
        .reduce((s, r) => s + r.amount, 0);
      return {
        value: parseFloat(total.toFixed(2)),
        label: m.label,
        frontColor: Colors.primary,
      };
    });
  }, [records, settings.billingStartDay]);

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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: C.text }]}>统计</Text>
      </View>

      {/* Period Nav */}
      <View style={[styles.periodBar, { backgroundColor: C.card }, Shadow.sm]}>
        <TouchableOpacity onPress={prevPeriod}>
          <Text style={[styles.navArrow, { color: Colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.periodLabel, { color: C.text }]}>{periodLabel}</Text>
        <TouchableOpacity onPress={nextPeriod} disabled={isCurrentPeriod}>
          <Text style={[styles.navArrow, { color: isCurrentPeriod ? C.textTertiary : Colors.primary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {periodRecords.length === 0 ? (
        <EmptyState icon="chart-box-outline" title="暂无数据" subtitle="本期没有支出记录" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Total */}
          <View style={[styles.card, { backgroundColor: C.card }, Shadow.sm]}>
            <Text style={[styles.cardTitle, { color: C.textSecondary }]}>本期总支出</Text>
            <Text style={[styles.bigAmount, { color: Colors.primary }]}>
              {formatAmount(totalAmount, settings.currency)}
            </Text>
          </View>

          {/* Pie Chart */}
          <View style={[styles.card, { backgroundColor: C.card }, Shadow.sm]}>
            <Text style={[styles.cardTitle, { color: C.textSecondary }]}>分类占比</Text>
            <View style={styles.pieWrap}>
              <PieChart
                data={pieData}
                donut
                radius={100}
                innerRadius={60}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={[styles.pieCenterText, { color: C.textSecondary }]}>支出</Text>
                    <Text style={[styles.pieCenterAmount, { color: C.text }]}>
                      {settings.currency}{totalAmount.toFixed(0)}
                    </Text>
                  </View>
                )}
              />
            </View>
            <View style={styles.legend}>
              {pieData.map((item) => {
                const pct = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : '0';
                return (
                  <View key={item.catId} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendLabel, { color: C.textSecondary }]}>{item.label}</Text>
                    <Text style={[styles.legendPct, { color: C.text }]}>{pct}%</Text>
                    <Text style={[styles.legendAmt, { color: item.color }]}>
                      {formatAmount(item.value, settings.currency)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Daily Bar Chart */}
          <View style={[styles.card, { backgroundColor: C.card }, Shadow.sm]}>
            <Text style={[styles.cardTitle, { color: C.textSecondary }]}>每日支出趋势</Text>
            <ScrollView
              ref={dailyChartScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartScrollContent}
            >
              <BarChart
                data={dailyData}
                barWidth={dailyBarWidth}
                spacing={dailySpacing}
                roundedTop
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: C.textTertiary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: C.textTertiary, fontSize: 9, width: 22, textAlign: 'center' }}
                noOfSections={4}
                height={140}
                barBorderRadius={4}
                isAnimated
                initialSpacing={16}
                endSpacing={28}
                width={dailyChartWidth}
              />
            </ScrollView>
          </View>

          {/* Monthly Comparison */}
          <View style={[styles.card, { backgroundColor: C.card }, Shadow.sm]}>
            <Text style={[styles.cardTitle, { color: C.textSecondary }]}>近6个月对比</Text>
            <BarChart
              data={monthlyData}
              barWidth={30}
              spacing={14}
              roundedTop
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: C.textTertiary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: C.textTertiary, fontSize: 10, width: 42, textAlign: 'center' }}
              noOfSections={4}
              height={160}
              barBorderRadius={6}
              isAnimated
              initialSpacing={10}
              endSpacing={16}
              width={SCREEN_WIDTH - Spacing.lg * 4}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  periodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  navArrow: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  periodLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  chartScrollContent: {
    paddingRight: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bigAmount: {
    fontSize: 32,
    fontWeight: '900',
  },
  pieWrap: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterText: {
    fontSize: 11,
  },
  pieCenterAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  legend: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
  },
  legendPct: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 44,
    textAlign: 'right',
  },
  legendAmt: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'right',
  },
});
