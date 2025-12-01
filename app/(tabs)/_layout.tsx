// template
import { Tabs, useRouter } from "expo-router";
import { Users, Bell, Search, Dumbbell, LogOut } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, Alert } from "react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthProvider";

export default function TabLayout() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'יציאה מהמערכת',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'יציאה',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              marginRight: 16,
              padding: 8,
              borderRadius: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <LogOut size={22} color="#ef4444" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="reminders"
        options={{
          title: "תזכורות",
          tabBarIcon: ({ color }) => <Bell color={color} />,
          tabBarBadge: undefined,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "מאבטחים",
          tabBarIcon: ({ color }) => <Users color={color} />,
        }}
      />
      <Tabs.Screen
        name="investigations"
        options={{
          title: "תחקיר",
          tabBarIcon: ({ color }) => <Search color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "תרגילים",
          tabBarIcon: ({ color }) => <Dumbbell color={color} />,
        }}
      />
    </Tabs>
  );
}
