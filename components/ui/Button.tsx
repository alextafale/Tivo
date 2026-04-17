import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, TouchableOpacityProps,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  label, variant = 'primary', size = 'md', loading = false,
  icon, iconRight = false, style, textStyle, fullWidth = false,
  disabled, onPress, ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.96, { damping: 15 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15 }); };

  const variantStyle = styles[variant];
  const sizeStyle = sizeStyles[size];
  const labelStyle = labelStyles[variant];
  const labelSizeStyle = labelSizeStyles[size];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        variantStyle,
        sizeStyle,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animStyle,
        style,
      ]}
      activeOpacity={1}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'ghost' || variant === 'outline' ? Colors.primary : Colors.white} />
      ) : (
        <>
          {icon && !iconRight && <>{icon}</>}
          <Text style={[styles.label, labelStyle, labelSizeStyle, textStyle]}>{label}</Text>
          {icon && iconRight && <>{icon}</>}
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Theme.radius.md,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  label: { fontWeight: Theme.font.weights.semibold },
  // Variants
  primary: {
    backgroundColor: Colors.primary,
    ...Theme.shadow.primary,
  },
  secondary: { backgroundColor: Colors.bgOverlay },
  accent: {
    backgroundColor: Colors.accent,
    ...Theme.shadow.accent,
  },
  ghost: { backgroundColor: Colors.transparent },
  danger: { backgroundColor: Colors.danger },
  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
});

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Theme.radius.sm },
  md: { paddingHorizontal: 20, paddingVertical: 13 },
  lg: { paddingHorizontal: 28, paddingVertical: 16, borderRadius: Theme.radius.lg },
};

const labelStyles: Record<Variant, TextStyle> = {
  primary: { color: Colors.white },
  secondary: { color: Colors.textPrimary },
  accent: { color: Colors.textInverse },
  ghost: { color: Colors.primary },
  danger: { color: Colors.white },
  outline: { color: Colors.primary },
};

const labelSizeStyles: Record<Size, TextStyle> = {
  sm: { fontSize: Theme.font.sizes.sm },
  md: { fontSize: Theme.font.sizes.base },
  lg: { fontSize: Theme.font.sizes.md },
};
