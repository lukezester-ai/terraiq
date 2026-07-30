import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { MarketPrice, fetchMarketPrices } from "../api";

export default function DashboardScreen({ navigation }: any) {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketPrices()
      .then(setPrices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topMovers = [...prices]
    .sort((a, b) => Math.abs(b.change_24h) - Math.abs(a.change_24h))
    .slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>TerraIQ</Text>
        <Text style={styles.subtitle}>Global Commodity Intelligence</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Markets")}>
          <Text style={styles.actionTitle}>Markets</Text>
          <Text style={styles.actionDesc}>Live commodity prices</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Trades")}>
          <Text style={styles.actionTitle}>Escrow</Text>
          <Text style={styles.actionDesc}>Web3 settlements</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Top Movers</Text>
      {loading ? (
        <ActivityIndicator color="#00D4FF" />
      ) : (
        topMovers.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.commodity}>{item.commodity}</Text>
            <Text style={styles.price}>${item.price}/{item.unit}</Text>
            <Text style={[styles.change, { color: item.change_24h >= 0 ? "#22C55E" : "#EF4444" }]}>
              {item.change_24h >= 0 ? "+" : ""}{item.change_24h}%
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },
  content: { padding: 20, paddingTop: 60 },
  header: { marginBottom: 28 },
  logo: { fontSize: 28, fontWeight: "700", color: "#00D4FF" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  quickActions: { flexDirection: "row", gap: 12, marginBottom: 28 },
  actionCard: {
    flex: 1,
    backgroundColor: "#1A1D2E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2A2D3E",
  },
  actionTitle: { fontSize: 18, fontWeight: "600", color: "#FFF", marginBottom: 4 },
  actionDesc: { fontSize: 12, color: "#6B7280" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#D1D5DB", marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A1D2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  commodity: { fontSize: 15, fontWeight: "500", color: "#FFF", flex: 1 },
  price: { fontSize: 14, color: "#D1D5DB", marginRight: 12 },
  change: { fontSize: 14, fontWeight: "600", width: 60, textAlign: "right" },
});
