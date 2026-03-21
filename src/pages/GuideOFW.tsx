import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO.tsx';

const GuideOFW: React.FC = () => (
  <>
    <SEO
      title="OFW Gold Investment Guide | YGB Gold"
      description="A guide for Overseas Filipino Workers (OFWs) on buying gold as an investment. Ship to the Philippines or to your country of work with YGB Gold."
      keywords="OFW gold investment, buy gold abroad, gold remittance Philippines, Saudi gold for OFW, 21k gold OFW"
      ogUrl="https://ygbgold.com/guides/ofw"
    />
    <div className="w-full bg-white dark:bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">

        <div className="mb-12">
          <Link to="/" className="text-sm text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 mb-8">
            <span className="material-icons text-sm">arrow_back</span> Back to Home
          </Link>
          <span className="text-primary font-black tracking-[0.6em] text-[10px] uppercase block mb-4">Resources</span>
          <h1 className="text-4xl sm:text-5xl font-black dark:text-white tracking-tighter leading-tight mb-4">
            OFW Gold <span className="text-primary italic">Guide</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
            Trusted by Overseas Filipinos since 2015 — growing wealth through gold, wherever you are.
          </p>
        </div>

        <div className="space-y-10 text-zinc-600 dark:text-zinc-400 leading-relaxed">

          <section>
            <h2 className="text-2xl font-black dark:text-white tracking-tight mb-3">Why OFWs Choose Gold</h2>
            <p className="mb-4">Gold is one of the most reliable stores of value — it holds purchasing power over time, is universally recognized, and is easy to pass on to family. For OFWs sending money home, buying gold instead of cash remittance means your hard-earned money works harder.</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">trending_up</span><span><strong className="dark:text-white">Gold grows:</strong> The gold price has increased over 500% in the last 20 years.</span></li>
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">savings</span><span><strong className="dark:text-white">Better than cash:</strong> Unlike peso savings, gold is not affected by inflation or currency fluctuation.</span></li>
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">family_restroom</span><span><strong className="dark:text-white">A gift that lasts:</strong> Gold jewelry is a meaningful, lasting gift for family in the Philippines.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black dark:text-white tracking-tight mb-3">Which Gold is Best for OFWs?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
                <p className="font-black text-primary text-xl mb-1">21K Saudi Gold</p>
                <p className="text-sm font-bold dark:text-white mb-2">Most popular with Middle East OFWs</p>
                <p className="text-sm">Widely recognized, easy to resell, and carries a premium in the Philippine market. Perfect for gifting or investment.</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
                <p className="font-black text-primary text-xl mb-1">18K Japan Gold</p>
                <p className="text-sm font-bold dark:text-white mb-2">Popular with Japan & Korea OFWs</p>
                <p className="text-sm">Elegant, durable, and wearable every day. A great investment that can be worn as jewelry too.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black dark:text-white tracking-tight mb-3">How to Order from Abroad</h2>
            <div className="space-y-3">
              {[
                'Browse the YGB Gold shop and reserve your item online.',
                'Pay via GCash (international top-up supported) or BPI bank transfer.',
                'Choose your shipping destination — we ship to your country or directly to your family in the Philippines.',
                'Receive a tracking number and delivery confirmation email.',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-black text-zinc-900">{i + 1}</span>
                  </div>
                  <p className="text-sm mt-1">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black dark:text-white tracking-tight mb-3">We Ship to OFW Destinations</h2>
            <div className="flex flex-wrap gap-2">
              {['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'Taiwan', 'Australia', 'Canada', 'United States', 'Spain', 'Thailand'].map(c => (
                <span key={c} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium">{c}</span>
              ))}
            </div>
          </section>

          <section className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
            <h2 className="text-lg font-black dark:text-white tracking-tight mb-2">Ready to invest?</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Browse our current gold inventory or message Yhen directly for assistance.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-zinc-900 font-bold rounded-xl hover:brightness-110 transition-all text-sm">
                <span className="material-icons text-sm">storefront</span> Browse Gold
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-sm">
                <span className="material-icons text-sm">chat</span> Ask Yhen
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  </>
);

export default GuideOFW;
