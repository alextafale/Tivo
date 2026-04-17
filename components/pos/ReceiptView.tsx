import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Sale, Ticket, PaymentMethod } from '../../src/domain/entities';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

interface ReceiptViewProps {
  sale: Sale;
  businessName?: string;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

function formatDate(d: Date) {
  return new Date(d).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ReceiptView({ sale, businessName = 'Mi Negocio' }: ReceiptViewProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="store" size={28} color={Colors.primary} />
        <Text style={styles.businessName}>{businessName}</Text>
        <Text style={styles.ticketNum}>TICKET: {sale.ticketNumber}</Text>
        <Text style={styles.date}>{formatDate(sale.createdAt)}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Items */}
      {sale.items.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <Text style={styles.itemName} numberOfLines={1}>{item.quantity}x {item.product.name}</Text>
          <Text style={styles.itemPrice}>${item.subtotal.toFixed(2)}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      {/* Totals */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalVal}>${sale.subtotal.toFixed(2)}</Text>
      </View>
      {sale.tax > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>IVA</Text>
          <Text style={styles.totalVal}>${sale.tax.toFixed(2)}</Text>
        </View>
      )}
      {sale.discount > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Descuento</Text>
          <Text style={[styles.totalVal, { color: Colors.danger }]}>-${sale.discount.toFixed(2)}</Text>
        </View>
      )}
      <View style={[styles.totalRow, styles.grandTotal]}>
        <Text style={styles.grandLabel}>TOTAL</Text>
        <Text style={styles.grandVal}>${sale.total.toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      {/* Payment */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Método</Text>
        <Text style={styles.totalVal}>{PAYMENT_LABELS[sale.paymentMethod]}</Text>
      </View>
      {sale.paymentMethod === 'cash' && (
        <>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Pago</Text>
            <Text style={styles.totalVal}>${sale.amountPaid.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Cambio</Text>
            <Text style={[styles.totalVal, { color: Colors.accent }]}>${sale.change.toFixed(2)}</Text>
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>¡Gracias por tu compra!</Text>
        <Text style={styles.footerSubtext}>Con tecnología TIVO POS</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 4 },
  header: { alignItems: 'center', gap: 4, marginBottom: 12 },
  businessName: { fontSize: Theme.font.sizes.lg, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  ticketNum: { fontSize: Theme.font.sizes.xs, color: Colors.primary, fontWeight: Theme.font.weights.semibold },
  date: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  itemName: { flex: 1, fontSize: Theme.font.sizes.sm, color: Colors.textSecondary },
  itemPrice: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary },
  totalVal: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  grandTotal: {
    marginTop: 8, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  grandLabel: { fontSize: Theme.font.sizes.md, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  grandVal: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.extrabold, color: Colors.accent },
  footer: { alignItems: 'center', marginTop: 20, gap: 4 },
  footerText: { fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  footerSubtext: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
});
