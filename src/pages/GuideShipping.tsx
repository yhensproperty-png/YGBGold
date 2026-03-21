import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO.tsx';

const GuideShipping: React.FC = () => (
  <>
    <SEO
      title="Shipping & Security Guide | YGB Gold"
      description="How YGB Gold ships gold jewelry safely across the Philippines and worldwide. Learn about packaging, tracking, and delivery security."
      keywords="gold shipping Philippines, buy gold online delivery, safe gold delivery, YGB shipping guide"
      ogUrl="https://ygbgold.com/guides/shipping"
    />
    <div className="w-full bg-white dark:bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">

        <div className="mb-12">
          <Link to="/" className="text-sm text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 mb-8">
            <span className="material-icons text-sm">arrow_back</span> Back to Home
          </Link>
          <span className="text-primary font-black tracking-[0.6em] text-[10px] uppercase block mb-4">Resources</span>
          <h1 className="text-4xl sm:text-5xl font-black dark:text-white tracking-tighter leading-tight mb-4">
            Shipping & <span className="text-primary italic">Security</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
            YGB sources directly from Japan, Saudi Arabia, Hong Kong, and China — and ships to customers across the Philippines and worldwide. Here's exactly how we get your gold to you safely.
          </p>
        </div>

        <div className="space-y-10 text-zinc-600 dark:text-zinc-400 leading-relaxed">

          <section>
            <h2 className="text-2xl font-black dark:text-white tracking-tight mb-4">How It Works</h2>
            <div className="space-y-4">
              {[
                { icon: 'shopping_bag', title: 'Reserve Your Item', desc: 'Place your order through the website. You\'ll receive an invoice email with payment details (GCash or BPI Bank) instantly.' },
                { icon: 'payments', title: 'Send Payment', desc: 'Complete payment via GCash or BPI Bank and include your Order Reference Number. Once payment is confirmed, Yhen personally prepares your item.' },
                { icon: 'inventory_2', title: 'Packed & Insured', desc: 'Every order is carefully packed for safe transit. We use trusted carriers and discreet packaging for your privacy.' },
                { icon: 'local_shipping', title: 'Shipped with Tracking', desc: 'You\'ll receive a shipment confirmation email with your tracking number and carrier details so you can follow your order every step of the way.' },
              ].map(({ icon, title, desc }, i) => (
                <div key={i} className="flex items-start gap-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-primary text-lg">{icon}</span>
                  </div>
                  <div>
                    <p className="font-bold dark:text-white mb-1">{title}</p>
                    <p className="text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black dark:text-white tracking-tight mb-4">Shipping Destinations & Fees</h2>
            <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
              {[
                { dest: 'Philippines (LBC)', fee: '₱300', time: '2–5 business days' },
                { dest: 'Singapore / Hong Kong / Taiwan', fee: '₱3,000', time: '5–10 business days' },
                { dest: 'Thailand / Korea / Japan / Australia', fee: '₱3,500', time: '7–14 business days' },
                { dest: 'Canada / United States', fee: '₱4,000', time: '10–21 business days' },
              ].map(({ dest, fee, time }, i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-4 ${i % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-900/50' : 'bg-white dark:bg-zinc-950'}`}>
                  <div>
                    <p className="font-bold text-sm dark:text-white">{dest}</p>
                    <p className="text-xs text-zinc-400">{time}</p>
                  </div>
                  <span className="font-black text-primary">{fee}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black dark:text-white tracking-tight mb-4">Security & Authenticity</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">verified</span><span>Every item is personally verified by Yhen before listing and before shipping.</span></li>
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">verified</span><span>Gold is sourced directly from trusted wholesalers — no middlemen.</span></li>
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">verified</span><span>Discreet packaging — contents are not visible or labelled on the outside.</span></li>
              <li className="flex items-start gap-3"><span className="material-icons text-primary text-sm mt-1">verified</span><span>Tracking number provided for every international shipment.</span></li>
            </ul>
          </section>

          <section className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
            <h2 className="text-lg font-black dark:text-white tracking-tight mb-2">Questions about your order?</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Reach out via WhatsApp or email — Yhen responds personally.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-zinc-900 font-bold rounded-xl hover:brightness-110 transition-all text-sm">
                <span className="material-icons text-sm">chat</span> Get in Touch
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

export default GuideShipping;
