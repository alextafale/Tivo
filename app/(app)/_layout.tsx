import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCartStore } from '../../src/application/stores/cartStore';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

function TabIcon({
  name, color, size, badge,
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  size: number;
  badge?: number;
}) {
  return (
    <View>
      <MaterialCommunityIcons name={name} size={size} color={color} />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          {/* badge indicator */}
        </View>
      )}
    </View>
  );
}

export default function AppLayout() {
  const itemCount = useCartStore(s => s.itemCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="(dashboard)"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="view-dashboard-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="(sales)"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color, size }) => (
            <View>
              <TabIcon name="cart-outline" color={color} size={size} />
              {itemCount > 0 && <View style={[styles.badge, { backgroundColor: Colors.accent }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(inventory)"
        options={{
          title: 'Inventario',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="package-variant-closed" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="(reports)"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="chart-bar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="(customers)"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="account-group-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgSurface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 4,
    height: 60,
    ...Theme.shadow.lg,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabItem: { paddingVertical: 2 },
  badge: {
    position: 'absolute',
    top: -2, right: -4,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.bgSurface,
  },
});
