import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useBillStore } from '../store/useStore';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  const init = useBillStore((s) => s.init);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-record"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '添加记录',
            headerStyle: { backgroundColor: C.surface },
            headerTitleStyle: { color: C.text, fontWeight: '700' },
            headerTintColor: Colors.primary,
          }}
        />
        <Stack.Screen
          name="edit-record"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '编辑记录',
            headerStyle: { backgroundColor: C.surface },
            headerTitleStyle: { color: C.text, fontWeight: '700' },
            headerTintColor: Colors.primary,
          }}
        />
        <Stack.Screen
          name="categories"
          options={{
            headerShown: true,
            headerTitle: '分类管理',
            headerStyle: { backgroundColor: C.surface },
            headerTitleStyle: { color: C.text, fontWeight: '700' },
            headerTintColor: Colors.primary,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
