
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: "#673ab7",
      headerShadowVisible: false,
      tabBarInactiveTintColor: "#888",
      tabBarStyle: {
        backgroundColor: "#fff",
        borderTopWidth: 0,
        elevation: 0,
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Today's Habits",
          tabBarIcon: ({ color }) => 
            <MaterialCommunityIcons name="calendar-today" color={color} size={24} />,
        }}
      />
      <Tabs.Screen name="streak" options=
      {{ title: "Streaks",
        tabBarIcon: ({ color}) =>
          <MaterialCommunityIcons name="chart-line-variant" size={24} color={color} /> 
      }}
      />
      <Tabs.Screen name="add-habit" options=
      {{ title: "Add Habit",
        tabBarIcon: ({ color}) => 
          <MaterialCommunityIcons name="plus-circle" size={24} color={color} /> 
      }}
      />
    </Tabs>
  );
}
