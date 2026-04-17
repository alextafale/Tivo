import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../../src/domain/entities';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

interface CartItemProps {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  const { product, quantity, subtotal } = item;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.unitPrice}>${product.price.toFixed(2)} c/u</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={onDecrease} style={styles.qtyBtn}>
          <MaterialCommunityIcons
            name={quantity === 1 ? 'trash-can-outline' : 'minus'}
            size={16}
            color={quantity === 1 ? Colors.danger : Colors.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity onPress={onIncrease} style={[styles.qtyBtn, styles.qtyBtnPlus]}>
          <MaterialCommunityIcons name="plus" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtotal}>${subtotal.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.md,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  info: { flex: 1 },
  name: {
    fontSize: Theme.font.sizes.sm,
    fontWeight: Theme.font.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  unitPrice: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgOverlay,
    borderRadius: Theme.radius.sm,
    padding: 4,
  },
  qtyBtn: {
    width: 28, height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
  },
  qtyBtnPlus: { backgroundColor: Colors.primaryBg },
  quantity: {
    fontSize: Theme.font.sizes.base,
    fontWeight: Theme.font.weights.bold,
    color: Colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: Theme.font.sizes.md,
    fontWeight: Theme.font.weights.bold,
    color: Colors.accent,
    minWidth: 60,
    textAlign: 'right',
  },
});
