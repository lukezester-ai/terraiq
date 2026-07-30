import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { MarketPrice, fetchMarketPrices } from "../api";

const CATEGORIES = ["all", "Energy", "Metals", "Agriculture", "Chemicals", "FX"];

export default function MarketsScreen() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filtered, setFiltered] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMarketPrices(category === "all" ? undefined : category)
      .then(setPrices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    if (!search) { setFiltered(prices); return; }
    const q = search.toLowerCase();
    setFiltered(prices.filter(p => p.commodity.toLowerCase().includes(q)));
  }, [search, prices]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Market Prices</Text>

      <TextInput
        style={styles.search}
        placeholder="Search commodities..."
        placeholderTextColor="#6B7280"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {CATEGORIES.map(c => (
          <Text
            key={c}
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            {c === "all" ? "All" : c}
          </Text>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#00D4FF" style={{ marginTop: 40 }} />
      ) : (
        filtered.map((item, i) => (
          <View key={i} style={[styles.row, i === filtered.length - 1 && { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.commodity}>{item.commodity}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <Text style={[styles.change, { color: item.change_24h >= 0 ? "#22C55E" : "#EF4444" }]}>
                {item.change_24h >= 0 ? "+" : ""}{item.change_24h}%
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", color: "#FFF", marginBottom: 16 },
  search: {
    backgroundColor: "#1A1D2E",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#FFF",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2D3E",
  },
  chips: { flexDirection: "row", marginBottom: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A1D2E",
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
    marginRight: 8,
    overflow: "hidden",
  },
  chipActive: { backgroundColor: "#00D4FF", color: "#0B0F19" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1D2E",
  },
  commodity: { fontSize: 15, fontWeight: "500", color: "#FFF", marginBottom: 2 },
  category: { fontSize: 12, color: "#6B7280" },
  price: { fontSize: 16, fontWeight: "600", color: "#FFF" },
  change: { fontSize: 13, fontWeight: "600", marginTop: 2 },
});
