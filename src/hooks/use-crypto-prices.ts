import { useEffect, useState } from "react";

export type PriceSymbol = "bitcoin" | "ethereum" | "solana";
export type PricesState = Record<PriceSymbol, { usd: number; change24h: number } | undefined>;

export function useCryptoPrices(refreshMs: number = 30000) {
  const [prices, setPrices] = useState<PricesState>({ bitcoin: undefined, ethereum: undefined, solana: undefined });
  const [loading, setLoading] = useState(true);

  async function fetchPrices() {
    try {
      const url =
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch prices");
      const data = await res.json();
      setPrices({
        bitcoin: { usd: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change },
        ethereum: { usd: data.ethereum.usd, change24h: data.ethereum.usd_24h_change },
        solana: { usd: data.solana.usd, change24h: data.solana.usd_24h_change },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  return { prices, loading };
}
