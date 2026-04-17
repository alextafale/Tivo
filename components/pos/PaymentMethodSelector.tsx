import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PaymentMethod } from '../../src/domain/entities';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

interface PaymentMethodOption {
  method: PaymentMethod;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  subtitle: string;
}

const OPTIONS: PaymentMethodOption[] = [
  { method: 'cash', label: 'Efectivo', icon: 'cash', subtitle: 'Calculamos el cambio' },
  { method: 'card', label: 'Tarjeta', icon: 'credit-card-outline', subtitle: 'Débito o crédito' },
  { method: 'transfer', label: 'Transferencia', icon: 'bank-transfer', subtitle: 'SPEI / QR' },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function MethodCard({ option, selected, onSelect }: { option: PaymentMethodOption; selected: boolean; onSelect: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      onPress={onSelect}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.card, selected && styles.cardSelected, animStyle]}
      activeOpacity={1}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <MaterialCommunityIcons
          name={option.icon}
          size={26}
          color={selected ? Colors.white : Colors.textSecondary}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
      <Text style={styles.subtitle}>{option.subtitle}</Text>
      {selected && (
        <View style={styles.checkDot}>
          <MaterialCommunityIcons name="check" size={12} color={Colors.white} />
        </View>
      )}
    </AnimatedTouchable>
  );
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map(opt => (
        <MethodCard
          key={opt.method}
          option={opt}
          selected={selected === opt.method}
          onSelect={() => onSelect(opt.method)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.bgOverlay,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: Colors.primary },
  label: {
    fontSize: Theme.font.sizes.sm,
    fontWeight: Theme.font.weights.semibold,
    color: Colors.textSecondary,
  },
  labelSelected: { color: Colors.primary },
  subtitle: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  checkDot: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
