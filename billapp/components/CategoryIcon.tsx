import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  icon: string;
  color: string;
  size?: number;
  iconSize?: number;
}

export function CategoryIcon({ icon, color, size = 44, iconSize = 22 }: Props) {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22' },
      ]}
    >
      <MaterialCommunityIcons name={icon as any} size={iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
