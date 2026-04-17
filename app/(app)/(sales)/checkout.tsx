import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCartStore } from '../../../src/application/stores/cartStore';
import { useCustomerStore } from '../../../src/application/stores/authStore';
import { useSalesStore } from '../../../src/application/stores/salesStore';
import { useInventoryStore } from '../../../src/application/stores/inventoryStore';
import Colors from '../../../constants/Colors';
import Theme from '../../../constants/Theme';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PaymentMethodSelector } from '../../../components/pos/PaymentMethodSelector';

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    items, total, subtotal, tax, discount,
    paymentMethod, setPaymentMethod, customerId, setCustomer, getSalePayload, clearCart,
  } = useCartStore();
  const addSale = useSalesStore(s => s.addSale);
  const deductStock = useInventoryStore(s => s.deductStock);
  const customers = useCustomerStore(s => s.customers);

  const [amountPaid, setAmountPaid] = useState(String(Math.ceil(total / 10) * 10));
  const [customerQuery, setCustomerQuery] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const change = useMemo(() => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - total);
  }, [amountPaid, total]);

  const filteredCustomers = useMemo(() => {
    if (!customerQuery) return customers;
    const q = customerQuery.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone?.includes(q)
    );
  }, [customers, customerQuery]);

  const selectedCustomer = customers.find(c => c.id === customerId);

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const salePayload = getSalePayload(parseFloat(amountPaid) || total);
    const sale = addSale(salePayload);

    // Deduct stock
    deductStock(items.map(i => ({ productId: i.product.id, quantity: i.quantity })));

    clearCart();
    router.replace({ pathname: '/(app)/(sales)/confirmation', params: { saleId: sale.id } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Cobrar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionLabel}>Resumen del pedido</Text>
          {items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.quantity}x {item.product.name}</Text>
              <Text style={styles.itemPrice}>${item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
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
          <View style={[styles.totalRow, styles.grandRow]}>
            <Text style={styles.grandLabel}>TOTAL</Text>
            <Text style={styles.grandVal}>${total.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Payment method */}
        <Text style={styles.sectionTitle}>Método de pago</Text>
        <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />

        {/* Cash input */}
        {paymentMethod === 'cash' && (
          <Card style={styles.cashCard}>
            <Text style={styles.sectionLabel}>Monto recibido</Text>
            <View style={styles.cashInput}>
              <Text style={styles.peso}>$</Text>
              <TextInput
                value={amountPaid}
                onChangeText={setAmountPaid}
                keyboardType="decimal-pad"
                style={styles.cashInputText}
                selectTextOnFocus
              />
            </View>
            {change > 0 && (
              <View style={styles.changeRow}>
                <MaterialCommunityIcons name="cash" size={16} color={Colors.accent} />
                <Text style={styles.changeText}>Cambio: <Text style={styles.changeBold}>${change.toFixed(2)}</Text></Text>
              </View>
            )}
            {/* Quick amounts */}
            <View style={styles.quickAmounts}>
              {[50, 100, 200, 500].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={styles.amtChip}
                  onPress={() => setAmountPaid(String(amt))}
                >
                  <Text style={styles.amtLabel}>${amt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Customer (optional) */}
        <Text style={styles.sectionTitle}>Cliente (opcional)</Text>
        <TouchableOpacity
          style={styles.customerBtn}
          onPress={() => setShowCustomerPicker(v => !v)}
        >
          <MaterialCommunityIcons name="account-outline" size={20} color={Colors.textMuted} />
          <Text style={[styles.customerBtnText, selectedCustomer && styles.customerSelected]}>
            {selectedCustomer ? selectedCustomer.name : 'Seleccionar cliente'}
          </Text>
          <MaterialCommunityIcons
            name={showCustomerPicker ? 'chevron-up' : 'chevron-down'}
            size={18} color={Colors.textMuted}
          />
        </TouchableOpacity>

        {showCustomerPicker && (
          <Card style={styles.customerPicker}>
            <TextInput
              value={customerQuery}
              onChangeText={setCustomerQuery}
              placeholder="Buscar cliente..."
              placeholderTextColor={Colors.textMuted}
              style={styles.customerSearch}
            />
            {filteredCustomers.slice(0, 5).map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.customerRow, customerId === c.id && styles.customerRowSelected]}
                onPress={() => { setCustomer(c.id); setShowCustomerPicker(false); }}
              >
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerInitial}>{c.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{c.name}</Text>
                  {c.phone && <Text style={styles.customerPhone}>{c.phone}</Text>}
                </View>
                {customerId === c.id && (
                  <MaterialCommunityIcons name="check-circle" size={18} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
            {customerId && (
              <TouchableOpacity onPress={() => setCustomer(undefined)} style={styles.clearCustomer}>
                <Text style={styles.clearCustomerText}>Quitar cliente</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.confirmBar}>
        <Button
          label={isProcessing ? 'Procesando...' : `Confirmar pago · $${total.toFixed(2)}`}
          variant="accent"
          size="lg"
          fullWidth
          loading={isProcessing}
          onPress={handleConfirm}
          icon={<MaterialCommunityIcons name="check-circle-outline" size={20} color={Colors.textInverse} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Theme.font.sizes.lg, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  content: { padding: Theme.spacing.md, gap: 16 },
  summaryCard: { gap: 8 },
  sectionLabel: { fontSize: Theme.font.sizes.xs, fontWeight: Theme.font.weights.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  itemName: { flex: 1, fontSize: Theme.font.sizes.sm, color: Colors.textSecondary },
  itemPrice: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalLabel: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary },
  totalVal: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary },
  grandRow: { paddingTop: 8 },
  grandLabel: { fontSize: Theme.font.sizes.md, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  grandVal: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.extrabold, color: Colors.accent },
  sectionTitle: { fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  cashCard: { gap: 12 },
  cashInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgOverlay, borderRadius: Theme.radius.md,
    borderWidth: 1.5, borderColor: Colors.primary, paddingHorizontal: 16,
  },
  peso: { fontSize: Theme.font.sizes.xxl, color: Colors.textSecondary, fontWeight: Theme.font.weights.bold },
  cashInputText: { flex: 1, fontSize: Theme.font.sizes.xxl, color: Colors.textPrimary, fontWeight: Theme.font.weights.extrabold, padding: 12 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  changeText: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary },
  changeBold: { fontWeight: Theme.font.weights.bold, color: Colors.accent },
  quickAmounts: { flexDirection: 'row', gap: 8 },
  amtChip: {
    flex: 1, paddingVertical: 8, borderRadius: Theme.radius.sm,
    backgroundColor: Colors.bgOverlay, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  amtLabel: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.semibold },
  customerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgSurface, borderRadius: Theme.radius.md,
    borderWidth: 1.5, borderColor: Colors.border, padding: 14,
  },
  customerBtnText: { flex: 1, fontSize: Theme.font.sizes.base, color: Colors.textMuted },
  customerSelected: { color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  customerPicker: { gap: 0, overflow: 'hidden' },
  customerSearch: {
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    padding: 12, fontSize: Theme.font.sizes.sm, color: Colors.textPrimary,
  },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  customerRowSelected: { backgroundColor: Colors.primaryBg },
  customerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  customerInitial: { fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.bold, color: Colors.primary },
  customerName: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  customerPhone: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
  clearCustomer: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border },
  clearCustomerText: { fontSize: Theme.font.sizes.sm, color: Colors.danger },
  confirmBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Theme.spacing.md,
    backgroundColor: Colors.bgSurface,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
