import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO.tsx';

const PURITY_RATES: Record<string, number> = { '18': 0.75, '21': 0.875, '24': 0.999 };

const GuidePurity: React.FC = () => {
  const [grams, setGrams] = useState('');
  const [karat, setKarat] = useState('18');

  const pureGold = grams && !isNaN(Number(grams))
    ? (Number(grams) * PURITY_RATES[karat]).toFixed(2)
    : null;

  return (
    <>
      <SEO
        title="Gold Purity Guide — 18K Japan, 21K Saudi, 24K Hong Kong | YGB Gold"
        description="Understand the three tiers YGB Gold sells: 18K Japan Gold, 21K Saudi Gold, and 24K Hong Kong Chuk Kam. Includes a gold calculator and hallmark guide."
        keywords="18k Japan gold, 21k Saudi gold, 24k Hong Kong Chuk Kam, gold purity guide Philippines, gold hallmark 750 875 999"
        ogUrl="https://ygbgold.com/guides/purity"
      />
      <div className="w-full bg-white dark:bg-zinc-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-20">

          <div className="mb-12">
            <Link to="/" className="text-sm text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 mb-8">
              <span className="material-icons text-sm">arrow_back</span> Back to Home
            </Link>
            <span className="text-primary font-black tracking-[0.6em] text-[10px] uppercase block mb-4">Resources</span>
            <h1 className="text-4xl sm:text-5xl font-black dark:text-white tracking-tighter leading-tight mb-4">
              Gold Purity <span className="text-primary italic">Guide</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
              YGB Gold sources from four world-renowned regions. We offer three focused tiers — giving investors clear, trusted choices with no confusion.
            </p>
          </div>

          <div className="space-y-10 text-zinc-600 dark:text-zinc-400 leading-relaxed">

            {/* The Three Tiers */}
            <section>
              <h2 className="text-2xl font-black dark:text-white tracking-tight mb-6">The Three Tiers We Sell</h2>
              <div className="space-y-4">

                {/* 18K Japan */}
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-black text-primary">18K</span>
                    </div>
                    <div>
                      <p className="font-black dark:text-white text-lg leading-tight">Japan Gold</p>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">75% Pure · Daily Luxury</p>
                    </div>
                  </div>
                  <p className="text-sm">Japanese gold is celebrated for its precision craftsmanship and refined finish. At 75% purity, 18K is the perfect balance of durability and richness — ideal for everyday jewelry that holds its beauty and value over decades. If you want gold you can wear and cherish daily without worry, this is your tier.</p>
                </div>

                {/* 21K Saudi */}
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-black text-primary">21K</span>
                    </div>
                    <div>
                      <p className="font-black dark:text-white text-lg leading-tight">Saudi Arabia Gold</p>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">87.5% Pure · Investment Standard</p>
                    </div>
                  </div>
                  <p className="text-sm">Saudi 21K is the global standard for investment-grade jewelry. Renowned for its deep, rich yellow colour and ability to hold intricate designs while retaining high intrinsic value. Universally recognized and easy to resell worldwide — the most popular choice among OFWs and serious collectors. Every gram carries real wealth.</p>
                </div>

                {/* 24K HK/China */}
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-black text-primary">24K</span>
                    </div>
                    <div>
                      <p className="font-black dark:text-white text-lg leading-tight">Hong Kong & China Gold <span className="text-sm font-bold text-zinc-400">(足金 Chuk Kam)</span></p>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">99.9–99.99% Pure · Pure Wealth</p>
                    </div>
                  </div>
                  <p className="text-sm">Chuk Kam — meaning "pure gold" in Cantonese — is the ultimate tier for serious investors and heritage pieces. Strictly 99.9% to 99.99% purity, sourced from Hong Kong and China where gold standards are among the strictest in the world. Its vivid, warm colour is unmistakable. If preserving generational wealth is your goal, this is the pinnacle.</p>
                </div>

              </div>

              <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-4">
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  <strong>Note:</strong> YGB Gold strictly sells 18K, 21K, and 24K. We do not sell 22K — this keeps our sourcing focused and gives investors three clear, trusted tiers to choose from.
                </p>
              </div>
            </section>

            {/* Hallmark Guide */}
            <section>
              <h2 className="text-2xl font-black dark:text-white tracking-tight mb-4">Hallmark Guide — What to Look For</h2>
              <p className="text-sm mb-4">Genuine gold is stamped with a hallmark. Here's what you'll see on YGB Gold pieces:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { karat: '18K Japan', stamp: '750', sub: 'Stamped "750" — 750 parts per 1000', color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300' },
                  { karat: '21K Saudi', stamp: '875 / 21K', sub: 'Stamped "875" or "21K"', color: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
                  { karat: '24K HK/China', stamp: '999 / 足金', sub: 'Stamped "999" or "足金" (Chuk Kam)', color: 'from-primary/5 to-primary/10', border: 'border-primary/20', text: 'text-primary' },
                ].map(({ karat, stamp, sub, color, border, text }) => (
                  <div key={karat} className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-5 text-center`}>
                    <p className={`text-3xl font-black ${text} mb-2`}>{stamp}</p>
                    <p className="text-sm font-bold dark:text-white">{karat}</p>
                    <p className="text-xs text-zinc-500 mt-1">{sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Calculator */}
            <section className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-black dark:text-white tracking-tight mb-1">Gold Content Calculator</h2>
              <p className="text-sm text-zinc-500 mb-5">Estimate the pure gold content in any piece you're considering.</p>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 block mb-2">Weight (grams)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={grams}
                    onChange={e => setGrams(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 block mb-2">Karat</label>
                  <select
                    value={karat}
                    onChange={e => setKarat(e.target.value)}
                    style={{ backgroundImage: 'none' }}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="18">18K — Japan Gold (75%)</option>
                    <option value="21">21K — Saudi Gold (87.5%)</option>
                    <option value="24">24K — HK/China Gold (99.9%)</option>
                  </select>
                </div>
              </div>
              {pureGold ? (
                <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-4">
                  <p className="text-sm text-zinc-500 mb-1">Pure gold content</p>
                  <p className="text-3xl font-black text-primary">{pureGold}g</p>
                  <p className="text-xs text-zinc-400 mt-1">{grams}g of {karat}K gold contains {pureGold}g of pure gold ({(PURITY_RATES[karat] * 100).toFixed(1)}% purity)</p>
                </div>
              ) : (
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-5 py-4 text-center text-sm text-zinc-400">
                  Enter a weight above to calculate
                </div>
              )}
            </section>

            {/* CTA */}
            <section className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
              <h2 className="text-lg font-black dark:text-white tracking-tight mb-2">Have a question about a specific piece?</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Yhen personally verifies the purity of every item before listing. Message us anytime.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-zinc-900 font-bold rounded-xl hover:brightness-110 transition-all text-sm">
                  <span className="material-icons text-sm">chat</span> Contact Yhen
                </Link>
                <a href="https://m.me/Goldelyn" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #0084FF 0%, #A033FF 100%)' }}>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.131 3.26L19.752 8.1l-6.561 6.863z"/></svg>
                  Message on Messenger
                </a>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
};

export default GuidePurity;
