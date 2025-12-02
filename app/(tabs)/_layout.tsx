// template
import { Tabs } from "expo-router";
import { Users, Bell, Search, Dumbbell } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: true,
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
