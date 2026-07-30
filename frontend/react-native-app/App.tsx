import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from "react-native";
import DashboardScreen from "./src/screens/DashboardScreen";
import MarketsScreen from "./src/screens/MarketsScreen";
import TradesScreen from "./src/screens/TradesScreen";

type Screen = "Dashboard" | "Markets" | "Trades";

const TABS: { key: Screen; label: string }[] = [
  { key: "Dashboard", label: "Dashboard" },
  { key: "Markets", label: "Markets" },
  { key: "Trades", label: "Escrow" },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("Dashboard");

  const renderScreen = () => {
    switch (screen) {
      case "Dashboard": return <DashboardScreen navigation={{ navigate: setScreen }} />;
      case "Markets": return <MarketsScreen />;
      case "Trades": return <TradesScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <View style={styles.body}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, screen === tab.key && styles.tabActive]}
            onPress={() => setScreen(tab.key)}
          >
            <Text style={[styles.tabLabel, screen === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },
  body: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1A1D2E",
    borderTopWidth: 1,
    borderTopColor: "#2A2D3E",
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: "#00D4FF",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  tabLabelActive: {
    color: "#00D4FF",
  },
});
