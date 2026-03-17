import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PropertyListing, PropertyType } from '../types.ts';
import { PropertyCard } from './Home.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { SEO } from '../components/SEO';

interface CategoryListingsProps {
  properties: PropertyListing[];
}

const CATEGORY_MAP: Record<string, { title: string; types?: PropertyType[]; listingType?: 'sale' | 'rent' }> = {
  'coins': {
    title: 'Gold Coins',
    types: [PropertyType.Coins]
  },
  'bars': {
    title: 'Gold Bars',
    types: [PropertyType.Bars]
  },
  'jewelry': {
    title: 'Gold Jewelry',
    types: [PropertyType.Jewelry]
  },
  'scrap-gold': {
    title: 'Scrap Gold',
    types: [PropertyType.ScrapGold]
  },
  'others': {
    title: 'Other Gold Items',
    types: [PropertyType.Others]
  },
  'rent': {
    title: 'Trading & Safe Keeping',
    listingType: 'rent'
  }
};

// Utility to format number with commas
const formatWithCommas = (value: string) => {
  if (!value) return '';
  const num = value.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const CategoryListings: React.FC<CategoryListingsProps> = ({ properties }) => {
  const { category } = useParams<{ category: string }>();

  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState<Array<{ id: string; label: string; icon: string }>>([]);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    type: '',
    beds: '',
    baths: '',
    minPrice: '',
    maxPrice: '',
    amenities: [] as string[],
    keywords: '',
    origin: '',
    minLotSize: '',
    maxLotSize: '',
    dateFilter: '',
    sortBy: ''
  });

  // Applied filters - only updated when "Update Results" is clicked
  const [appliedFilters, setAppliedFilters] = useState({
    location: '',
    type: '',
    beds: '',
    baths: '',
    minPrice: '',
    maxPrice: '',
    amenities: [] as string[],
    keywords: '',
    origin: '',
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

  // Normalize category key to handle case sensitivity
  const categoryKey = category?.toLowerCase() || '';
  const categoryConfig = CATEGORY_MAP[categoryKey];
  const displayTitle = categoryConfig?.title || 'Items';

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

  const filteredProperties = useMemo(() => {
    // First apply category constraints (only show active/draft listings)
    let base = categoryConfig
      ? properties.filter(p => {
          if (p.status !== 'active' && p.status !== 'draft') return false;
          if (categoryConfig.listingType && p.listingType !== categoryConfig.listingType) return false;
          if (categoryConfig.types && !categoryConfig.types.includes(p.type)) return false;
          return true;
        })
      : properties.filter(p => p.status === 'active' || p.status === 'draft');

    // Then apply search filters if any - use appliedFilters instead of searchFilters
    let results = base.filter(p => {
      if (appliedFilters.location.trim()) {
        const loc = appliedFilters.location.toLowerCase().trim();
        const searchableText = `${p.city} ${p.state} ${p.address} ${p.zipCode} ${p.title}`.toLowerCase();
        if (!searchableText.includes(loc)) return false;
      }

      if (appliedFilters.keywords.trim()) {
        const keywords = appliedFilters.keywords.toLowerCase().trim();
        const searchableText = `${p.title} ${p.description || ''}`.toLowerCase();
        if (!searchableText.includes(keywords)) return false;
      }

      if (appliedFilters.type && p.type !== appliedFilters.type) return false;
      if (appliedFilters.beds) {
        if (appliedFilters.beds === '5+') {
          if (p.beds < 5) return false;
        } else if (p.beds < parseInt(appliedFilters.beds)) return false;
      }
      if (appliedFilters.baths) {
        if (appliedFilters.baths === '5+') {
          if (p.baths < 5) return false;
        } else if (p.baths < parseFloat(appliedFilters.baths)) return false;
      }
      if (appliedFilters.minPrice && p.price < parseInt(appliedFilters.minPrice)) return false;
      if (appliedFilters.maxPrice && p.price > parseInt(appliedFilters.maxPrice)) return false;

      if (appliedFilters.origin && p.origin !== appliedFilters.origin) return false;

      if (appliedFilters.dateFilter) {
        if (!p.dateListed) return false;
        const listedDate = new Date(p.dateListed);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24));

        if (appliedFilters.dateFilter === '7days' && daysDiff > 7) return false;
        if (appliedFilters.dateFilter === '30days' && daysDiff > 30) return false;
        if (appliedFilters.dateFilter === '90days' && daysDiff > 90) return false;
      }

      if (appliedFilters.amenities && appliedFilters.amenities.length > 0) {
        const propertyAmenities = p.amenities || [];
        const hasAllAmenities = appliedFilters.amenities.every(filterAmenity =>
          propertyAmenities.some(propAmenity =>
            propAmenity.toLowerCase() === filterAmenity.toLowerCase()
          )
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    // Apply sorting
    if (appliedFilters.sortBy) {
      results = [...results].sort((a, b) => {
        switch (appliedFilters.sortBy) {
          case 'beds':
            return b.beds - a.beds;
          case 'baths':
            return b.baths - a.baths;
          default:
            return 0;
        }
      });
    }

    return results;
  }, [properties, categoryConfig, appliedFilters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Apply the current search filters
    setAppliedFilters(searchFilters);
    setTimeout(() => setIsSearching(false), 600);
  };

  const isRentCategory = categoryConfig?.listingType === 'rent' || categoryKey === 'rent';

  const categoryDescriptions: Record<string, { title: string; description: string }> = {
    'coins': {
      title: 'Premium Gold Coins in the Philippines',
      description: 'Explore our collection of investment-grade gold coins. From historical sovereigns to modern bullion coins, find the perfect addition to your portfolio.'
    },
    'bars': {
      title: 'Investment Gold Bars in the Philippines',
      description: 'Secure your wealth with fine gold bars. We offer various weights from accredited refiners, ensuring purity and liquidity for your investment.'
    },
    'jewelry': {
      title: 'Exquisite Gold Jewelry in the Philippines',
      description: 'Discover our curated selection of stunning gold jewelry. From 18k and 21k pieces to unique heirloom items, experience luxury and craftsmanship.'
    },
    'scrap-gold': {
      title: 'Gold Scrap & Nuggets',
      description: 'Inventory of scrap gold and raw nuggets. Ideal for jewelers or collectors looking for gold in its elemental form.'
    },
    'others': {
      title: 'Unique Gold Antiquities & Items',
      description: 'A collection of rare and unique gold items, antiquities, and miscellaneous precious metal objects.'
    }
  };

  const pageInfo = categoryDescriptions[categoryKey] || {
    title: displayTitle,
    description: `Browse ${displayTitle.toLowerCase()} in the Philippines. Discover premium gold items from our trusted boutique.`
  };

  const categoryStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageInfo.title,
    "description": pageInfo.description,
    "url": window.location.href,
    "isPartOf": {
      "@type": "WebSite",
      "name": "YGB Gold"
    },
    "mainEntity": {
      "@type": "Store",
      "name": "YGB Gold",
      "description": "Premium Philippine gold and precious metals boutique"
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SEO
        title={pageInfo.title}
        description={pageInfo.description}
        canonical={window.location.href}
        ogType="website"
        ogTitle={pageInfo.title}
        ogDescription={pageInfo.description}
        ogUrl={window.location.href}
        ogImage={`${window.location.origin}/Image/YGB_favicon.png`}
        ogSiteName="YGB Gold"
        ogLocale="en_PH"
        twitterCard="summary_large_image"
        twitterTitle={pageInfo.title}
        twitterDescription={pageInfo.description}
        structuredData={categoryStructuredData}
      />
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
        <Link to="/" className="w-14 h-14 flex items-center justify-center rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary hover:text-primary transition-all shadow-sm">
          <span className="material-icons">arrow_back</span>
        </Link>
        <div>
          <span className="text-primary font-black tracking-[0.4em] text-[10px] uppercase block mb-2">CATEGORY VIEW</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black dark:text-white tracking-tighter leading-none">{displayTitle}</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Found {filteredProperties.length} matches for your selection</p>
        </div>
      </div>

      {/* Advanced Search Hub - Replicated from Home for consistency */}
      <div className="bg-zinc-900/90 dark:bg-zinc-900/60 backdrop-blur-3xl p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl mb-12 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        {/* Type Indicator */}
        <div className="flex justify-between items-start mb-5">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRentCategory ? 'bg-primary/20 text-primary' : 'bg-primary text-zinc-900 shadow-lg shadow-primary/20'}`}>
              <span className="material-icons text-lg">{isRentCategory ? 'key' : 'sell'}</span>
            </div>
            <span className="text-white text-[10px] font-black tracking-[0.25em] uppercase">
              {isRentCategory ? 'TRADING SEARCH' : categoryKey === 'scrap-gold' ? 'SCRAP SEARCH' : categoryKey === 'jewelry' ? 'JEWELRY SEARCH' : categoryKey === 'coins' ? 'COIN SEARCH' : categoryKey === 'bars' ? 'BAR SEARCH' : 'INVENTORY SEARCH'}
            </span>
          </div>

          {/* Advanced Filters Button - Next to Type Indicator */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-3 md:px-4 py-2 md:py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 md:gap-2 transition-all"
          >
            <span className="material-icons text-sm">tune</span>
            <span className="hidden sm:inline">ADVANCED</span>
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-3 items-stretch relative z-10">
          
          {/* Location Input */}
          <div className="sm:col-span-2 md:col-span-6 lg:col-span-4 relative group">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors text-lg">location_on</span>
            <input
              name="location"
              value={searchFilters.location}
              onChange={handleFilterChange}
              className="w-full h-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white pl-11 pr-4 rounded-xl py-3 placeholder:text-white/30 transition-all text-sm font-medium"
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
              className="w-full h-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white/80 rounded-xl py-3 px-4 !appearance-none transition-all cursor-pointer text-sm font-medium pr-10"
            >
              <option value="" className="bg-zinc-900">Any Category</option>
              {Object.values(PropertyType).map(t => (
                <option key={t} value={t} className="bg-zinc-900">{t}</option>
              ))}
            </select>
            <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-lg">expand_more</span>
          </div>

          {/* Beds selection */}
          <div className="md:col-span-2 lg:col-span-2 relative">
            <select
              name="beds"
              value={searchFilters.beds}
              onChange={handleFilterChange}
              style={{ backgroundImage: 'none' }}
              className="w-full h-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white/80 rounded-xl py-3 px-4 !appearance-none transition-all cursor-pointer text-sm font-medium pr-10"
            >
              <option value="" className="bg-zinc-900">Min Karat</option>
              {[10, 14, 18, 21, 22, 24].map(n => <option key={n} value={n} className="bg-zinc-900">{n}K+</option>)}
            </select>
            <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-lg">diamond</span>
          </div>

          {/* Baths selection */}
          <div className="md:col-span-2 lg:col-span-2 relative">
            <select
              name="baths"
              value={searchFilters.baths}
              onChange={handleFilterChange}
              style={{ backgroundImage: 'none' }}
              className="w-full h-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white/80 rounded-xl py-3 px-4 !appearance-none transition-all cursor-pointer text-sm font-medium pr-10"
            >
              <option value="" className="bg-zinc-900">Min Weight</option>
              {[1, 5, 10, 20, 50, 100].map(n => <option key={n} value={n} className="bg-zinc-900">{n}g+</option>)}
            </select>
            <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-lg">scale</span>
          </div>

          {/* Origin selection */}
          <div className="md:col-span-2 lg:col-span-2 relative">
            <select
              name="origin"
              value={searchFilters.origin}
              onChange={handleFilterChange}
              style={{ backgroundImage: 'none' }}
              className="w-full h-full bg-white/5 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 text-white/80 rounded-xl py-3 px-4 !appearance-none transition-all cursor-pointer text-sm font-medium pr-10"
            >
              <option value="" className="bg-zinc-900">Any Origin</option>
              <option value="Saudi Gold" className="bg-zinc-900">Saudi Gold</option>
              <option value="Japan Gold" className="bg-zinc-900">Japan Gold</option>
              <option value="Chinese Gold" className="bg-zinc-900">Chinese Gold</option>
              <option value="Hongkong Gold" className="bg-zinc-900">Hongkong Gold</option>
            </select>
            <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-lg">public</span>
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

              {/* Remove Purity Percentage section as it was replaced by Karat dropdown */}

              {/* Lot Size Range */}
              <div>
                <label className="text-white/70 text-xs font-bold mb-2 block">REFERENCE / SERIAL ID</label>
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
                  <option value="beds" className="bg-zinc-900">Highest Karat</option>
                  <option value="baths" className="bg-zinc-900">Highest Weight</option>
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

          <div className="lg:col-span-12 mt-2">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-primary text-zinc-900 font-black py-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-2.5 text-base tracking-wider group disabled:opacity-50"
            >
              <span className={`material-icons text-xl ${isSearching ? 'animate-spin' : ''}`}>
                {isSearching ? 'sync' : 'search'}
              </span>
              {isSearching ? 'REFRESHING...' : 'UPDATE RESULTS'}
            </button>
          </div>
        </form>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[48px] border border-dashed border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="bg-zinc-50 dark:bg-zinc-800 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <span className="material-icons text-6xl text-zinc-200">location_city</span>
          </div>
          <h2 className="text-3xl font-black mb-3 dark:text-white tracking-tighter">No Matches Found</h2>
          <p className="text-zinc-500 mb-10 max-w-md mx-auto font-medium leading-relaxed">
            We couldn't find any listings matching these specific criteria in this category. Try broadening your search or exploring our other collections.
          </p>
          <Link to="/" className="inline-flex items-center gap-3 px-10 py-4 bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 font-black rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-black/10 dark:shadow-primary/20">
            <span className="material-icons">home</span>
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Featured Properties Section */}
      {(() => {
        const featuredProps = properties.filter(p =>
          p.featured &&
          (p.status === 'active' || p.status === 'draft')
        );

        return featuredProps.length > 0 ? (
          <div className="mt-24">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
              <div>
                <span className="text-primary font-bold tracking-[0.4em] text-[10px] uppercase block mb-2">FEATURED LISTINGS</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black dark:text-white tracking-tighter">Our Premium Selection</h2>
                <p className="text-zinc-500 text-sm mt-2 font-medium">Hand-picked items you won't want to miss</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {featuredProps.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
};

export default CategoryListings;
