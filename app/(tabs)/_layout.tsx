import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

function TabIcon({ name, focused, color }: { name: any; focused: boolean; color: string }) {
  return (
    <View style={focused ? iconStyles.activeWrap : null}>
      <Ionicons name={name} size={24} color={color} />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  activeWrap: {
    backgroundColor: 'rgba(231,99,59,0.12)',
    borderRadius: 12, padding: 4, marginTop: -2,
  },
});

export default function TabLayout() {
  const colors = useColors();
  const { state } = useApp();
  const lang = state.language;

  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'CV',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'document-text' : 'document-text-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: t('Jobs', 'Kazi'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'briefcase' : 'briefcase-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prep"
        options={{
          title: t('Prep', 'Jiandae'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'school' : 'school-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('Profile', 'Wasifu'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
