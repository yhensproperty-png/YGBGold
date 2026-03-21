import React, { useState, useRef, useEffect } from 'react';
import GoldLongTermPerformance from '../components/GoldLongTermPerformance';
import { Link } from 'react-router-dom';
import { PropertyListing, PropertyType } from '../types.ts';
import { SEO } from '../components/SEO';

const WHATSAPP_NUMBER = "639467543767";

interface HomeProps {
  properties: PropertyListing[];
  isLoading?: boolean;
}


export const PropertyCard: React.FC<{ property: PropertyListing }> = ({ property }) => {
  const dateListedFormatted = property.dateListed
    ? new Date(property.dateListed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  const dateUpdatedFormatted = property.dateUpdated
    ? new Date(property.dateUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const propertyUrl = `${window.location.origin}/item/${property.slug}`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(propertyUrl).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowShareMenu(false); }, 1800);
    });
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = encodeURIComponent(`Check out this item: "${property.title}" in ${property.city}\n${propertyUrl}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`;
    window.open(facebookShareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const handleShareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(v => !v);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-all flex flex-col h-full group">
      <Link to={`/item/${property.slug}`} className="block">
        <div className="relative h-48 sm:h-56 md:h-64 shrink-0 overflow-hidden rounded-t-2xl">
          <img
            src={property.images[property.featuredImageIndex ?? 0] ?? property.images[0]}
            alt={`${property.title} in ${property.city}`}
            loading="lazy"
            width="800"
            height="600"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-primary text-zinc-900 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider">
              {property.status.toUpperCase()}
            </div>
          </div>
          {property.featured && (
            <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur text-primary border border-primary/30 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest shadow-lg">
              FEATURED
            </div>
          )}
          <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-3 py-1 rounded-lg">
            <span className="font-bold dark:text-white">
              ₱{property.price.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <div className="flex flex-col">
            <p className="text-zinc-400 text-[11px] flex items-center gap-1 uppercase tracking-wider font-semibold">
              <span className="material-icons text-xs">place</span> {property.city}, {property.barangay}
            </p>
            {property.condoName && (
              <p className="text-primary text-[10px] font-semibold mt-0.5">{property.condoName}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-[11px] italic">
              Listed on {dateListedFormatted}
            </p>
            {dateUpdatedFormatted && (
              <p className="text-zinc-500 text-[10px] italic mt-0.5">
                Updated on {dateUpdatedFormatted}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-start justify-between gap-2 mb-4">
          <Link to={`/item/${property.slug}`} className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold dark:text-white truncate hover:text-primary transition-colors">{property.title}</h3>
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded flex-shrink-0">#{property.listing_id}</span>
            </div>
          </Link>
          <div className="relative flex-shrink-0" ref={shareRef}>
            <button
              onClick={handleShareToggle}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-primary hover:text-zinc-900 text-zinc-500 dark:text-zinc-400 transition-all"
              title="Share"
            >
              <span className="material-icons text-[18px]">share</span>
            </button>
            {showShareMenu && (
              <div className="absolute right-0 top-10 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl w-44 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="material-icons text-[18px] text-zinc-400">{copied ? 'check_circle' : 'link'}</span>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 mx-3"></div>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <svg className="w-[18px] h-[18px] fill-[#25D366] flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 mx-3"></div>
                <button
                  onClick={handleShareFacebook}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <svg className="w-[18px] h-[18px] fill-[#1877F2] flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col items-center text-center px-1">
            <span className="material-icons text-primary text-xl block mb-1">diamond</span>
            <div className="h-6 flex items-center justify-center w-full">
              <span className="font-black text-sm dark:text-white leading-none">{property.beds}K</span>
            </div>
            <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest mt-1">Purity</span>
          </div>
          <div className="flex flex-col items-center text-center px-1">
            <span className="material-icons text-primary text-xl block mb-1">scale</span>
            <div className="h-6 flex items-center justify-center w-full">
              <span className="font-black text-sm dark:text-white leading-none">{property.baths}g</span>
            </div>
            <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest mt-1">Weight</span>
          </div>
          <div className="flex flex-col items-center text-center px-1">
            <span className="material-icons text-primary text-xl block mb-1">public</span>
            <div className="h-6 flex items-center justify-center w-full">
              <span className="font-black text-[10px] dark:text-white leading-tight truncate w-full" title={property.origin || 'Saudi Gold'}>
                {property.origin || 'Saudi Gold'}
              </span>
            </div>
            <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest mt-1">Origin</span>
          </div>
          <div className="flex flex-col items-center text-center px-1">
            <span className="material-icons text-primary text-xl block mb-1">inventory_2</span>
            <div className="h-6 flex items-center justify-center w-full">
              <span className="font-black text-[10px] dark:text-white leading-tight truncate w-full" title={property.lotArea || 'N/A'}>
                {(property.lotArea || 'N/A')}
              </span>
            </div>
            <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest mt-1">Ref ID</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoldChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'OANDA:XAUUSD',
      interval: 'W',
      range: '60M',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com'
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <section className="pt-8 pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-16 items-stretch">
          {/* Left: header + chart */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="text-primary font-bold tracking-[0.5em] text-[10px] uppercase">LIVE MARKET DATA</span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-3">Gold Performance</h2>
              <p className="text-zinc-400 mt-3 text-sm font-medium">XAU/USD — Live data powered by TradingView. Updates in real time.</p>
            </div>
            <div className="rounded-3xl overflow-hidden border border-zinc-700 shadow-sm flex-1 min-h-[400px]">
              <div className="tradingview-widget-container h-full" ref={containerRef} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
          {/* Right: header + performance card */}
          <GoldLongTermPerformance />
        </div>
      </div>
    </section>
  );
};

const Home: React.FC<HomeProps> = ({ properties, isLoading }) => {
  const inventoryRef = useRef<HTMLDivElement>(null);

  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    const els = document.querySelectorAll('.scroll-reveal');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const [listingTypeFilter, setListingTypeFilter] = useState('');
  const [listingPurityFilter, setListingPurityFilter] = useState('');
  const [listingOriginFilter, setListingOriginFilter] = useState('');
  const [listingSortBy, setListingSortBy] = useState('');

  const activeProperties = properties.filter(p => p.status === 'active' || p.status === 'draft');

  const allListings = (() => {
    let results = activeProperties;
    if (listingTypeFilter) results = results.filter(p => p.type === listingTypeFilter);
    if (listingPurityFilter) results = results.filter(p => p.beds >= parseInt(listingPurityFilter));
    if (listingOriginFilter) results = results.filter(p => p.origin === listingOriginFilter);
    if (listingSortBy === 'price-low') results = [...results].sort((a, b) => a.price - b.price);
    else if (listingSortBy === 'price-high') results = [...results].sort((a, b) => b.price - a.price);
    else if (listingSortBy === 'newest') results = [...results].sort((a, b) => new Date(b.dateListed || 0).getTime() - new Date(a.dateListed || 0).getTime());
    else if (listingSortBy === 'purity') results = [...results].sort((a, b) => b.beds - a.beds);
    return results;
  })();

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "YGB Buy Gold & Sell",
    "description": "Premium platform specializing in luxury gold items, bars, and coins for sale",
    "url": window.location.origin,
    "image": `${window.location.origin}/Image/Yhen_Property_Favikan.png`,
    "areaServed": {
      "@type": "Place",
      "name": "Global"
    },
    "knowsAbout": ["Gold Coins", "Gold Bars", "Jewelry", "Collectibles", "Precious Metals", "Gold for Sale"]
  };

  return (
    <div>
      <SEO
        title="Premium Gold Coins, Bars & Jewelry for Buying and Selling | YGB Buy Gold & Sell"
        description="Direct agent helping you buy gold coins, bars, jewelry and collectibles. Direct deals, legal guidance, focus on premium quality."
        canonical={window.location.origin}
        ogType="website"
        ogTitle="YGB Buy Gold & Sell - Premium Gold Items"
        ogDescription="Premium platform offering luxury gold items for sale."
        ogUrl={window.location.origin}
        ogImage={`${window.location.origin}/Image/YGB_favicon.png`}
        ogSiteName="YGB Buy Gold & Sell"
        ogLocale="en_US"
        twitterCard="summary_large_image"
        twitterTitle="YGB Buy Gold & Sell"
        twitterDescription="Discover premium gold items"
        twitterImage={`${window.location.origin}/Image/YGB_favicon.png`}
        structuredData={homeStructuredData}
      />
      {/* Hero Section */}
      <header
        className="relative w-full flex flex-col items-start justify-start pt-16 pb-0"
        style={{ minHeight: 'calc(100vh - 73px)' }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/Image/hero_poster.jpg.png"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ zIndex: 0 }}
        >
          <source src="/Image/compressed_hero_section.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" style={{ zIndex: 1 }}></div>

        <div className="relative z-20 text-left px-8 md:px-16 w-full max-w-2xl ml-0 mr-auto">

          {/* Animated hero headline */}
          <h1 className="hero-line-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 drop-shadow-2xl leading-tight text-left">
            <span className="text-white">Secure Your <em>Wealth</em> with</span>
            <br />
            <span style={{ color: '#D4AF37', textShadow: '0 0 40px rgba(212,175,55,0.5)' }}>YGB Gold Buy &amp; Sell</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-white/80 mb-8 drop-shadow-md font-medium leading-relaxed">
            Secure Platform for Buying Gold Jewlery Investments, work directly with <span className="text-primary">YGB</span> from <span className="text-primary">Start</span> to <span className="text-primary">Finish</span> where every investment and client matters.
          </p>

          <button
            onClick={() => inventoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="bg-primary text-zinc-900 font-black py-4 px-12 rounded-full hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 text-lg md:text-xl tracking-wider uppercase mb-8"
          >
            Invest in Gold
          </button>
        </div>
      </header>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-[0.5em] text-[10px] uppercase">SIMPLE PROCESS</span>
            <h2 className="text-4xl md:text-5xl font-black dark:text-white tracking-tighter mt-3">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30 -translate-y-1/2 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <span className="material-icons text-primary text-4xl">diamond</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-zinc-900 font-black text-sm flex items-center justify-center mb-4">1</div>
              <h3 className="text-xl font-black dark:text-white mb-3 tracking-tight">Choose Your Item</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Browse our inventory and find the gold item you love. When you're ready, click <span className="font-bold text-zinc-700 dark:text-zinc-200">"Buy Now"</span> on the listing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <span className="material-icons text-primary text-4xl">local_shipping</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-zinc-900 font-black text-sm flex items-center justify-center mb-4">2</div>
              <h3 className="text-xl font-black dark:text-white mb-3 tracking-tight">Reserve & Pay</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Fill in your details and select your shipping country. Click <span className="font-bold text-zinc-700 dark:text-zinc-200">"Confirm Request"</span> and instantly receive an email with your invoice, payment options (GCash &amp; BPI Bank), and step-by-step payment instructions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <span className="material-icons text-primary text-4xl">moving</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-zinc-900 font-black text-sm flex items-center justify-center mb-4">3</div>
              <h3 className="text-xl font-black dark:text-white mb-3 tracking-tight">Track & Receive</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                In <span className="font-bold text-zinc-700 dark:text-zinc-200">3–5 days</span> you'll get an email with tracked shipping details. Sit back and watch your wealth grow!
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Gold Performance Chart */}
      <GoldChart />

      {/* All Listings */}
      <section ref={inventoryRef} className="bg-zinc-50 dark:bg-zinc-900/30 py-32 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-primary font-bold tracking-[0.4em] text-[11px] mb-4 block uppercase">ALL LISTINGS</span>
              <h2 className="text-5xl font-black dark:text-white tracking-tighter">
                Gold Jewelry Pieces
                {!isLoading && <span className="ml-4 text-2xl font-bold text-zinc-400">({allListings.length})</span>}
              </h2>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3 mb-10">
            <select
              value={listingTypeFilter}
              onChange={e => setListingTypeFilter(e.target.value)}
              style={{ backgroundImage: 'none' }}
              className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-bold cursor-pointer focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">All Types</option>
              {Object.values(PropertyType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={listingPurityFilter}
              onChange={e => setListingPurityFilter(e.target.value)}
              style={{ backgroundImage: 'none' }}
              className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-bold cursor-pointer focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Any Purity</option>
              {[18, 21, 22, 24].map(n => <option key={n} value={n}>{n}K+</option>)}
            </select>

            <select
              value={listingOriginFilter}
              onChange={e => setListingOriginFilter(e.target.value)}
              style={{ backgroundImage: 'none' }}
              className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-bold cursor-pointer focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Any Origin</option>
              <option value="Saudi Gold">Saudi Gold</option>
              <option value="Japan Gold">Japan Gold</option>
              <option value="Chinese Gold">Chinese Gold</option>
              <option value="Hongkong Gold">Hongkong Gold</option>
            </select>

            <select
              value={listingSortBy}
              onChange={e => setListingSortBy(e.target.value)}
              style={{ backgroundImage: 'none' }}
              className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-bold cursor-pointer focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Sort: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="purity">Highest Purity</option>
            </select>

            {(listingTypeFilter || listingPurityFilter || listingOriginFilter || listingSortBy) && (
              <button
                onClick={() => { setListingTypeFilter(''); setListingPurityFilter(''); setListingOriginFilter(''); setListingSortBy(''); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-primary text-sm font-bold transition-colors"
              >
                <span className="material-icons text-sm">close</span>
                Clear
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-[32px] h-[450px] animate-pulse border border-zinc-100 dark:border-zinc-800">
                  <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-t-[32px]"></div>
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-1/2 rounded-full"></div>
                    <div className="h-8 bg-zinc-200 dark:bg-zinc-800 w-3/4 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : allListings.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[48px] border border-dashed border-zinc-200 dark:border-zinc-800">
              <span className="material-icons text-7xl text-zinc-300 mb-6">inventory_2</span>
              <p className="text-zinc-500 text-xl font-medium">No listings match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {allListings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
