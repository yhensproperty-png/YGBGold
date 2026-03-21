const CACHE_KEY = 'ygb_usd_php_rate';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getUSDPerPHP(): Promise<number | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { rate, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) return rate;
    }

    const res = await fetch('https://api.exchangerate-api.com/v4/latest/PHP');
    if (!res.ok) return null;
    const data = await res.json();
    const rate: number = data.rates?.USD ?? null;
    if (!rate) return null;

    localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }));
    return rate;
  } catch {
    return null;
  }
}

export function phpToUSD(phpAmount: number, rate: number): string {
  return (phpAmount * rate).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
