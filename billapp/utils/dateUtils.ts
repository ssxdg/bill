import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('zh-cn');

export function getBillingPeriod(date: dayjs.Dayjs, startDay: number) {
  const day = date.date();
  let periodStart: dayjs.Dayjs;
  let periodEnd: dayjs.Dayjs;

  if (startDay === 1) {
    periodStart = date.startOf('month');
    periodEnd = date.endOf('month');
  } else {
    if (day >= startDay) {
      periodStart = date.date(startDay).startOf('day');
      periodEnd = date.add(1, 'month').date(startDay - 1).endOf('day');
    } else {
      periodStart = date.subtract(1, 'month').date(startDay).startOf('day');
      periodEnd = date.date(startDay - 1).endOf('day');
    }
  }

  return { periodStart, periodEnd };
}

export function getMonthPeriod(year: number, month: number, startDay: number) {
  const base = dayjs().year(year).month(month);
  return getBillingPeriod(base.date(startDay), startDay);
}

export function formatAmount(amount: number, currency: string = '¥'): string {
  return `${currency}${amount.toFixed(2)}`;
}

export function formatDate(dateStr: string): string {
  const d = dayjs(dateStr);
  const today = dayjs();
  if (d.isSame(today, 'day')) return '今天';
  if (d.isSame(today.subtract(1, 'day'), 'day')) return '昨天';
  if (d.year() === today.year()) return d.format('MM月DD日');
  return d.format('YYYY年MM月DD日');
}

export function formatMonthLabel(year: number, month: number): string {
  return dayjs().year(year).month(month).format('YYYY年MM月');
}

export function getDateString(date: Date = new Date()): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function getLast6Months(): { year: number; month: number; label: string }[] {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = dayjs().subtract(i, 'month');
    result.push({
      year: d.year(),
      month: d.month(),
      label: d.format('MM月'),
    });
  }
  return result;
}

export function getDaysInPeriod(
  periodStart: dayjs.Dayjs,
  periodEnd: dayjs.Dayjs
): string[] {
  const days: string[] = [];
  let cur = periodStart.clone();
  while (cur.isBefore(periodEnd) || cur.isSame(periodEnd, 'day')) {
    days.push(cur.format('YYYY-MM-DD'));
    cur = cur.add(1, 'day');
  }
  return days;
}
