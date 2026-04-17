import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../../src/domain/entities';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';
import { Badge } from '../ui/Badge';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  compact?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ProductCard({ product, onPress, compact = false }: ProductCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isLowStock = product.stock <= product.minStock;
  const isOutOfStock = product.stock === 0;

  const stockVariant = isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success';
  const stockLabel = isOutOfStock ? 'Sin stock' : isLowStock ? `¡Solo ${product.stock}!` : `${product.stock} pzs`;

  return (
    <AnimatedTouchable
      onPress={() => onPress(product)}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      disabled={isOutOfStock}
      style={[styles.card, compact && styles.cardCompact, isOutOfStock && styles.cardDisabled, animStyle]}
      activeOpacity={1}
    >
      {/* Category icon placeholder */}
      <View style={[styles.iconBg, { backgroundColor: getCategoryColor(product.category) + '20' }]}>
        <MaterialCommunityIcons
          name={getCategoryIcon(product.category)}
          size={compact ? 22 : 28}
          color={getCategoryColor(product.category)}
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={compact ? 1 : 2}>
          {product.name}
        </Text>
        <Text style={styles.category}>{product.category}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price.toFixed(0)}</Text>
          <Badge label={stockLabel} variant={stockVariant} size="sm" dot />
        </View>
      </View>

      {!isOutOfStock && (
        <View style={styles.addBtn}>
          <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
        </View>
      )}
    </AnimatedTouchable>
  );
}

function getCategoryIcon(cat: string): keyof typeof MaterialCommunityIcons.glyphMap {
  const map: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
    'Bebidas': 'bottle-soda-outline',
    'Alimentos': 'food-outline',
    'Electrónica': 'cellphone',
    'Ropa': 'tshirt-crew-outline',
    'Higiene': 'hand-wash',
    'Hogar': 'home-outline',
    'Otros': 'package-variant',
  };
  return map[cat] ?? 'package-variant';
}

function getCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    'Bebidas': '#4FC3F7',
    'Alimentos': '#FFB547',
    'Electrónica': '#6C63FF',
    'Ropa': '#FF8A65',
    'Higiene': '#00D9A3',
    'Hogar': '#F06292',
    'Otros': '#9E9E9E',
  };
  return map[cat] ?? Colors.primary;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Theme.shadow.sm,
  },
  cardCompact: { padding: 10 },
  cardDisabled: { opacity: 0.5 },
  iconBg: {
    width: 52, height: 52,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontSize: Theme.font.sizes.base,
    fontWeight: Theme.font.weights.semibold,
    color: Colors.textPrimary,
  },
  nameCompact: { fontSize: Theme.font.sizes.sm },
  category: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  price: {
    fontSize: Theme.font.sizes.md,
    fontWeight: Theme.font.weights.bold,
    color: Colors.accent,
  },
  addBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
