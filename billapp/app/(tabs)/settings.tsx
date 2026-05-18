import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Platform,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBillStore } from '../../store/useStore';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants/theme';

const CURRENCIES = [
  { symbol: '¥', label: '人民币 ¥' },
  { symbol: '$', label: '美元 $' },
  { symbol: '€', label: '欧元 €' },
  { symbol: '£', label: '英镑 £' },
  { symbol: '₩', label: '韩元 ₩' },
];

const BILLING_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? Colors.dark : Colors.light;

  const { settings, records, categories, updateSettings, clearAll } = useBillStore();

  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof globalThis !== 'undefined' && 'confirm' in globalThis
        ? (globalThis as any).confirm('此操作将删除所有支出记录、自定义分类和设置，且无法恢复！确认清空？')
        : true;

      if (confirmed) {
        clearAll().then(() => {
          if (typeof globalThis !== 'undefined' && 'alert' in globalThis) {
            (globalThis as any).alert('所有数据已清空');
          }
        });
      }
      return;
    }

    Alert.alert(
      '清空所有数据',
      '此操作将删除所有支出记录、自定义分类和设置，且无法恢复！',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认清空',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            Alert.alert('完成', '所有数据已清空');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: C.text }]}>设置</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Data overview */}
        <View style={[styles.statsRow, { backgroundColor: Colors.primary }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{records.length}</Text>
            <Text style={styles.statLabel}>支出记录</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{categories.length}</Text>
            <Text style={styles.statLabel}>消费分类</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{settings.billingStartDay}</Text>
            <Text style={styles.statLabel}>账单起始日</Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={[styles.groupLabel, { color: C.textSecondary }]}>偏好设置</Text>
        <View style={[styles.group, { backgroundColor: C.card }, Shadow.sm]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowDayPicker(true)}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + '20' }]}>
              <MaterialCommunityIcons name="calendar-month" size={20} color={Colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: C.text }]}>账单汇总起始日</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
                每月 {settings.billingStartDay} 日起开始计算
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: C.divider }]} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowCurrencyPicker(true)}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.accent + '20' }]}>
              <MaterialCommunityIcons name="currency-usd" size={20} color={Colors.accent} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: C.text }]}>货币符号</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
                当前：{settings.currency}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <Text style={[styles.groupLabel, { color: C.textSecondary }]}>分类管理</Text>
        <View style={[styles.group, { backgroundColor: C.card }, Shadow.sm]}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/categories')}>
            <View style={[styles.rowIcon, { backgroundColor: '#AB47BC20' }]}>
              <MaterialCommunityIcons name="tag-multiple" size={20} color="#AB47BC" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: C.text }]}>管理消费分类</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
                新增、编辑或删除自定义分类
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.groupLabel, { color: C.textSecondary }]}>危险操作</Text>
        <View style={[styles.group, { backgroundColor: C.card }, Shadow.sm]}>
          <TouchableOpacity style={styles.row} onPress={handleClearAll}>
            <View style={[styles.rowIcon, { backgroundColor: Colors.error + '20' }]}>
              <MaterialCommunityIcons name="delete-forever" size={20} color={Colors.error} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: Colors.error }]}>清空所有数据</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
                删除全部记录、分类和设置
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textTertiary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: C.textTertiary }]}>Bill 记账本 v1.0.0</Text>
      </ScrollView>

      {/* Billing Day Picker Modal */}
      <Modal visible={showDayPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: C.surface }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>选择账单起始日</Text>
            <Text style={[styles.modalSub, { color: C.textSecondary }]}>
              每月从选定日期开始计算账单周期
            </Text>
            <ScrollView style={styles.dayList}>
              <View style={styles.dayGrid}>
                {BILLING_DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayItem,
                      { borderColor: C.border },
                      settings.billingStartDay === day && {
                        backgroundColor: Colors.primary,
                        borderColor: Colors.primary,
                      },
                    ]}
                    onPress={() => {
                      updateSettings({ billingStartDay: day });
                      setShowDayPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: settings.billingStartDay === day ? '#fff' : C.text },
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: C.inputBg }]}
              onPress={() => setShowDayPicker(false)}
            >
              <Text style={[styles.closeBtnText, { color: C.textSecondary }]}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Currency Picker Modal */}
      <Modal visible={showCurrencyPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: C.surface }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>选择货币符号</Text>
            <View style={styles.currencyList}>
              {CURRENCIES.map((cur) => (
                <TouchableOpacity
                  key={cur.symbol}
                  style={[
                    styles.currencyItem,
                    { borderColor: C.border },
                    settings.currency === cur.symbol && {
                      backgroundColor: Colors.primary + '15',
                      borderColor: Colors.primary,
                    },
                  ]}
                  onPress={() => {
                    updateSettings({ currency: cur.symbol });
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.currencySymbol,
                      { color: settings.currency === cur.symbol ? Colors.primary : C.text },
                    ]}
                  >
                    {cur.symbol}
                  </Text>
                  <Text style={[styles.currencyLabel, { color: C.textSecondary }]}>
                    {cur.label}
                  </Text>
                  {settings.currency === cur.symbol && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: C.inputBg }]}
              onPress={() => setShowCurrencyPicker(false)}
            >
              <Text style={[styles.closeBtnText, { color: C.textSecondary }]}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  group: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginLeft: 72,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: -Spacing.xs,
  },
  dayList: {
    maxHeight: 240,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  dayItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
  },
  currencyList: {
    gap: Spacing.sm,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '800',
    width: 32,
    textAlign: 'center',
  },
  currencyLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
