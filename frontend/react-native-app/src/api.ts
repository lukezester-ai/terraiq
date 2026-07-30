const API_BASE = __DEV__ ? "http://localhost:8000" : "https://terraiq-api.onrender.com";

export interface MarketPrice {
  commodity: string;
  price: number;
  unit: string;
  change_24h: number;
  category: string;
}

export interface EscrowProposal {
  product_name: string;
  quantity: number;
  price_usdc: number;
  buyer_wallet: string;
  seller_wallet: string;
  delivery_terms: string;
}

export async function fetchMarketPrices(category?: string): Promise<MarketPrice[]> {
  const url = category
    ? `${API_BASE}/markets/prices?category=${category}`
    : `${API_BASE}/markets/prices`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function proposeEscrow(proposal: EscrowProposal) {
  const res = await fetch(`${API_BASE}/execution/escrow/propose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proposal),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function confirmEscrow(escrowId: string) {
  const res = await fetch(`${API_BASE}/execution/escrow/confirm/${escrowId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
