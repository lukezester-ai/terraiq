import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { proposeEscrow } from "../api";

export default function TradesScreen() {
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [buyerWallet, setBuyerWallet] = useState("");
  const [sellerWallet, setSellerWallet] = useState("");
  const [terms, setTerms] = useState("CIF");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!product || !quantity || !price || !buyerWallet || !sellerWallet) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await proposeEscrow({
        product_name: product,
        quantity: parseFloat(quantity),
        price_usdc: parseFloat(price),
        buyer_wallet: buyerWallet,
        seller_wallet: sellerWallet,
        delivery_terms: terms,
      });
      Alert.alert("Escrow Proposed", `ID: ${res.escrow_id}\nContinue on kontor21 to sign with MetaMask.`);
      setProduct(""); setQuantity(""); setPrice(""); setBuyerWallet(""); setSellerWallet("");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Escrow Trade</Text>
      <Text style={styles.subtitle}>Propose a USDC-settled commodity trade</Text>

      <TextInput style={styles.input} placeholder="Product" placeholderTextColor="#6B7280" value={product} onChangeText={setProduct} />
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Quantity (tons)" placeholderTextColor="#6B7280" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Price (USDC)" placeholderTextColor="#6B7280" keyboardType="numeric" value={price} onChangeText={setPrice} />
      </View>
      <TextInput style={styles.input} placeholder="Buyer Wallet (0x...)" placeholderTextColor="#6B7280" value={buyerWallet} onChangeText={setBuyerWallet} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Seller Wallet (0x...)" placeholderTextColor="#6B7280" value={sellerWallet} onChangeText={setSellerWallet} autoCapitalize="none" />

      <View style={styles.chips}>
        {["CIF", "FOB", "DAP", "EXW"].map(t => (
          <Text key={t} style={[styles.chip, terms === t && styles.chipActive]} onPress={() => setTerms(t)}>
            {t}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#0B0F19" />
        ) : (
          <Text style={styles.buttonText}>Propose Escrow</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 24 },
  input: {
    backgroundColor: "#1A1D2E",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#FFF",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2D3E",
  },
  row: { flexDirection: "row" },
  chips: { flexDirection: "row", marginBottom: 24, gap: 8 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1A1D2E",
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    overflow: "hidden",
  },
  chipActive: { backgroundColor: "#00D4FF", color: "#0B0F19" },
  button: {
    backgroundColor: "#00D4FF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#0B0F19" },
});
