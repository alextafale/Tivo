import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay, withSequence, withTiming
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';
import { Button } from '../../components/ui/Button';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: 'lightning-bolt', label: 'Ventas en segundos', color: Colors.primary },
  { icon: 'robot-outline', label: 'IA integrada', color: Colors.accent },
  { icon: 'chart-line', label: 'Reportes en tiempo real', color: Colors.warning },
  { icon: 'shield-check-outline', label: 'Seguridad empresarial', color: Colors.info },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const contentY = useSharedValue(40);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    contentY.value = withDelay(600, withSpring(0, { damping: 15 }));
    contentOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Background decorations */}
        <View style={styles.orb1} />
        <View style={styles.orb2} />

        {/* Logo */}
        <Animated.View style={[styles.logoSection, logoStyle]}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="point-of-sale" size={52} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>TIVO</Text>
          <Text style={styles.tagline}>Tu POS inteligente</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.featuresSection, contentStyle]}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '20' }]}>
                <MaterialCommunityIcons name={f.icon as any} size={20} color={f.color} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaSection, contentStyle]}>
          <Button
            label="Comenzar ahora"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.replace('/(auth)/login')}
            icon={<MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />}
            iconRight
          />
          <Text style={styles.footerNote}>
            Credenciales demo:{'\n'}admin@tivo.app / 1234
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, padding: Theme.spacing.lg, justifyContent: 'space-between', overflow: 'hidden' },
  orb1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: Colors.primary + '15',
    top: -80, right: -80,
  },
  orb2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.accent + '10',
    bottom: -40, left: -60,
  },
  logoSection: { alignItems: 'center', paddingTop: 40 },
  logoCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    ...Theme.shadow.primary,
  },
  logoText: {
    fontSize: Theme.font.sizes.display,
    fontWeight: Theme.font.weights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 4,
  },
  tagline: { fontSize: Theme.font.sizes.base, color: Colors.textSecondary, marginTop: 4 },
  featuresSection: {
    gap: 14,
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 40, height: 40, borderRadius: Theme.radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: { fontSize: Theme.font.sizes.base, color: Colors.textPrimary, fontWeight: Theme.font.weights.medium },
  ctaSection: { gap: 16, paddingBottom: 8 },
  footerNote: {
    fontSize: Theme.font.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
