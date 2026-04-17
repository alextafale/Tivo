import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useInventoryStore } from '../src/application/stores/inventoryStore';
import { useSalesStore } from '../src/application/stores/salesStore';
import { useCustomerStore } from '../src/application/stores/authStore';

export default function RootLayout() {
  const loadInventory = useInventoryStore(s => s.load);
  const loadSales = useSalesStore(s => s.load);
  const loadCustomers = useCustomerStore(s => s.load);

  useEffect(() => {
    loadInventory();
    loadSales();
    loadCustomers();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
