import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCustomerStore } from '../../../src/application/stores/authStore';
import { Customer } from '../../../src/domain/entities';
import Colors from '../../../constants/Colors';
import Theme from '../../../constants/Theme';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';

function CustomerRow({ customer, onPress }: { customer: Customer; onPress: () => void }) {
  const initial = customer.name[0].toUpperCase();
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.phone}>{customer.phone || customer.email || 'Sin contacto'}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={styles.spent}>${customer.totalSpent.toFixed(0)}</Text>
        <Badge label={`${customer.totalPurchases} compras`} variant="primary" size="sm" />
      </View>
    </TouchableOpacity>
  );
}

function AddCustomerModal({ visible, onClose, onAdd }: {
  visible: boolean; onClose: () => void;
  onAdd: (data: Pick<Customer, 'name' | 'email' | 'phone' | 'address' | 'notes'>) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handle = () => {
    if (!name) return;
    onAdd({ name, phone, email, address: '', notes: '' });
    setName(''); setPhone(''); setEmail('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Nuevo cliente</Text>
          <Button label="Cancelar" variant="ghost" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <Input label="Nombre completo *" value={name} onChangeText={setName} placeholder="Ej: María García" leftIcon="account-outline" />
          <Input label="Teléfono" value={phone} onChangeText={setPhone} placeholder="555-0000" keyboardType="phone-pad" leftIcon="phone-outline" />
          <Input label="Correo" value={email} onChangeText={setEmail} placeholder="correo@mail.com" keyboardType="email-address" leftIcon="email-outline" />
          <Button label="Guardar cliente" variant="primary" fullWidth size="lg" onPress={handle} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function CustomerDetailModal({ customer, visible, onClose }: {
  customer: Customer | null; visible: boolean; onClose: () => void;
}) {
  if (!customer) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Perfil del cliente</Text>
          <Button label="Cerrar" variant="ghost" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View style={styles.detailHeader}>
            <View style={[styles.avatar, styles.avatarLg]}>
              <Text style={[styles.initial, styles.initialLg]}>{customer.name[0]}</Text>
            </View>
            <Text style={{ fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary, textAlign: 'center' }}>
              {customer.name}
            </Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{customer.totalPurchases}</Text>
              <Text style={styles.statLabel}>Compras</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>${customer.totalSpent.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total gastado</Text>
            </View>
          </View>
          <Card style={{ gap: 12 }}>
            {customer.phone && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="phone-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.detailVal}>{customer.phone}</Text>
              </View>
            )}
            {customer.email && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="email-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.detailVal}>{customer.email}</Text>
              </View>
            )}
            {customer.lastPurchaseAt && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar-check-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.detailVal}>
                  Última compra: {new Date(customer.lastPurchaseAt).toLocaleDateString('es-MX')}
                </Text>
              </View>
            )}
            {customer.notes && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="note-text-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.detailVal}>{customer.notes}</Text>
              </View>
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function CustomersScreen() {
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  const searchCustomers = useCustomerStore(s => s.searchCustomers);
  const addCustomer = useCustomerStore(s => s.addCustomer);

  const results = useMemo(() => searchCustomers(query), [query, searchCustomers]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <MaterialCommunityIcons name="plus" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 10 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar clientes..." />
      </View>

      <FlatList
        data={results}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CustomerRow customer={item} onPress={() => setSelected(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <EmptyState
            icon="account-group-outline"
            title="Sin clientes"
            subtitle="Agrega tu primer cliente para comenzar"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <AddCustomerModal visible={showAdd} onClose={() => setShowAdd(false)} onAdd={addCustomer} />
      <CustomerDetailModal customer={selected} visible={!!selected} onClose={() => setSelected(null)} />
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
  list: { paddingHorizontal: Theme.spacing.md, paddingBottom: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.md, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLg: { width: 72, height: 72, borderRadius: 36 },
  initial: { fontSize: Theme.font.sizes.lg, fontWeight: Theme.font.weights.bold, color: Colors.primary },
  initialLg: { fontSize: Theme.font.sizes.xxl },
  name: { fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.semibold, color: Colors.textPrimary, marginBottom: 2 },
  phone: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
  spent: { fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.bold, color: Colors.accent },
  modalSafe: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: Theme.font.sizes.lg, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  detailHeader: { alignItems: 'center', gap: 12 },
  statRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 4 },
  statVal: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.extrabold, color: Colors.accent },
  statLabel: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
  statDivider: { width: 1, backgroundColor: Colors.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailVal: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, flex: 1 },
});
