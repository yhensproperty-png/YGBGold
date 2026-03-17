import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyListing, PropertyType } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';
import { SEO } from '../components/SEO';

const WHATSAPP_NUMBER = "639467543767";

interface HomeProps {
  properties: PropertyListing[];
  isLoading?: boolean;
}

// Utility to format number with commas
const formatWithCommas = (value: string) => {
  if (!value) return '';
  const num = value.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const PropertyCard: React.FC<{ property: PropertyListing }> = ({ property }) => {
  const dateListedFormatted = property.dateListed
    ? new Date(property.dateListed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  const dateUpdatedFormatted = property.dateUpdated
    ? new Date(property.dateUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const isLand = property.type === PropertyType.Land;
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

  const propertyUrl = `${window.location.origin}/property/${property.slug}`;

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
    const msg = encodeURIComponent(`Check out this property: "${property.title}" in ${property.city}\n${propertyUrl}`);
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
      <Link to={`/property/${property.slug}`} className="block">
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
            <div className="bg-white text-zinc-900 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider shadow-sm">
              FOR {property.listingType?.toUpperCase() || 'SALE'}
            </div>
          </div>
          {property.featured && (
            <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur text-primary border border-primary/30 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest shadow-lg">
              FEATURED
            </div>
          )}
          <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-3 py-1 rounded-lg">
            <span className="font-bold dark:text-white">
              ₱{property.price.toLocaleString()}{property.listingType === 'rent' ? '/mo' : ''}
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
          <Link to={`/property/${property.slug}`} className="flex-1 min-w-0">
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
        <div className={`grid ${isLand ? 'grid-cols-2' : 'grid-cols-4'} gap-4 pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800`}>
          {!isLand && (
            <>
              <div className="text-center">
                <span className="material-icons text-primary text-xl block mb-0.5">king_bed</span>
                <span className="block font-black text-lg dark:text-white leading-none">{property.beds}</span>
                <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Beds</span>
              </div>
              <div className="text-center">
                <span className="material-icons text-primary text-xl block mb-0.5">bathtub</span>
                <span className="block font-black text-lg dark:text-white leading-none">{property.baths}</span>
                <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Baths</span>
              </div>
            </>
          )}
          <div className="text-center">
            <span className="material-icons text-primary text-xl block mb-0.5">square_foot</span>
            <span className="block font-black text-lg dark:text-white leading-none">{property.sqft.toLocaleString()}</span>
            <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Living sqm</span>
          </div>
          <div className="text-center">
            <span className="material-icons text-primary text-xl block mb-0.5">landscape</span>
            <span className="block font-black text-lg dark:text-white leading-none">{(property.lotArea || 0).toLocaleString()}</span>
            <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Lot Sqm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ properties, isLoading }) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredResults, setFilteredResults] = useState<PropertyListing[] | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<{ id: string; label: string; icon: string }[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);

  const [searchFilters, setSearchFilters] = useState({
    location: '',
    type: '',
    beds: '',
    baths: '',
    minPrice: '',
    maxPrice: '',
    amenities: [] as string[],
    keywords: '',
    minSqft: '',
    maxSqft: '',
    minLotSize: '',
    maxLotSize: '',
    dateFilter: '',
    sortBy: ''
  });

  useEffect(() => {
    const loadAmenities = async () => {
      const { data, error } = await supabase
        .from('custom_amenities')
        .select('id, label, icon')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setAvailableAmenities(data);
      }
    };
    loadAmenities();
  }, []);

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
  const activeProperties = properties.filter(p => p.status === 'active' || p.status === 'draft');
  const featuredProperties = activeProperties.filter(p => p.featured);

  const newProperties = activeProperties.filter(p => {
    if (!p.dateListed) return false;
    const listedDate = new Date(p.dateListed);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return listedDate >= thirtyDaysAgo;
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'minPrice' || name === 'maxPrice' || name === 'minSqft' || name === 'maxSqft' || name === 'minLotSize' || name === 'maxLotSize') {
      const numericValue = value.replace(/\D/g, '');
      setSearchFilters(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setSearchFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleAmenityFilter = (amenityLabel: string) => {
    setSearchFilters(prev => {
      const current = prev.amenities || [];
      const updated = current.includes(amenityLabel)
        ? current.filter(a => a !== amenityLabel)
        : [...current, amenityLabel];
      return { ...prev, amenities: updated };
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    setTimeout(() => {
      let results = activeProperties.filter(p => {
        if (p.listingType !== listingType) return false;

        if (searchFilters.location.trim()) {
          const loc = searchFilters.location.toLowerCase().trim();
          const searchableText = `${p.city} ${p.state} ${p.address} ${p.zipCode} ${p.title}`.toLowerCase();
          if (!searchableText.includes(loc)) return false;
        }

        if (searchFilters.keywords.trim()) {
          const keywords = searchFilters.keywords.toLowerCase().trim();
          const searchableText = `${p.title} ${p.description || ''}`.toLowerCase();
          if (!searchableText.includes(keywords)) return false;
        }

        if (searchFilters.type && p.type !== searchFilters.type) return false;

        if (searchFilters.beds) {
          if (searchFilters.beds === '5+') {
            if (p.beds < 5) return false;
          } else {
            const minBeds = parseInt(searchFilters.beds);
            if (p.beds < minBeds) return false;
          }
        }

        if (searchFilters.baths) {
          if (searchFilters.baths === '5+') {
            if (p.baths < 5) return false;
          } else {
            const minBaths = parseFloat(searchFilters.baths);
            if (p.baths < minBaths) return false;
          }
        }

        if (searchFilters.minPrice && p.price < parseInt(searchFilters.minPrice)) return false;
        if (searchFilters.maxPrice && p.price > parseInt(searchFilters.maxPrice)) return false;

        if (searchFilters.minSqft && p.sqft < parseInt(searchFilters.minSqft)) return false;
        if (searchFilters.maxSqft && p.sqft > parseInt(searchFilters.maxSqft)) return false;

        if (searchFilters.minLotSize && (p.lotArea || 0) < parseInt(searchFilters.minLotSize)) return false;
        if (searchFilters.maxLotSize && (p.lotArea || 0) > parseInt(searchFilters.maxLotSize)) return false;

        if (searchFilters.dateFilter) {
          if (!p.dateListed) return false;
          const listedDate = new Date(p.dateListed);
          const today = new Date();
          const daysDiff = Math.floor((today.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24));

          if (searchFilters.dateFilter === '7days' && daysDiff > 7) return false;
          if (searchFilters.dateFilter === '30days' && daysDiff > 30) return false;
          if (searchFilters.dateFilter === '90days' && daysDiff > 90) return false;
        }

        if (searchFilters.amenities && searchFilters.amenities.length > 0) {
          const propertyAmenities = p.amenities || [];
          const hasAllAmenities = searchFilters.amenities.every(filterAmenity =>
            propertyAmenities.some(propAmenity =>
              propAmenity.toLowerCase() === filterAmenity.toLowerCase()
            )
          );
          if (!hasAllAmenities) return false;
        }

        return true;
      });

      // Apply sorting
      if (searchFilters.sortBy) {
        results = [...results].sort((a, b) => {
          switch (searchFilters.sortBy) {
            case 'price-low':
              return a.price - b.price;
            case 'price-high':
              return b.price - a.price;
            case 'newest':
              return new Date(b.dateListed || 0).getTime() - new Date(a.dateListed || 0).getTime();
            case 'sqft':
              return b.sqft - a.sqft;
            case 'beds':
              return b.beds - a.beds;
            case 'baths':
              return b.baths - a.baths;
            default:
              return 0;
          }
        });
      }

      setFilteredResults(results);
      setIsSearching(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }, 800);
  };

  const clearSearch = () => {
    setFilteredResults(null);
    setSearchFilters({
      location: '',
      type: '',
      beds: '',
      baths: '',
      minPrice: '',
      maxPrice: '',
      amenities: [],
      keywords: '',
      minSqft: '',
      maxSqft: '',
      minLotSize: '',
      maxLotSize: '',
      dateFilter: '',
      sortBy: ''
    });
  };

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "YGB Buy Gold & Sell",
    "description": "Premium platform specializing in luxury gold items, bars, and coins for sale and rent",
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
        description="Direct agent helping you buy or lease gold coins, bars, jewelry and collectibles. Direct deals, legal guidance, focus on premium quality."
        canonical={window.location.origin}
        ogType="website"
        ogTitle="YGB Buy Gold & Sell - Premium Gold Items"
        ogDescription="Premium platform offering luxury gold items for sale and lease."
        ogUrl={window.location.origin}
        ogImage={`${window.location.origin}/Image/Yhen_Property_Favikan.png`}
        ogSiteName="YGB Buy Gold & Sell"
        ogLocale="en_US"
        twitterCard="summary_large_image"
        twitterTitle="YGB Buy Gold & Sell"
        twitterDescription="Discover premium gold items"
        twitterImage={`${window.location.origin}/Image/Yhen_Property_Favikan.png`}
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
            Secure Platform for Buying Gold investment Items, work directly with <span className="text-primary">YGB</span> from <span className="text-primary">Start</span> to <span className="text-primary">Finish</span> where every investment and client matters.
          </p>

          {/* Advanced Search Hub or Button */}
          {!showSearchBox ? (
            <button
              onClick={() => setShowSearchBox(true)}
              className="bg-primary text-zinc-900 font-black py-4 px-12 rounded-full hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 text-lg md:text-xl tracking-wider uppercase mb-8"
            >
              Buy gold now
            </button>
          ) : (
          <div className="bg-zinc-900/60 backdrop-blur-3xl p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl max-w-5xl mx-auto relative">

            {/* Buy / Rent Toggle */}
            <div className="flex justify-between items-start mb-5">
              <div className="inline-flex p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                <button
                  onClick={() => setListingType('sale')}
                  className={`px-5 md:px-8 py-2 md:py-2.5 rounded-lg text-xs font-black tracking-widest transition-all duration-300 ${
                    listingType === 'sale'
                      ? 'bg-primary text-zinc-900 shadow-lg shadow-primary/20'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setListingType('rent')}
                  className={`px-5 md:px-8 py-2 md:py-2.5 rounded-lg text-xs font-black tracking-widest transition-all duration-300 ${
                    listingType === 'rent'
                      ? 'bg-primary text-zinc-900 shadow-lg shadow-primary/20'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  RENT
                </button>
              </div>

              {/* Advanced Filters Button - Next to Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-3 md:px-4 py-2 md:py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 md:gap-2 transition-all"
              >
                <span className="material-icons text-sm">tune</span>
                <span className="hidden sm:inline">ADVANCED</span>
              </button>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-2.5 md:gap-3 items-stretch">

              {/* Location Input */}
              <div className="sm:col-span-2 md:col-span-6 lg:col-span-4 relative group">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors text-base">location_on</span>
                <input
                  name="location"
                  value={searchFilters.location}
                  onChange={handleFilterChange}
                  className="w-full h-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white pl-10 pr-3 rounded-xl py-3 placeholder:text-white/30 transition-all text-sm font-medium"
                  placeholder="City, Address or ZIP"
                  type="text"
                />
              </div>

              {/* Property Type Dropdown */}
              <div className="md:col-span-2 lg:col-span-2 relative">
                <select
                  name="type"
                  value={searchFilters.type}
                  onChange={handleFilterChange}
                  style={{ backgroundImage: 'none' }}
                  className="w-full h-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white/80 rounded-xl py-3 px-3 !appearance-none transition-all cursor-pointer text-sm font-medium pr-9"
                >
                  <option value="" className="bg-zinc-900">Any Type</option>
                  {Object.values(PropertyType).map(t => (
                    <option key={t} value={t} className="bg-zinc-900">{t}</option>
                  ))}
                </select>
                <span className="material-icons absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-base">expand_more</span>
              </div>

              {/* Beds selection */}
              <div className="md:col-span-2 lg:col-span-2 relative">
                <select
                  name="beds"
                  value={searchFilters.beds}
                  onChange={handleFilterChange}
                  style={{ backgroundImage: 'none' }}
                  className="w-full h-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white/80 rounded-xl py-3 px-3 !appearance-none transition-all cursor-pointer text-sm font-medium pr-9"
                >
                  <option value="" className="bg-zinc-900">Any Beds</option>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n} className="bg-zinc-900">{n}+ Beds</option>)}
                  <option value="5+" className="bg-zinc-900">5+ Beds</option>
                </select>
                <span className="material-icons absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-base">bed</span>
              </div>

              {/* Baths selection */}
              <div className="md:col-span-2 lg:col-span-2 relative">
                <select
                  name="baths"
                  value={searchFilters.baths}
                  onChange={handleFilterChange}
                  style={{ backgroundImage: 'none' }}
                  className="w-full h-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white/80 rounded-xl py-3 px-3 !appearance-none transition-all cursor-pointer text-sm font-medium pr-9"
                >
                  <option value="" className="bg-zinc-900">Any Baths</option>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n} className="bg-zinc-900">{n}+ Baths</option>)}
                  <option value="5+" className="bg-zinc-900">5+ Baths</option>
                </select>
                <span className="material-icons-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-base">bathtub</span>
              </div>

              {/* Price Range Fields - Formatted with Symbol */}
              <div className="sm:col-span-2 md:col-span-6 lg:col-span-2 flex flex-col sm:flex-row lg:flex-col gap-2">
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold pointer-events-none group-focus-within:text-primary transition-colors">₱</span>
                  <input
                    name="minPrice"
                    value={formatWithCommas(searchFilters.minPrice)}
                    onChange={handleFilterChange}
                    className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white pl-7 pr-3 rounded-xl py-2 placeholder:text-white/30 text-xs font-bold transition-all"
                    placeholder="Min Price"
                    type="text"
                  />
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold pointer-events-none group-focus-within:text-primary transition-colors">₱</span>
                  <input
                    name="maxPrice"
                    value={formatWithCommas(searchFilters.maxPrice)}
                    onChange={handleFilterChange}
                    className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white pl-7 pr-3 rounded-xl py-2 placeholder:text-white/30 text-xs font-bold transition-all"
                    placeholder="Max Price"
                    type="text"
                  />
                </div>
              </div>

              {/* Advanced Filters Modal */}
              {showAdvancedFilters && (
                <div className="lg:col-span-12 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <span className="material-icons text-primary text-base">filter_alt</span>
                      Advanced Filters
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFilters(false)}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>

                  {/* Keywords Search */}
                  <div>
                    <label className="text-white/70 text-xs font-bold mb-2 block">KEYWORDS</label>
                    <div className="relative group">
                      <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors text-base">search</span>
                      <input
                        name="keywords"
                        value={searchFilters.keywords}
                        onChange={handleFilterChange}
                        className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white pl-10 pr-3 rounded-xl py-2.5 placeholder:text-white/30 transition-all text-sm font-medium"
                        placeholder="Search in titles and descriptions"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Property Size Range */}
                  <div>
                    <label className="text-white/70 text-xs font-bold mb-2 block">SQUARE FOOTAGE (SQM)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative group">
                        <input
                          name="minSqft"
                          value={formatWithCommas(searchFilters.minSqft)}
                          onChange={handleFilterChange}
                          className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white px-3 rounded-xl py-2.5 placeholder:text-white/30 transition-all text-sm font-medium"
                          placeholder="Min sqm"
                          type="text"
                        />
                      </div>
                      <div className="relative group">
                        <input
                          name="maxSqft"
                          value={formatWithCommas(searchFilters.maxSqft)}
                          onChange={handleFilterChange}
                          className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white px-3 rounded-xl py-2.5 placeholder:text-white/30 transition-all text-sm font-medium"
                          placeholder="Max sqm"
                          type="text"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lot Size Range */}
                  <div>
                    <label className="text-white/70 text-xs font-bold mb-2 block">LOT SIZE (SQM)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative group">
                        <input
                          name="minLotSize"
                          value={formatWithCommas(searchFilters.minLotSize)}
                          onChange={handleFilterChange}
                          className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white px-3 rounded-xl py-2.5 placeholder:text-white/30 transition-all text-sm font-medium"
                          placeholder="Min lot sqm"
                          type="text"
                        />
                      </div>
                      <div className="relative group">
                        <input
                          name="maxLotSize"
                          value={formatWithCommas(searchFilters.maxLotSize)}
                          onChange={handleFilterChange}
                          className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white px-3 rounded-xl py-2.5 placeholder:text-white/30 transition-all text-sm font-medium"
                          placeholder="Max lot sqm"
                          type="text"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date Filters */}
                  <div className="relative">
                    <label className="text-white/70 text-xs font-bold mb-2 block">DATE LISTED</label>
                    <select
                      name="dateFilter"
                      value={searchFilters.dateFilter}
                      onChange={handleFilterChange}
                      style={{ backgroundImage: 'none' }}
                      className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white/80 rounded-xl py-2.5 px-3 !appearance-none transition-all cursor-pointer text-sm font-medium pr-9"
                    >
                      <option value="" className="bg-zinc-900">Any Time</option>
                      <option value="7days" className="bg-zinc-900">Last 7 Days</option>
                      <option value="30days" className="bg-zinc-900">Last 30 Days</option>
                      <option value="90days" className="bg-zinc-900">Last 90 Days</option>
                    </select>
                    <span className="material-icons absolute right-2.5 bottom-2.5 text-white/30 pointer-events-none text-base">expand_more</span>
                  </div>

                  {/* Sort Options */}
                  <div className="relative">
                    <label className="text-white/70 text-xs font-bold mb-2 block">SORT BY</label>
                    <select
                      name="sortBy"
                      value={searchFilters.sortBy}
                      onChange={handleFilterChange}
                      style={{ backgroundImage: 'none' }}
                      className="w-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white/80 rounded-xl py-2.5 px-3 !appearance-none transition-all cursor-pointer text-sm font-medium pr-9"
                    >
                      <option value="" className="bg-zinc-900">Default</option>
                      <option value="price-low" className="bg-zinc-900">Price: Low to High</option>
                      <option value="price-high" className="bg-zinc-900">Price: High to Low</option>
                      <option value="newest" className="bg-zinc-900">Newest First</option>
                      <option value="sqft" className="bg-zinc-900">Largest Square Footage</option>
                      <option value="beds" className="bg-zinc-900">Most Bedrooms</option>
                      <option value="baths" className="bg-zinc-900">Most Bathrooms</option>
                    </select>
                    <span className="material-icons absolute right-2.5 bottom-2.5 text-white/30 pointer-events-none text-base">expand_more</span>
                  </div>
                </div>
              )}

              {/* Advanced Search Toggle */}
              <div className="lg:col-span-12">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className="w-full py-2 text-white/60 hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <span className="material-icons text-sm">{showAdvancedSearch ? 'expand_less' : 'tune'}</span>
                  {showAdvancedSearch ? 'HIDE' : 'SHOW'} AMENITY FILTERS
                </button>
              </div>

              {/* Advanced Amenities Section */}
              {showAdvancedSearch && availableAmenities.length > 0 && (
                <div className="lg:col-span-12 bg-white/5 border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <span className="material-icons text-primary text-base">auto_awesome</span>
                      Filter by Amenities
                    </h3>
                    {searchFilters.amenities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSearchFilters(prev => ({ ...prev, amenities: [] }))}
                        className="text-xs text-white/50 hover:text-primary transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {availableAmenities.map((amenity) => {
                      const isSelected = searchFilters.amenities.includes(amenity.label);
                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => toggleAmenityFilter(amenity.label)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-primary/20 border-primary text-white shadow-sm shadow-primary/10'
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                          }`}
                        >
                          <span className={`material-icons text-sm ${isSelected ? 'text-primary' : 'text-white/40'}`}>
                            {amenity.icon}
                          </span>
                          <span className="truncate flex-1">{amenity.label}</span>
                          {isSelected && (
                            <span className="material-icons text-primary text-xs">check_circle</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {searchFilters.amenities.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-white/50 mb-2">Selected amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {searchFilters.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center gap-1 bg-primary/10 border border-primary/30 text-white text-xs font-bold px-2 py-1 rounded-lg"
                          >
                            {amenity}
                            <button
                              type="button"
                              onClick={() => toggleAmenityFilter(amenity)}
                              className="ml-1 text-white/50 hover:text-red-400 transition-colors"
                            >
                              <span className="material-icons text-[12px]">close</span>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Large Action Button */}
              <div className="lg:col-span-12 mt-2">
                <button
                  type="submit"
                  disabled={isSearching || isLoading}
                  className="w-full bg-primary text-zinc-900 font-black py-3 md:py-3.5 rounded-xl md:rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-2.5 text-sm md:text-base tracking-wider group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={`material-icons text-lg md:text-xl ${isSearching ? 'animate-spin' : ''}`}>
                    {isSearching ? 'sync' : 'search'}
                  </span>
                  {isSearching ? 'SEARCHING...' : 'FIND PROPERTY'}
                </button>
              </div>
            </form>
          </div>
          )}
        </div>
      </header>

      {/* Conditional Search Results Section */}
      <div ref={resultsRef} className="scroll-mt-24">
        {filteredResults !== null && (
          <section className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <span className="text-primary font-bold tracking-[0.5em] text-[10px] mb-4 uppercase">CURATED SEARCH RESULTS</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black dark:text-white tracking-tighter leading-none">
                  {filteredResults.length === 0 ? 'No Matches' : `Found ${filteredResults.length} ${filteredResults.length === 1 ? 'Match' : 'Matches'}`}
                </h2>
                {filteredResults.length > 0 && (
                  <p className="text-zinc-500 mt-4 font-medium italic">Showing premium listings for your specific criteria.</p>
                )}
              </div>
              <button 
                onClick={clearSearch}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-primary transition-all font-bold text-sm"
              >
                <span className="material-icons text-sm">close</span>
                RESET FILTERS
              </button>
            </div>
            
            {filteredResults.length === 0 ? (
              <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[50px] border border-dashed border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="bg-zinc-50 dark:bg-zinc-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="material-icons text-6xl text-zinc-200">sentiment_dissatisfied</span>
                </div>
                <h3 className="text-2xl font-bold dark:text-white mb-2">No Properties Found</h3>
                <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
                  We couldn't find any listings matching those exact specifications. Try adjusting your filters or browsing our latest inventory below.
                </p>
                <button 
                  onClick={clearSearch}
                  className="mt-10 px-10 py-4 bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-all"
                >
                  View All Listings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {filteredResults.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
            
            <div className="mt-24 h-px bg-zinc-200 dark:bg-zinc-800 w-full"></div>
          </section>
        )}
      </div>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-primary font-bold tracking-[0.5em] text-[10px] mb-4 uppercase">CURATED COLLECTIONS</span>
          <h2 className="text-5xl md:text-6xl font-black dark:text-white mb-6 tracking-tighter">Choose Your Lifestyle</h2>
          <div className="w-24 h-2 bg-primary rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { slug: 'buy-condos', icon: 'apartment', label: 'Buy Condos', img: '/Image/the_rise_manila_1.png' },
            { slug: 'buy-houses', icon: 'home', label: 'Buy Houses', img: '/Image/fancy_house_1_manila.png' },
            { slug: 'buy-land', icon: 'landscape', label: 'Buy Land Plots', img: '/Image/Rice_field_land_small_size.png' },
            { slug: 'rent', icon: 'vpn_key', label: 'Rent Condos, Houses, Land & Commercial', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800' }
          ].map((cat, i) => (
            <Link key={i} to={`/category/${cat.slug}`} className="group relative h-96 rounded-[40px] overflow-hidden cursor-pointer block border border-zinc-100 dark:border-zinc-800 shadow-2xl">
              {cat.img && <img src={cat.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={`${cat.label} category - Browse properties`} loading="lazy" width="800" height="600" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary p-3 rounded-2xl text-zinc-900 shadow-xl shadow-primary/30 group-hover:rotate-12 transition-transform duration-500">
                    <span className="material-icons text-2xl">{cat.icon}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none">{cat.label}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-zinc-50 dark:bg-zinc-900/30 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-primary font-bold tracking-[0.4em] text-[11px] mb-4 block uppercase">PREMIUM LISTINGS</span>
            <h2 className="text-5xl font-black dark:text-white tracking-tighter">Featured Assets</h2>
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
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[48px] border border-dashed border-zinc-200 dark:border-zinc-800">
              <span className="material-icons text-7xl text-zinc-300 mb-6">star_outline</span>
              <p className="text-zinc-500 text-xl font-medium">No properties currently featured in the vault.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-primary font-bold tracking-[0.4em] text-[11px] mb-4 block uppercase">NEW TO THE MARKET IN THE LAST 30 DAYS</span>
            <h2 className="text-5xl font-black dark:text-white tracking-tighter">Latest Inventory</h2>
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
          ) : newProperties.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[48px] border border-dashed border-zinc-200 dark:border-zinc-800">
              <span className="material-icons text-7xl text-zinc-300 mb-6">search_off</span>
              <p className="text-zinc-500 text-xl font-medium">No new properties in the last 30 days. Check back soon!</p>
              <Link to="/add" className="mt-8 inline-block px-10 py-4 bg-primary text-zinc-900 font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-primary/20">Start Listing</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {newProperties.map((property) => (
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