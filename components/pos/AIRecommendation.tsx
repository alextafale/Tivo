import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../../src/domain/entities';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

interface AIRecommendationProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function AIRecommendation({ products, onSelect }: AIRecommendationProps) {
  if (!products.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="robot-outline" size={16} color={Colors.primary} />
        <Text style={styles.title}>IA recomienda</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {products.map(p => (
          <TouchableOpacity key={p.id} onPress={() => onSelect(p)} style={styles.chip}>
            <Text style={styles.chipName} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.chipPrice}>${p.price.toFixed(0)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryBg,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 10,
    gap: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: Theme.font.sizes.xs, fontWeight: Theme.font.weights.semibold, color: Colors.primary },
  scroll: { gap: 8 },
  chip: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
    maxWidth: 140,
  },
  chipName: { fontSize: Theme.font.sizes.xs, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium, marginBottom: 2 },
  chipPrice: { fontSize: Theme.font.sizes.xs, color: Colors.accent, fontWeight: Theme.font.weights.bold },
});
