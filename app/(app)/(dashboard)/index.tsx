import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSalesStore } from '../../../src/application/stores/salesStore';
import { useInventoryStore } from '../../../src/application/stores/inventoryStore';
import { useAuthStore } from '../../../src/application/stores/authStore';
import Colors from '../../../constants/Colors';
import Theme from '../../../constants/Theme';
import { KpiCard } from '../../../components/pos/KpiCard';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';

const QUICK_ACTIONS = [
  { id: 'sale', label: 'Nueva venta', icon: 'cart-plus', color: Colors.primary, route: '/(app)/(sales)' },
  { id: 'inventory', label: 'Inventario', icon: 'package-variant', color: Colors.accent, route: '/(app)/(inventory)' },
  { id: 'reports', label: 'Reportes', icon: 'chart-bar', color: Colors.warning, route: '/(app)/(reports)' },
  { id: 'customers', label: 'Clientes', icon: 'account-group', color: Colors.info, route: '/(app)/(customers)' },
];

function formatCurrency(n: number) {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const getMetrics = useSalesStore(s => s.getMetrics);
  const products = useInventoryStore(s => s.products);
  const lowStock = useInventoryStore(s => s.getLowStock)();

  const metrics = useMemo(() => getMetrics(), [getMetrics]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '¡Buenos días';
    if (h < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}, {user?.name?.split(' ')[0]}! 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={22} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <TouchableOpacity
            style={styles.alert}
            onPress={() => router.push('/(app)/(inventory)')}
          >
            <MaterialCommunityIcons name="alert-outline" size={18} color={Colors.warning} />
            <Text style={styles.alertText}>
              {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock bajo
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.warning} />
          </TouchableOpacity>
        )}

        {/* KPI Cards */}
        <Text style={styles.sectionTitle}>Resumen del día</Text>
        <View style={styles.kpiRow}>
          <KpiCard
            title="Ventas hoy"
            value={String(metrics.todaySales)}
            icon="receipt"
            color={Colors.primary}
            trend={12}
          />
          <KpiCard
            title="Ingresos"
            value={formatCurrency(metrics.todayRevenue)}
            icon="cash-multiple"
            color={Colors.accent}
            trend={8}
          />
        </View>
        <View style={styles.kpiRow}>
          <KpiCard
            title="Esta semana"
            value={formatCurrency(metrics.weekRevenue)}
            icon="calendar-week"
            color={Colors.warning}
          />
          <KpiCard
            title="Este mes"
            value={formatCurrency(metrics.monthRevenue)}
            icon="calendar-month"
            color={Colors.info}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { borderColor: action.color + '40' }]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <MaterialCommunityIcons name={action.icon as any} size={28} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top products */}
        {metrics.topProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Más vendidos</Text>
            <Card>
              {metrics.topProducts.slice(0, 5).map((tp, i) => (
                <View key={tp.product.id} style={[styles.topProductRow, i > 0 && styles.topProductBorder]}>
                  <View style={styles.topProductRank}>
                    <Text style={styles.rankNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.topProductName} numberOfLines={1}>{tp.product.name}</Text>
                  <Badge label={`${tp.sold} vendidos`} variant="primary" size="sm" />
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Recent sales */}
        {metrics.recentSales.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Últimas ventas</Text>
            <Card>
              {metrics.recentSales.slice(0, 5).map((s, i) => (
                <View key={s.id} style={[styles.saleRow, i > 0 && styles.topProductBorder]}>
                  <View style={styles.saleIcon}>
                    <MaterialCommunityIcons
                      name={s.paymentMethod === 'cash' ? 'cash' : s.paymentMethod === 'card' ? 'credit-card-outline' : 'bank-transfer'}
                      size={16}
                      color={Colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.saleName}>{s.ticketNumber}</Text>
                    <Text style={styles.saleTime}>{formatTime(s.createdAt)}</Text>
                  </View>
                  <Text style={styles.saleTotal}>{formatCurrency(s.total)}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Theme.spacing.md, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  date: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  avatarBtn: {},
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.glassBorder,
  },
  alert: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.warningBg,
    borderRadius: Theme.radius.md,
    padding: 12,
    borderWidth: 1, borderColor: Colors.warning + '40',
  },
  alertText: { flex: 1, fontSize: Theme.font.sizes.sm, color: Colors.warning, fontWeight: Theme.font.weights.medium },
  sectionTitle: {
    fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.bold,
    color: Colors.textPrimary, marginTop: 8,
  },
  kpiRow: { flexDirection: 'row', gap: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    ...Theme.shadow.sm,
  },
  actionIcon: { width: 56, height: 56, borderRadius: Theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: Theme.font.sizes.sm, fontWeight: Theme.font.weights.semibold, color: Colors.textPrimary, textAlign: 'center' },
  topProductRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  topProductBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  topProductRank: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  rankNum: { fontSize: Theme.font.sizes.xs, fontWeight: Theme.font.weights.bold, color: Colors.primary },
  topProductName: { flex: 1, fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  saleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  saleIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgOverlay, alignItems: 'center', justifyContent: 'center',
  },
  saleName: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  saleTime: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
  saleTotal: { fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.bold, color: Colors.accent },
});
