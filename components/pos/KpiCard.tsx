import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  trend?: number; // positive = up, negative = down
  color?: string;
}

export function KpiCard({ title, value, subtitle, icon, trend, color = Colors.primary }: KpiCardProps) {
  const trendUp = trend !== undefined && trend >= 0;

  return (
    <View style={[styles.card, { borderColor: color + '30' }]}>
      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        {trend !== undefined && (
          <View style={[styles.trend, trendUp ? styles.trendUp : styles.trendDown]}>
            <MaterialCommunityIcons
              name={trendUp ? 'trending-up' : 'trending-down'}
              size={12}
              color={trendUp ? Colors.accent : Colors.danger}
            />
            <Text style={[styles.trendText, trendUp ? styles.trendUpText : styles.trendDownText]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    minWidth: 140,
    flex: 1,
    ...Theme.shadow.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  iconBg: {
    width: 40, height: 40,
    borderRadius: Theme.radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  trend: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  trendUp: { backgroundColor: Colors.successBg },
  trendDown: { backgroundColor: Colors.dangerBg },
  trendText: { fontSize: 10, fontWeight: Theme.font.weights.bold },
  trendUpText: { color: Colors.accent },
  trendDownText: { color: Colors.danger },
  value: {
    fontSize: Theme.font.sizes.xxl,
    fontWeight: Theme.font.weights.extrabold,
    color: Colors.textPrimary,
  },
  title: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted, fontWeight: Theme.font.weights.medium },
  subtitle: { fontSize: Theme.font.sizes.xs, color: Colors.textSecondary },
});
