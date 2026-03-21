import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO.tsx';

const GuidePurity: React.FC = () => (
  <>
    <SEO
      title="Gold Purity Guide — 18K, 21K, 22K & 24K Explained | YGB Gold"
      description="Learn the difference between 18K, 21K, 22K, and 24K gold. Understand purity, value, and which type suits your investment goals."
      keywords="18k gold, 21k Saudi gold, 22k gold, 24k pure gold, gold purity guide Philippines"
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
            Understanding karat ratings and what they mean for your investment.
          </p>
        </div>

        <div className="space-y-10 text-zinc-600 dark:text-zinc-400 leading-relaxed">

          <section>
            <h2 className="text-2xl font-black dark:text-white tracking-tight mb-4">What is Karat (K)?</h2>
            <p>Karat measures how much pure gold is in a piece of jewelry or bullion. Pure gold is 24K — meaning 24 out of 24 parts are gold. Lower karats contain other metals like silver or copper, which add durability and affect color.</p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { k: '18K', pct: '75%', label: 'Japan & European Gold', desc: 'Popular for fine jewelry. Durable and holds a rich gold color. Common in Japanese, Korean, and European markets.' },
              { k: '21K', pct: '87.5%', label: 'Saudi Gold', desc: 'Highly popular with OFWs returning from the Middle East. Slightly deeper color than 18K, excellent value.' },
              { k: '22K', pct: '91.7%', label: 'Traditional Gold', desc: 'Very high purity with a vivid yellow tone. Common in Indian and Middle Eastern jewelry traditions.' },
              { k: '24K', pct: '99.9%', label: 'Pure Investment Gold', desc: 'The purest form of gold. Ideal for coins and bars. Too soft for everyday jewelry but highest resale value.' },
            ].map(({ k, pct, label, desc }) => (
              <div key={k} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-black text-primary">{k}</span>
                  <div>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">{pct} Gold</p>
                    <p className="text-sm font-bold dark:text-white">{label}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className="text-2xl font-black dark:text-white tracking-tight mb-4">Which Karat Should I Buy?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">check_circle</span><span><strong className="dark:text-white">For wearable jewelry:</strong> 18K or 21K — beautiful, durable, and widely available from YGB.</span></li>
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">check_circle</span><span><strong className="dark:text-white">For gifting or OFW remittances:</strong> 21K Saudi Gold — most recognized and easy to resell worldwide.</span></li>
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">check_circle</span><span><strong className="dark:text-white">For long-term investment:</strong> 24K coins or bars — highest purity, closest to spot gold price.</span></li>
            </ul>
          </section>

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

export default GuidePurity;
