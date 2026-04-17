import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  dot?: boolean;
}

export function Badge({ label, variant = 'primary', size = 'md', style, dot = false }: BadgeProps) {
  const variantStyle = badgeStyles[variant];
  const textStyle = textStyles[variant];

  return (
    <View style={[styles.base, variantStyle, size === 'sm' && styles.sm, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: textStyle.color as string }]} />}
      <Text style={[styles.text, textStyle, size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 7, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: Theme.font.sizes.xs, fontWeight: Theme.font.weights.semibold },
  textSm: { fontSize: 10 },
});

const badgeStyles: Record<BadgeVariant, ViewStyle> = {
  success: { backgroundColor: Colors.successBg },
  warning: { backgroundColor: Colors.warningBg },
  danger: { backgroundColor: Colors.dangerBg },
  info: { backgroundColor: Colors.infoBg },
  primary: { backgroundColor: Colors.primaryBg },
  muted: { backgroundColor: Colors.bgOverlay },
};

const textStyles: Record<BadgeVariant, TextStyle> = {
  success: { color: Colors.accent },
  warning: { color: Colors.warning },
  danger: { color: Colors.danger },
  info: { color: Colors.info },
  primary: { color: Colors.primary },
  muted: { color: Colors.textSecondary },
};
