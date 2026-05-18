export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isPreset: boolean;
}

export const PRESET_CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮', icon: 'food-fork-drink', color: '#FF7043', isPreset: true },
  { id: 'transport', name: '交通', icon: 'bus', color: '#42A5F5', isPreset: true },
  { id: 'shopping', name: '购物', icon: 'shopping', color: '#AB47BC', isPreset: true },
  { id: 'home', name: '居家', icon: 'home', color: '#26A69A', isPreset: true },
  { id: 'entertainment', name: '娱乐', icon: 'gamepad-variant', color: '#EC407A', isPreset: true },
  { id: 'medical', name: '医疗', icon: 'hospital-box', color: '#EF5350', isPreset: true },
  { id: 'education', name: '教育', icon: 'school', color: '#5C6BC0', isPreset: true },
  { id: 'other', name: '其他', icon: 'dots-horizontal-circle', color: '#78909C', isPreset: true },
];
