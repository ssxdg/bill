import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  useColorScheme,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBillStore } from '../store/useStore';
import { CategoryIcon } from '../components/CategoryIcon';
import { Colors, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { Category } from '../constants/categories';

const ICON_OPTIONS = [
  'food-fork-drink', 'bus', 'shopping', 'home', 'gamepad-variant',
  'hospital-box', 'school', 'dots-horizontal-circle', 'airplane',
  'music', 'book', 'gift', 'coffee', 'car', 'dumbbell',
  'baby-face', 'cat', 'briefcase', 'cash', 'heart',
];

const COLOR_OPTIONS = [
  '#FF7043', '#42A5F5', '#AB47BC', '#26A69A', '#EC407A',
  '#EF5350', '#5C6BC0', '#78909C', '#FFA726', '#66BB6A',
  '#26C6DA', '#8D6E63', '#BDBDBD', '#FF7043', '#29B6F6',
];

export default function CategoriesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? Colors.dark : Colors.light;

  const { categories, addCategory, updateCategory, deleteCategory, resetCategories } = useBillStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  const openAdd = () => {
    setEditTarget(null);
    setName('');
    setIcon(ICON_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入分类名称');
      return;
    }
    if (editTarget) {
      await updateCategory(editTarget.id, { name: name.trim(), icon, color });
    } else {
      await addCategory({ name: name.trim(), icon, color });
    }
    setModalVisible(false);
  };

  const handleDelete = (cat: Category) => {
    if (cat.isPreset) {
      Alert.alert('提示', '预设分类不可删除');
      return;
    }
    Alert.alert('删除分类', `确认删除「${cat.name}」分类？已记录的支出不会被删除。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteCategory(cat.id) },
    ]);
  };

  const handleReset = () => {
    Alert.alert('恢复默认', '将恢复所有预设分类，自定义分类将被删除。', [
      { text: '取消', style: 'cancel' },
      { text: '确认', style: 'destructive', onPress: resetCategories },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.topActions}>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: Colors.primary }]} onPress={openAdd}>
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.addBtnText}>新增分类</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.resetBtn, { borderColor: C.border }]} onPress={handleReset}>
          <Text style={[styles.resetBtnText, { color: C.textSecondary }]}>恢复默认</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.catRow, { backgroundColor: C.card }, Shadow.sm]}>
            <CategoryIcon icon={item.icon} color={item.color} size={44} iconSize={22} />
            <Text style={[styles.catName, { color: C.text }]}>{item.name}</Text>
            {item.isPreset && (
              <Text style={[styles.presetBadge, { color: C.textTertiary, borderColor: C.border }]}>
                预设
              </Text>
            )}
            <View style={styles.catActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color={C.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => handleDelete(item)}
                disabled={item.isPreset}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color={item.isPreset ? C.border : Colors.error}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: C.surface }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>
              {editTarget ? '编辑分类' : '新增分类'}
            </Text>

            {/* Preview */}
            <View style={styles.preview}>
              <CategoryIcon icon={icon} color={color} size={56} iconSize={28} />
              <Text style={[styles.previewName, { color: C.text }]}>{name || '分类名称'}</Text>
            </View>

            {/* Name Input */}
            <TextInput
              style={[styles.nameInput, { backgroundColor: C.inputBg, color: C.text }]}
              value={name}
              onChangeText={setName}
              placeholder="分类名称"
              placeholderTextColor={C.textTertiary}
              maxLength={8}
            />

            {/* Icon Selection */}
            <Text style={[styles.pickLabel, { color: C.textSecondary }]}>选择图标</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow}>
              {ICON_OPTIONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconOption,
                    { borderColor: ic === icon ? color : C.border },
                    ic === icon && { backgroundColor: color + '18' },
                  ]}
                  onPress={() => setIcon(ic)}
                >
                  <MaterialCommunityIcons name={ic as any} size={22} color={ic === icon ? color : C.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Color Selection */}
            <Text style={[styles.pickLabel, { color: C.textSecondary }]}>选择颜色</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
              {COLOR_OPTIONS.map((cl) => (
                <TouchableOpacity
                  key={cl}
                  style={[
                    styles.colorOption,
                    { backgroundColor: cl },
                    cl === color && styles.colorSelected,
                  ]}
                  onPress={() => setColor(cl)}
                >
                  {cl === color && (
                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: C.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelText, { color: C.textSecondary }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: Colors.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  resetBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  catName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  presetBadge: {
    fontSize: 11,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  preview: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  previewName: {
    fontSize: 15,
    fontWeight: '600',
  },
  nameInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: 15,
  },
  pickLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    borderWidth: 2,
  },
  colorRow: {
    flexDirection: 'row',
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
