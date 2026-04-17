import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCartStore } from '../../../src/application/stores/cartStore';
import { useInventoryStore } from '../../../src/application/stores/inventoryStore';
import { mockRecommendations } from '../../../src/infrastructure/mock/mockData';
import Colors from '../../../constants/Colors';
import Theme from '../../../constants/Theme';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ProductCard } from '../../../components/pos/ProductCard';
import { CartItem } from '../../../components/pos/CartItem';
import { AIRecommendation } from '../../../components/pos/AIRecommendation';
import { Product } from '../../../src/domain/entities';

const CATEGORIES = ['Todos', 'Bebidas', 'Alimentos', 'Higiene', 'Hogar', 'Otros'];

export default function SalesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [view, setView] = useState<'search' | 'cart'>('search');

  const searchProducts = useInventoryStore(s => s.searchProducts);
  const products = useInventoryStore(s => s.products);
  const { items, addProduct, removeProduct, updateQuantity, total, tax, subtotal, itemCount } = useCartStore();

  const results = useMemo(() => {
    let list = searchProducts(query);
    if (activeCategory !== 'Todos') {
      list = list.filter(p => p.category === activeCategory);
    }
    return list;
  }, [query, activeCategory, searchProducts]);

  // AI recommendations based on cart
  const aiRecs = useMemo(() => {
    if (!items.length) return [];
    const lastItem = items[items.length - 1];
    const recIds = mockRecommendations[lastItem.product.id] ?? [];
    return recIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => !!p && p.stock > 0 && !items.find(i => i.product.id === p.id));
  }, [items, products]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Venta</Text>
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.toggle, view === 'search' && styles.toggleActive]}
            onPress={() => setView('search')}
          >
            <MaterialCommunityIcons name="magnify" size={18} color={view === 'search' ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, view === 'cart' && styles.toggleActive]}
            onPress={() => setView('cart')}
          >
            <View>
              <MaterialCommunityIcons name="cart-outline" size={18} color={view === 'cart' ? Colors.primary : Colors.textMuted} />
              {itemCount > 0 && <View style={styles.cartDot} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {view === 'search' ? (
        <View style={{ flex: 1 }}>
          {/* Search */}
          <View style={styles.searchRow}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar o escanear..."
              style={{ flex: 1 }}
            />
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catBar}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.catLabel, activeCategory === cat && styles.catLabelActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* AI recommendations */}
          {aiRecs.length > 0 && (
            <View style={styles.aiSection}>
              <AIRecommendation products={aiRecs} onSelect={p => addProduct(p)} />
            </View>
          )}

          {/* Product list */}
          <FlatList
            data={results}
            keyExtractor={p => p.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={p => addProduct(p)} compact />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="package-variant-closed-remove"
                title="Sin resultados"
                subtitle="Prueba con otro nombre o categoría"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        // Cart view
        <View style={{ flex: 1 }}>
          {items.length === 0 ? (
            <EmptyState
              icon="cart-outline"
              title="Carrito vacío"
              subtitle="Busca y agrega productos para comenzar"
              action={
                <Button label="Buscar productos" variant="outline" onPress={() => setView('search')} />
              }
            />
          ) : (
            <>
              <FlatList
                data={items}
                keyExtractor={i => i.product.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <CartItem
                    item={item}
                    onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
                    onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
                    onRemove={() => removeProduct(item.product.id)}
                  />
                )}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              />
              {/* Totals */}
              <View style={styles.totalsPanel}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalVal}>${subtotal.toFixed(2)}</Text>
                </View>
                {tax > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>IVA</Text>
                    <Text style={styles.totalVal}>${tax.toFixed(2)}</Text>
                  </View>
                )}
                <View style={[styles.totalRow, styles.totalGrand]}>
                  <Text style={styles.grandLabel}>Total</Text>
                  <Text style={styles.grandVal}>${total.toFixed(2)}</Text>
                </View>
                <Button
                  label={`Cobrar $${total.toFixed(2)}`}
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={() => router.push('/(app)/(sales)/checkout')}
                  icon={<MaterialCommunityIcons name="cash-register" size={20} color={Colors.white} />}
                />
              </View>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md, paddingTop: 8, paddingBottom: 4,
  },
  title: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: 3, gap: 3,
  },
  toggle: {
    width: 36, height: 36,
    borderRadius: Theme.radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleActive: { backgroundColor: Colors.primaryBg },
  cartDot: {
    position: 'absolute', top: -2, right: -2,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: Colors.accent,
  },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: Theme.spacing.md, paddingVertical: 10 },
  catBar: { paddingHorizontal: Theme.spacing.md, paddingBottom: 12, gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Theme.radius.full,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  catLabel: { fontSize: Theme.font.sizes.sm, color: Colors.textMuted, fontWeight: Theme.font.weights.medium },
  catLabelActive: { color: Colors.primary },
  aiSection: { paddingHorizontal: Theme.spacing.md, marginBottom: 10 },
  listContent: { padding: Theme.spacing.md, gap: 8, paddingTop: 0 },
  totalsPanel: {
    padding: Theme.spacing.md,
    backgroundColor: Colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary },
  totalVal: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  totalGrand: { paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border, marginBottom: 4 },
  grandLabel: { fontSize: Theme.font.sizes.lg, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  grandVal: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.extrabold, color: Colors.accent },
});
