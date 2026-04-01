import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "#161b26",
        borderTopColor: "rgba(255,255,255,0.07)",
        height: 60,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: "#e8c35a",
      tabBarInactiveTintColor: "#64748b",
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: "600",
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Cars",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>🚗</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}