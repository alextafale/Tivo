import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Share, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay, withSequence, withTiming
} from 'react-native-reanimated';
import { useSalesStore } from '../../../src/application/stores/salesStore';
import Colors from '../../../constants/Colors';
import Theme from '../../../constants/Theme';
import { Button } from '../../../components/ui/Button';
import { ReceiptView } from '../../../components/pos/ReceiptView';
import { useState } from 'react';
import { ScrollView } from 'react-native';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { saleId } = useLocalSearchParams<{ saleId: string }>();
  const sales = useSalesStore(s => s.sales);
  const sale = sales.find(s => s.id === saleId);

  const [showReceipt, setShowReceipt] = useState(false);

  // Animation
  const checkScale = useSharedValue(0);
  const contentY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 120 }));
    contentY.value = withDelay(400, withSpring(0, { damping: 14 }));
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOpacity.value,
  }));

  if (!sale) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Venta no encontrada</Text>
          <Button label="Volver" onPress={() => router.replace('/(app)/(sales)')} />
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    const lines = sale.items.map(i => `${i.quantity}x ${i.product.name} — $${i.subtotal.toFixed(2)}`).join('\n');
    await Share.share({
      message: `🧾 TICKET ${sale.ticketNumber}\n\n${lines}\n\nTOTAL: $${sale.total.toFixed(2)}\n\nGracias por tu compra — TIVO POS`,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success icon */}
        <Animated.View style={[styles.checkWrapper, checkStyle]}>
          <View style={styles.checkOuter}>
            <View style={styles.checkInner}>
              <MaterialCommunityIcons name="check-bold" size={52} color={Colors.white} />
            </View>
          </View>
        </Animated.View>

        {/* Success message */}
        <Animated.View style={[styles.msgSection, contentStyle]}>
          <Text style={styles.successTitle}>¡Venta completada!</Text>
          <Text style={styles.successSub}>Ticket {sale.ticketNumber}</Text>
          <Text style={styles.totalDisplay}>${sale.total.toFixed(2)}</Text>

          {sale.paymentMethod === 'cash' && sale.change > 0 && (
            <View style={styles.changeBox}>
              <MaterialCommunityIcons name="cash" size={20} color={Colors.accent} />
              <Text style={styles.changeText}>Cambio: <Text style={styles.changeBold}>${sale.change.toFixed(2)}</Text></Text>
            </View>
          )}
        </Animated.View>

        {/* Quick summary */}
        <Animated.View style={[styles.summaryBox, contentStyle]}>
          {sale.items.slice(0, 3).map((item, i) => (
            <View key={i} style={[styles.summaryRow, i < sale.items.length - 1 && i < 2 && styles.summaryBorder]}>
              <Text style={styles.summaryName}>{item.quantity}x {item.product.name}</Text>
              <Text style={styles.summaryPrice}>${item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
          {sale.items.length > 3 && (
            <Text style={styles.moreItems}>+{sale.items.length - 3} más...</Text>
          )}
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actions, contentStyle]}>
          <Button
            label="Ver ticket completo"
            variant="outline"
            fullWidth
            onPress={() => setShowReceipt(true)}
            icon={<MaterialCommunityIcons name="receipt" size={18} color={Colors.primary} />}
          />
          <Button
            label="Compartir ticket"
            variant="secondary"
            fullWidth
            onPress={handleShare}
            icon={<MaterialCommunityIcons name="share-variant" size={18} color={Colors.textPrimary} />}
          />
          <Button
            label="Nueva venta"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.replace('/(app)/(sales)')}
            icon={<MaterialCommunityIcons name="plus" size={20} color={Colors.white} />}
          />
          <Button
            label="Ir al Dashboard"
            variant="ghost"
            fullWidth
            onPress={() => router.replace('/(app)/(dashboard)')}
          />
        </Animated.View>
      </ScrollView>

      {/* Receipt Modal */}
      <Modal visible={showReceipt} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ticket de Venta</Text>
            <Button label="Cerrar" variant="ghost" onPress={() => setShowReceipt(false)} />
          </View>
          <ReceiptView sale={sale} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { alignItems: 'center', padding: Theme.spacing.lg, gap: 24, paddingTop: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { color: Colors.dangerLight, fontSize: Theme.font.sizes.base },
  checkWrapper: { alignItems: 'center' },
  checkOuter: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.successBg,
    alignItems: 'center', justifyContent: 'center',
  },
  checkInner: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    ...Theme.shadow.accent,
  },
  msgSection: { alignItems: 'center', gap: 6 },
  successTitle: { fontSize: Theme.font.sizes.xxl, fontWeight: Theme.font.weights.extrabold, color: Colors.textPrimary },
  successSub: { fontSize: Theme.font.sizes.sm, color: Colors.textMuted },
  totalDisplay: {
    fontSize: Theme.font.sizes.xxxl,
    fontWeight: Theme.font.weights.extrabold,
    color: Colors.accent,
    marginTop: 4,
  },
  changeBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.successBg,
    borderRadius: Theme.radius.sm, padding: 10, marginTop: 8,
  },
  changeText: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary },
  changeBold: { fontWeight: Theme.font.weights.bold, color: Colors.accent },
  summaryBox: {
    width: '100%',
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryName: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary, flex: 1 },
  summaryPrice: { fontSize: Theme.font.sizes.sm, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  moreItems: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted, padding: 10, textAlign: 'center' },
  actions: { width: '100%', gap: 10 },
  modalSafe: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: Theme.font.sizes.lg, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
});
