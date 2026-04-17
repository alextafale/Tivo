import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSalesStore } from '../../../src/application/stores/salesStore';
import Colors from '../../../constants/Colors';
import Theme from '../../../constants/Theme';
import { Card } from '../../../components/ui/Card';
import { KpiCard } from '../../../components/pos/KpiCard';
import { SalesChart } from '../../../components/charts/SalesChart';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatCurrency(n: number) {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
}

export default function ReportsScreen() {
  const getMetrics = useSalesStore(s => s.getMetrics);
  const sales = useSalesStore(s => s.sales);

  const metrics = useMemo(() => getMetrics(), [getMetrics]);

  // Last 7 days chart data
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const dayRevenue = sales
        .filter(s => {
          const sd = new Date(s.createdAt);
          sd.setHours(0, 0, 0, 0);
          return sd.getTime() === d.getTime() && s.status === 'completed';
        })
        .reduce((sum, s) => sum + s.total, 0);
      return { label: DAYS[d.getDay()], value: dayRevenue };
    });
  }, [sales]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const counts = { cash: 0, card: 0, transfer: 0 };
    sales.filter(s => s.status === 'completed').forEach(s => { counts[s.paymentMethod]++; });
    const total = counts.cash + counts.card + counts.transfer;
    return [
      { label: 'Efectivo', count: counts.cash, pct: total ? Math.round(counts.cash / total * 100) : 0, icon: 'cash', color: Colors.accent },
      { label: 'Tarjeta', count: counts.card, pct: total ? Math.round(counts.card / total * 100) : 0, icon: 'credit-card-outline', color: Colors.primary },
      { label: 'Transfer.', count: counts.transfer, pct: total ? Math.round(counts.transfer / total * 100) : 0, icon: 'bank-transfer', color: Colors.info },
    ];
  }, [sales]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reportes</Text>
          <MaterialCommunityIcons name="chart-areaspline" size={24} color={Colors.primary} />
        </View>

        {/* KPI row */}
        <View style={styles.kpiRow}>
          <KpiCard title="Hoy" value={formatCurrency(metrics.todayRevenue)} icon="calendar-today" color={Colors.primary} trend={12} />
          <KpiCard title="Semana" value={formatCurrency(metrics.weekRevenue)} icon="calendar-week" color={Colors.accent} />
        </View>
        <View style={styles.kpiRow}>
          <KpiCard title="Mes" value={formatCurrency(metrics.monthRevenue)} icon="calendar-month" color={Colors.warning} />
          <KpiCard title="Ventas hoy" value={String(metrics.todaySales)} icon="receipt" color={Colors.info} subtitle={`${metrics.todaySales} transacciones`} />
        </View>

        {/* Weekly chart */}
        <Text style={styles.sectionTitle}>Ingresos — últimos 7 días</Text>
        <Card style={{ padding: 12 }}>
          <SalesChart data={weeklyData} color={Colors.primary} />
          <View style={styles.chartLabels}>
            <Text style={styles.chartMin}>$0</Text>
            <Text style={styles.chartMax}>
              {formatCurrency(Math.max(...weeklyData.map(d => d.value)))}
            </Text>
          </View>
        </Card>

        {/* Payment breakdown */}
        <Text style={styles.sectionTitle}>Métodos de pago</Text>
        <Card>
          {paymentBreakdown.map((p, i) => (
            <View key={p.label} style={[styles.pmRow, i > 0 && styles.pmBorder]}>
              <View style={[styles.pmIcon, { backgroundColor: p.color + '20' }]}>
                <MaterialCommunityIcons name={p.icon as any} size={18} color={p.color} />
              </View>
              <Text style={styles.pmLabel}>{p.label}</Text>
              <View style={styles.pmBar}>
                <View style={[styles.pmFill, { width: `${p.pct}%` as any, backgroundColor: p.color }]} />
              </View>
              <Text style={[styles.pmPct, { color: p.color }]}>{p.pct}%</Text>
              <Text style={styles.pmCount}>{p.count}</Text>
            </View>
          ))}
        </Card>

        {/* Top products */}
        {metrics.topProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Productos más vendidos</Text>
            <Card>
              {metrics.topProducts.map((tp, i) => (
                <View key={tp.product.id} style={[styles.tpRow, i > 0 && styles.pmBorder]}>
                  <View style={styles.tpRank}>
                    <Text style={styles.tpRankNum}>#{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tpName} numberOfLines={1}>{tp.product.name}</Text>
                    <Text style={styles.tpCat}>{tp.product.category}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.tpSold}>{tp.sold} uds</Text>
                    <Text style={styles.tpRevenue}>{formatCurrency(tp.sold * tp.product.price)}</Text>
                  </View>
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
  content: { padding: Theme.spacing.md, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  kpiRow: { flexDirection: 'row', gap: 12 },
  sectionTitle: { fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary, marginTop: 8 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  chartMin: { fontSize: 10, color: Colors.textMuted },
  chartMax: { fontSize: 10, color: Colors.textMuted },
  pmRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 4 },
  pmBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  pmIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pmLabel: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, width: 70, fontWeight: Theme.font.weights.medium },
  pmBar: { flex: 1, height: 6, backgroundColor: Colors.bgOverlay, borderRadius: 3, overflow: 'hidden' },
  pmFill: { height: '100%', borderRadius: 3 },
  pmPct: { fontSize: Theme.font.sizes.sm, fontWeight: Theme.font.weights.bold, width: 36, textAlign: 'right' },
  pmCount: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted, width: 24, textAlign: 'right' },
  tpRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  tpRank: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  tpRankNum: { fontSize: Theme.font.sizes.xs, fontWeight: Theme.font.weights.bold, color: Colors.primary },
  tpName: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  tpCat: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
  tpSold: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary },
  tpRevenue: { fontSize: Theme.font.sizes.sm, fontWeight: Theme.font.weights.bold, color: Colors.accent },
});
