import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useInventoryStore } from '../../../src/application/stores/inventoryStore';
import { Product, ProductCategory } from '../../../src/domain/entities';
import Colors from '../../../constants/Colors';
import Theme from '../../../constants/Theme';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

const CATEGORIES: ProductCategory[] = ['Bebidas', 'Alimentos', 'Electrónica', 'Ropa', 'Higiene', 'Hogar', 'Otros'];

function ProductRow({ product, onPress }: { product: Product; onPress: () => void }) {
  const isLow = product.stock <= product.minStock;
  const isOut = product.stock === 0;
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.rowCategory}>{product.category} · {product.unit}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowPrice}>${product.price.toFixed(2)}</Text>
        <Badge
          label={isOut ? 'Sin stock' : `${product.stock}`}
          variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}
          size="sm"
          dot
        />
      </View>
    </TouchableOpacity>
  );
}

function AddProductModal({ visible, onClose, onAdd }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [category, setCategory] = useState<ProductCategory>('Alimentos');
  const [barcode, setBarcode] = useState('');

  const handleAdd = () => {
    if (!name || !price) return;
    onAdd({
      name, price: parseFloat(price) || 0, cost: parseFloat(cost) || 0,
      stock: parseInt(stock) || 0, minStock: parseInt(minStock) || 5,
      category, barcode, unit: 'pieza', taxRate: 0, isActive: true, description: '',
    });
    setName(''); setPrice(''); setCost(''); setStock(''); setBarcode('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Agregar Producto</Text>
          <Button label="Cancelar" variant="ghost" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <Input label="Nombre del producto *" value={name} onChangeText={setName} placeholder="Ej: Coca-Cola 600ml" leftIcon="package-variant" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input label="Precio venta *" value={price} onChangeText={setPrice} keyboardType="decimal-pad" leftIcon="cash" containerStyle={{ flex: 1 }} />
            <Input label="Costo" value={cost} onChangeText={setCost} keyboardType="decimal-pad" leftIcon="tag-outline" containerStyle={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input label="Stock inicial" value={stock} onChangeText={setStock} keyboardType="number-pad" leftIcon="counter" containerStyle={{ flex: 1 }} />
            <Input label="Stock mínimo" value={minStock} onChangeText={setMinStock} keyboardType="number-pad" leftIcon="alert-outline" containerStyle={{ flex: 1 }} />
          </View>
          <Input label="Código de barras" value={barcode} onChangeText={setBarcode} keyboardType="number-pad" leftIcon="barcode" />
          <Text style={styles.sectionLabel}>Categoría</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && styles.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catLabel, category === cat && styles.catLabelActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button label="Agregar producto" variant="primary" fullWidth size="lg" onPress={handleAdd} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function EditStockModal({ product, visible, onClose, onSave }: {
  product: Product | null; visible: boolean;
  onClose: () => void; onSave: (newStock: number) => void;
}) {
  const [val, setVal] = useState(String(product?.stock ?? 0));
  if (!product) return null;
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.editModal}>
          <Text style={styles.editTitle}>Ajustar stock</Text>
          <Text style={styles.editSubtitle}>{product.name}</Text>
          <Input
            value={val}
            onChangeText={setVal}
            keyboardType="number-pad"
            label="Nueva cantidad"
            leftIcon="counter"
            containerStyle={{ marginVertical: 16 }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Cancelar" variant="ghost" style={{ flex: 1 }} onPress={onClose} />
            <Button label="Guardar" variant="primary" style={{ flex: 1 }} onPress={() => { onSave(parseInt(val) || 0); onClose(); }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function InventoryScreen() {
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [filterLow, setFilterLow] = useState(false);

  const searchProducts = useInventoryStore(s => s.searchProducts);
  const addProduct = useInventoryStore(s => s.addProduct);
  const getLowStock = useInventoryStore(s => s.getLowStock);
  const updateProduct = useInventoryStore(s => s.updateProduct);

  const results = useMemo(() => {
    let list = searchProducts(query);
    if (filterLow) list = list.filter(p => p.stock <= p.minStock);
    return list;
  }, [query, filterLow, searchProducts]);

  const lowCount = getLowStock().length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventario</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <MaterialCommunityIcons name="plus" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchBar value={query} onChangeText={setQuery} style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.filterBtn, filterLow && styles.filterBtnActive]}
          onPress={() => setFilterLow(v => !v)}
        >
          <MaterialCommunityIcons name="alert-outline" size={18} color={filterLow ? Colors.warning : Colors.textMuted} />
          {lowCount > 0 && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {filterLow && (
        <View style={styles.filterNote}>
          <MaterialCommunityIcons name="information-outline" size={14} color={Colors.warning} />
          <Text style={styles.filterNoteText}>Mostrando {lowCount} productos con stock bajo</Text>
          <TouchableOpacity onPress={() => setFilterLow(false)}>
            <MaterialCommunityIcons name="close" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductRow product={item} onPress={() => setEditProduct(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="package-variant-closed-remove"
            title={filterLow ? 'Sin productos con stock bajo' : 'Sin productos'}
            subtitle={filterLow ? '¡Tu inventario está en buen estado!' : 'Toca el botón + para agregar productos'}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <AddProductModal visible={showAdd} onClose={() => setShowAdd(false)} onAdd={addProduct} />
      <EditStockModal
        product={editProduct}
        visible={!!editProduct}
        onClose={() => setEditProduct(null)}
        onSave={(newStock) => {
          if (editProduct) updateProduct(editProduct.id, { stock: newStock });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.md },
  title: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Theme.shadow.primary,
  },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: Theme.spacing.md, paddingBottom: 10 },
  filterBtn: {
    width: 48, height: 48, borderRadius: Theme.radius.md,
    backgroundColor: Colors.bgSurface, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive: { borderColor: Colors.warning, backgroundColor: Colors.warningBg },
  filterDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.warning,
  },
  filterNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Theme.spacing.md, marginBottom: 8,
    backgroundColor: Colors.warningBg,
    borderRadius: Theme.radius.sm, padding: 8,
  },
  filterNoteText: { flex: 1, fontSize: Theme.font.sizes.xs, color: Colors.warning },
  listContent: { paddingHorizontal: Theme.spacing.md, paddingBottom: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.md, padding: 14,
    justifyContent: 'space-between', gap: 12,
  },
  rowLeft: { flex: 1 },
  rowName: { fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.semibold, color: Colors.textPrimary, marginBottom: 2 },
  rowCategory: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  rowPrice: { fontSize: Theme.font.sizes.md, fontWeight: Theme.font.weights.bold, color: Colors.accent },
  separator: { height: 8 },
  modalSafe: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: Theme.font.sizes.lg, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  editModal: { backgroundColor: Colors.bgElevated, borderRadius: Theme.radius.xl, padding: 24, borderWidth: 1, borderColor: Colors.border },
  editTitle: { fontSize: Theme.font.sizes.lg, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  editSubtitle: { fontSize: Theme.font.sizes.sm, color: Colors.textMuted, marginTop: 4 },
  sectionLabel: { fontSize: Theme.font.sizes.sm, fontWeight: Theme.font.weights.semibold, color: Colors.textSecondary },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Theme.radius.full, backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  catLabel: { fontSize: Theme.font.sizes.xs, color: Colors.textSecondary },
  catLabelActive: { color: Colors.primary, fontWeight: Theme.font.weights.semibold },
});
