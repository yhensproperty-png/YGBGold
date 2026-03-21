import React, { useState, useEffect } from 'react';

interface PeriodRow {
  label: string;
  years: number;
  startPrice: number;
  startDate: string;
}

const PERIODS: PeriodRow[] = [
  { label: '5 Years',  years: 5,  startPrice: 1740, startDate: 'Mar 2021' },
  { label: '10 Years', years: 10, startPrice: 1255, startDate: 'Mar 2016' },
  { label: '15 Years', years: 15, startPrice: 1417, startDate: 'Mar 2011' },
  { label: '20 Years', years: 20, startPrice: 555,  startDate: 'Mar 2006' },
  { label: '25 Years', years: 25, startPrice: 260,  startDate: 'Mar 2001' },
  { label: '30 Years', years: 30, startPrice: 395,  startDate: 'Mar 1996' },
];

const FALLBACK_PRICE = 4660;
// v2 cache key — busts any stale v1 cache with wrong $3,100 value
const CACHE_KEY = 'ygb_gold_price_v2';
const CACHE_TS_KEY = 'ygb_gold_price_v2_ts';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function calcReturns(start: number, end: number, years: number) {
  const totalReturn = ((end - start) / start) * 100;
  const cagr = (Math.pow(end / start, 1 / years) - 1) * 100;
  return { totalReturn, cagr };
}

async function fetchLiveGoldPrice(): Promise<number | null> {
  // Try metals.live first
  try {
    const res = await fetch('https://metals.live/api/v1/spot', { signal: AbortSignal.timeout(5000) });
    const data: { gold?: number }[] = await res.json();
    const gold = data?.[0]?.gold;
    if (gold && gold > 1000) return gold;
  } catch {
    // fall through
  }

  // Try frankfurter/open exchange as a proxy — XAU USD
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=XAU&to=USD', { signal: AbortSignal.timeout(5000) });
    const data: { rates?: { USD?: number } } = await res.json();
    const usd = data?.rates?.USD;
    if (usd && usd > 1000) return usd;
  } catch {
    // fall through
  }

  return null;
}

const GoldLongTermPerformance: React.FC = () => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTs = localStorage.getItem(CACHE_TS_KEY);
    if (cached && cachedTs && Date.now() - parseInt(cachedTs) < CACHE_TTL) {
      const parsed = parseFloat(cached);
      if (parsed > 1000) {
        setCurrentPrice(parsed);
        setLoading(false);
        return;
      }
    }

    fetchLiveGoldPrice()
      .then(gold => {
        if (gold) {
          setCurrentPrice(gold);
          localStorage.setItem(CACHE_KEY, String(gold));
          localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
        } else {
          setCurrentPrice(FALLBACK_PRICE);
        }
      })
      .catch(() => setCurrentPrice(FALLBACK_PRICE))
      .finally(() => setLoading(false));
  }, []);

  const price = currentPrice ?? FALLBACK_PRICE;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <span className="text-primary font-bold tracking-[0.5em] text-[10px] uppercase">Historical Returns</span>
        <div className="mt-3">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
            Gold Long-Term
          </h2>
          <p className="text-zinc-400 mt-3 text-sm font-medium">
            Based on live XAU/USD spot price · Updates hourly
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="flex flex-col flex-1 bg-zinc-900 border border-zinc-700 rounded-3xl p-4 sm:p-6 min-h-[400px]">
        {/* Table header */}
        <div className="flex justify-between mb-3 px-2">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Period</span>
          <div className="flex gap-3">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest w-14 text-right">Return</span>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest w-14 text-right">CAGR</span>
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2 flex-1 justify-around">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="material-icons animate-spin text-primary text-3xl">sync</span>
            </div>
          ) : (
            PERIODS.map(({ label, years, startPrice, startDate }) => {
              const { totalReturn, cagr } = calcReturns(startPrice, price, years);
              return (
                <div
                  key={label}
                  className="flex items-center justify-between bg-zinc-800/60 hover:bg-zinc-800 transition-colors rounded-2xl px-3 py-3"
                >
                  <div className="min-w-0 overflow-hidden">
                    <p className="text-white font-black text-sm whitespace-nowrap">{label}</p>
                    <p className="text-zinc-500 text-[10px] font-medium whitespace-nowrap">{startDate}</p>
                  </div>
                  <div className="flex gap-3 shrink-0 ml-2">
                    <span className="text-emerald-400 font-black text-sm w-14 text-right">+{totalReturn.toFixed(0)}%</span>
                    <span className="text-emerald-300 font-bold text-sm w-14 text-right">+{cagr.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default GoldLongTermPerformance;
