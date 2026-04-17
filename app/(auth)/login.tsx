import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/application/stores/authStore';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('admin@tivo.app');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    const ok = await login(email.trim(), password);
    if (ok) {
      router.replace('/(app)/(dashboard)');
    } else {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoMini}>
              <MaterialCommunityIcons name="point-of-sale" size={28} color={Colors.white} />
            </View>
            <Text style={styles.title}>Bienvenido a TIVO</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Input
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="email-outline"
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              isPassword
              leftIcon="lock-outline"
              containerStyle={{ marginTop: 16 }}
            />

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label={isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleLogin}
              style={{ marginTop: 24 }}
            />

            <View style={styles.demoBox}>
              <MaterialCommunityIcons name="information-outline" size={14} color={Colors.info} />
              <Text style={styles.demoText}>Demo: admin@tivo.app / 1234</Text>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Protegido con autenticación segura · TIVO v1.0
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, padding: Theme.spacing.lg, justifyContent: 'center', gap: 24 },
  header: { alignItems: 'center', gap: 8 },
  logoMini: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...Theme.shadow.primary,
  },
  title: { fontSize: Theme.font.sizes.xxl, fontWeight: Theme.font.weights.extrabold, color: Colors.textPrimary },
  subtitle: { fontSize: Theme.font.sizes.base, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.dangerBg,
    borderRadius: Theme.radius.sm,
    padding: 10, marginTop: 12,
  },
  errorText: { fontSize: Theme.font.sizes.sm, color: Colors.danger, flex: 1 },
  demoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.infoBg,
    borderRadius: Theme.radius.sm,
    padding: 10, marginTop: 16,
  },
  demoText: { fontSize: Theme.font.sizes.xs, color: Colors.info },
  footer: { textAlign: 'center', fontSize: Theme.font.sizes.xs, color: Colors.textMuted },
});
