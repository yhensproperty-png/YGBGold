import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PropertyListing, PropertyType } from '../types.ts';
import { PropertyService } from '../services/propertyService.ts';
import { supabase } from '../services/supabaseClient.ts';
import { compressImage, fileToBase64, getFileSizeInMB } from '../utils/imageCompression.ts';

interface AddListingProps {
  onAdd: (property: PropertyListing) => Promise<void>;
  isEdit?: boolean;
}



const ICON_KEYWORD_MAP: { keywords: string[]; icon: string }[] = [
  { keywords: ['pool', 'swim'], icon: 'pool' },
  { keywords: ['gym', 'fitness', 'workout', 'exercise'], icon: 'fitness_center' },
  { keywords: ['garage', 'car', 'vehicle'], icon: 'directions_car' },
  { keywords: ['covered', 'parking'], icon: 'garage' },
  { keywords: ['garden', 'yard', 'lawn', 'grass'], icon: 'yard' },
  { keywords: ['landscape'], icon: 'park' },
  { keywords: ['security', 'alarm', 'safe'], icon: 'security' },
  { keywords: ['cctv', 'surveillance', 'camera'], icon: 'videocam' },
  { keywords: ['biometric', 'fingerprint'], icon: 'fingerprint' },
  { keywords: ['wifi', 'internet', 'fiber', 'network', 'broadband'], icon: 'wifi' },
  { keywords: ['solar', 'panel', 'energy'], icon: 'solar_power' },
  { keywords: ['fireplace', 'hearth'], icon: 'fireplace' },
  { keywords: ['fire', 'alarm'], icon: 'local_fire_department' },
  { keywords: ['elevator', 'lift'], icon: 'elevator' },
  { keywords: ['balcony'], icon: 'balcony' },
  { keywords: ['lanai', 'terrace', 'deck', 'patio', 'porch'], icon: 'deck' },
  { keywords: ['roof', 'rooftop'], icon: 'roofing' },
  { keywords: ['water', 'lake', 'river', 'ocean', 'sea', 'beach', 'waterfront'], icon: 'water' },
  { keywords: ['mountain', 'view', 'vista'], icon: 'landscape' },
  { keywords: ['smart', 'home', 'automation', 'remote'], icon: 'settings_remote' },
  { keywords: ['wine', 'cellar', 'bar'], icon: 'wine_bar' },
  { keywords: ['air', 'ac', 'cooling', 'conditioning'], icon: 'ac_unit' },
  { keywords: ['gate', 'gated', 'community'], icon: 'lock' },
  { keywords: ['fence', 'perimeter', 'wall'], icon: 'fence' },
  { keywords: ['pet', 'dog', 'cat', 'animal'], icon: 'pets' },
  { keywords: ['floor', 'hardwood', 'wood'], icon: 'layers' },
  { keywords: ['marble', 'granite', 'countertop'], icon: 'countertops' },
  { keywords: ['ceiling', 'high'], icon: 'unfold_more' },
  { keywords: ['window', 'light', 'natural'], icon: 'wb_sunny' },
  { keywords: ['closet', 'walk-in'], icon: 'checkroom' },
  { keywords: ['wardrobe', 'built-in'], icon: 'storage' },
  { keywords: ['study', 'office'], icon: 'menu_book' },
  { keywords: ['powder', 'room'], icon: 'wc' },
  { keywords: ['bathroom', 'bath'], icon: 'bathroom' },
  { keywords: ['service', 'dirty'], icon: 'kitchen' },
  { keywords: ['storage'], icon: 'inventory_2' },
  { keywords: ['road', 'access', 'driveway'], icon: 'add_road' },
  { keywords: ['power', 'electric', 'utility', 'utilities'], icon: 'power' },
  { keywords: ['generator', 'backup'], icon: 'power' },
  { keywords: ['heater', 'hot'], icon: 'hot_tub' },
  { keywords: ['meter', 'water'], icon: 'water_drop' },
  { keywords: ['meter', 'electric'], icon: 'electrical_services' },
  { keywords: ['cable', 'tv', 'television'], icon: 'tv' },
  { keywords: ['phone', 'telephone', 'line'], icon: 'phone' },
  { keywords: ['kitchen', 'modern'], icon: 'kitchen' },
  { keywords: ['island'], icon: 'countertops' },
  { keywords: ['dishwasher'], icon: 'local_laundry_service' },
  { keywords: ['refrigerator', 'fridge'], icon: 'kitchen' },
  { keywords: ['microwave'], icon: 'microwave' },
  { keywords: ['hood', 'air'], icon: 'air' },
  { keywords: ['gas', 'stove', 'range'], icon: 'gas_meter' },
  { keywords: ['playground', 'children', 'kids'], icon: 'child_care' },
  { keywords: ['basketball', 'court'], icon: 'sports_basketball' },
  { keywords: ['jogging', 'path', 'walk'], icon: 'directions_walk' },
  { keywords: ['function', 'hall', 'clubhouse', 'club'], icon: 'meeting_room' },
  { keywords: ['concierge'], icon: 'support_agent' },
  { keywords: ['package', 'receiving'], icon: 'inventory' },
  { keywords: ['sky', 'lounge'], icon: 'apartment' },
  { keywords: ['coworking', 'co-working'], icon: 'work' },
  { keywords: ['business', 'center'], icon: 'business_center' },
  { keywords: ['theater', 'cinema', 'movie'], icon: 'theaters' },
  { keywords: ['game', 'room'], icon: 'sports_esports' },
  { keywords: ['transport', 'bus', 'train'], icon: 'directions_bus' },
  { keywords: ['school', 'education'], icon: 'school' },
  { keywords: ['shopping', 'mall', 'store'], icon: 'shopping_cart' },
  { keywords: ['hospital', 'medical', 'clinic'], icon: 'local_hospital' },
  { keywords: ['maid', 'helper'], icon: 'meeting_room' },
  { keywords: ['furnished', 'furniture'], icon: 'chair' },
  { keywords: ['semi', 'partial'], icon: 'weekend' },
  { keywords: ['renovate', 'renovated', 'renovation', 'new'], icon: 'construction' },
  { keywords: ['parking', 'street'], icon: 'local_parking' },
  { keywords: ['visitor'], icon: 'local_parking' },
];

function inferIconFromLabel(label: string): string {
  const lower = label.toLowerCase();
  for (const entry of ICON_KEYWORD_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.icon;
    }
  }
  return 'star';
}

async function loadCustomAmenities(): Promise<{ id: string; label: string; icon: string }[]> {
  const { data, error } = await supabase
    .from('custom_amenities')
    .select('id, label, icon')
    .order('created_at', { ascending: true });
  if (error) return [];
  return data || [];
}

async function saveCustomAmenity(item: { id: string; label: string; icon: string }): Promise<void> {
  await supabase.from('custom_amenities').insert(item);
}

async function deleteCustomAmenity(id: string): Promise<void> {
  await supabase.from('custom_amenities').delete().eq('id', id);
}

const formatWithCommas = (value: string | number) => {
  if (value === undefined || value === null || value === '') return '';
  const num = value.toString().replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};


const AddListing: React.FC<AddListingProps> = ({ onAdd, isEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Partial<PropertyListing>>({
    title: '',
    type: PropertyType.House,
    listingType: 'sale',
    price: 0,
    description: '',
    address: '',
    barangay: '',
    city: '',
    condoName: '',
    zipCode: '',
    googleMapsUrl: '',
    mapEmbedHtml: '',
    beds: 3,
    baths: 2,
    sqft: 1800,
    lotArea: 0,
    officeSpace: undefined,
    warehouseSize: undefined,
    images: [],
    amenities: [],
    featured: false,
    status: 'active',
    agent: 'Yhen',
    featuredImageIndex: 0
  });

  const [featuredDays, setFeaturedDays] = useState<number>(7);

  useEffect(() => {
    if (isEdit && id) {
      PropertyService.getById(id).then(property => {
        if (property) {
          setFormData(property);
          if (property.featuredUntil) {
            const daysRemaining = Math.ceil((new Date(property.featuredUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            setFeaturedDays(daysRemaining > 0 ? daysRemaining : 7);
          }
        }
      });
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isChecked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      let val: any = value;
      
      if (['beds', 'baths', 'sqft', 'lotArea', 'officeSpace', 'warehouseSize'].includes(name)) {
        val = value === '' ? undefined : Number(value);
      } else if (name === 'price') {
        val = value.replace(/\D/g, '');
        val = val === '' ? 0 : Number(val);
      } else if (type === 'checkbox') {
        val = isChecked;
      }

      const newData = { ...prev, [name]: val };

      if (name === 'type' && value === PropertyType.Land) {
        newData.beds = 0;
        newData.baths = 0;
      }

      return newData;
    });
  };

  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [customAmenityOptions, setCustomAmenityOptions] = useState<{ id: string; label: string; icon: string }[]>([]);

  useEffect(() => {
    loadCustomAmenities().then(setCustomAmenityOptions);
  }, []);

  const allAmenityOptions = customAmenityOptions;

  const toggleAmenity = (label: string) => {
    setFormData(prev => {
      const current = prev.amenities || [];
      const updated = current.includes(label)
        ? current.filter(a => a !== label)
        : [...current, label];
      return { ...prev, amenities: updated };
    });
  };

  const removeAmenity = (label: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter(a => a !== label)
    }));
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;

    const alreadyExists = customAmenityOptions.some(a => a.label.toLowerCase() === trimmed.toLowerCase());

    if (!alreadyExists) {
      const newOption = {
        id: `custom_${Date.now()}`,
        label: trimmed,
        icon: inferIconFromLabel(trimmed),
      };
      setCustomAmenityOptions(prev => [...prev, newOption]);
      saveCustomAmenity(newOption);
    }

    setFormData(prev => {
      const current = prev.amenities || [];
      if (current.map(a => a.toLowerCase()).includes(trimmed.toLowerCase())) return prev;
      return { ...prev, amenities: [...current, trimmed] };
    });
    setCustomAmenityInput('');
  };

  const handleCustomAmenityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomAmenity();
    }
  };

  const handleDeleteAmenity = async (amenityId: string, amenityLabel: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${amenityLabel}"? This will remove it from the database and all searches.`)) {
      return;
    }

    await deleteCustomAmenity(amenityId);
    setCustomAmenityOptions(prev => prev.filter(a => a.id !== amenityId));
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter(a => a !== amenityLabel)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const currentImages = formData.images || [];
      const totalImages = currentImages.length + files.length;

      if (totalImages > 20) {
        alert(`You can upload a maximum of 20 photos. You already have ${currentImages.length} photo(s).`);
        return;
      }

      Array.from(files).forEach(async (file: File) => {
        try {
          const originalSize = await getFileSizeInMB(file);
          const compressedBlob = await compressImage(file);
          const compressedSize = await getFileSizeInMB(compressedBlob);
          const base64 = await fileToBase64(compressedBlob);

          console.log(`Image compressed: ${originalSize.toFixed(2)}MB → ${compressedSize.toFixed(2)}MB`);

          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), base64]
          }));
        } catch (error) {
          console.error('Failed to process image:', error);
          alert('Failed to process image. Please try a different file.');
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images?.filter((_, i) => i !== index);
      let newFeaturedIndex = prev.featuredImageIndex || 0;

      // If we removed the featured image, reset to 0
      if (index === newFeaturedIndex) {
        newFeaturedIndex = 0;
      }
      // If we removed an image before the featured one, adjust the index
      else if (index < newFeaturedIndex) {
        newFeaturedIndex = newFeaturedIndex - 1;
      }

      return {
        ...prev,
        images: newImages,
        featuredImageIndex: newFeaturedIndex
      };
    });
  };

  const setFeaturedImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      featuredImageIndex: index
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.images || formData.images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const featuredUntil = formData.featured
        ? new Date(now.getTime() + featuredDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const propertyId = formData.id || Math.random().toString(36).substring(2, 11);
      const imageUrls: string[] = [];

      for (let i = 0; i < formData.images.length; i++) {
        const imageBase64 = formData.images[i];

        if (imageBase64.startsWith('http')) {
          imageUrls.push(imageBase64);
          continue;
        }

        const base64Data = imageBase64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/webp' });

        const fileName = `${propertyId}_${Date.now()}_${i}.webp`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(`public/${fileName}`, blob, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('property-images')
          .getPublicUrl(`public/${fileName}`);

        imageUrls.push(publicUrl.publicUrl);
      }

      const property: PropertyListing = {
        ...formData as PropertyListing,
        id: propertyId,
        images: imageUrls,
        dateListed: formData.id ? (formData.dateListed || new Date().toISOString()) : new Date().toISOString(),
        dateUpdated: formData.id ? new Date().toISOString() : undefined,
        featuredUntil,
        status: 'active'
      };

      await onAdd(property);
      setShowSuccess(true);

      setTimeout(() => {
        navigate(isEdit ? '/manage' : '/');
      }, 1500);

    } catch (err) {
      console.error("Submission failed:", err);
      alert("There was an error saving your listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLand = formData.type === PropertyType.Land;
  const isCommercial = formData.type === PropertyType.Commercial;
  const isWarehouse = formData.type === PropertyType.Warehouse;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-800 p-12 rounded-[40px] shadow-2xl text-center flex flex-col items-center gap-6 scale-in-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-zinc-900 shadow-xl shadow-primary/30">
              <span className="material-icons text-5xl font-bold">check_circle</span>
            </div>
            <div>
              <h2 className="text-3xl font-black dark:text-white mb-2">Listing Published!</h2>
              <p className="text-zinc-500 font-medium">Redirecting you to the home page...</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:text-primary transition-colors">
          <span className="material-icons">arrow_back</span>
        </button>
        <div>
          <span className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">PROPERTIES</span>
          <h1 className="text-3xl font-bold dark:text-white">{isEdit ? 'Edit' : 'Create'} Property Listing</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Info */}
            <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-icons text-primary">info</span> General Information
              </h2>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Listing Title</label>
                    <input 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary transition-all" 
                      placeholder="e.g. Modern Minimalist Penthouse" 
                      type="text" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Listing Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, listingType: 'sale'}))}
                        className={`py-3 rounded-xl border font-bold text-xs transition-all ${formData.listingType === 'sale' ? 'bg-primary text-zinc-900 border-primary' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                      >
                        FOR SALE
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, listingType: 'rent'}))}
                        className={`py-3 rounded-xl border font-bold text-xs transition-all ${formData.listingType === 'rent' ? 'bg-primary text-zinc-900 border-primary' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                      >
                        FOR RENT
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Agent</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, agent: 'Yhen'}))}
                        className={`py-3 rounded-xl border font-bold text-xs transition-all ${formData.agent === 'Yhen' ? 'bg-primary text-zinc-900 border-primary' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                      >
                        YHEN
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, agent: 'Daphne'}))}
                        className={`py-3 rounded-xl border font-bold text-xs transition-all ${formData.agent === 'Daphne' ? 'bg-primary text-zinc-900 border-primary' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                      >
                        DAPHNE
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, agent: 'Abby'}))}
                        className={`py-3 rounded-xl border font-bold text-xs transition-all ${formData.agent === 'Abby' ? 'bg-primary text-zinc-900 border-primary' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                      >
                        ABBY
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, agent: 'Juvy'}))}
                        className={`py-3 rounded-xl border font-bold text-xs transition-all ${formData.agent === 'Juvy' ? 'bg-primary text-zinc-900 border-primary' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                      >
                        JUVY
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Property Type</label>
                    <select 
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary text-zinc-900 dark:text-white"
                    >
                      {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Listing Price</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold pointer-events-none group-focus-within:text-primary transition-colors">₱</span>
                      <input 
                        name="price"
                        value={formatWithCommas(formData.price || 0)}
                        onChange={handleChange}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary pl-9" 
                        placeholder="0.00" 
                        type="text" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className={`grid ${isLand ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'} gap-6 transition-all duration-300`}>
                  {!isLand && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          Bedrooms {(isCommercial || isWarehouse) && <span className="text-xs text-zinc-500">(Optional)</span>}
                        </label>
                        <input name="beds" value={formData.beds || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary" type="number" min="0" required={!isCommercial && !isWarehouse} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          Bathrooms {(isCommercial || isWarehouse) && <span className="text-xs text-zinc-500">(Optional)</span>}
                        </label>
                        <input name="baths" value={formData.baths || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary" type="number" min="0" step="0.5" required={!isCommercial && !isWarehouse} />
                      </div>
                    </>
                  )}
                  {isCommercial && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Office Space (Sqm) <span className="text-xs text-zinc-500">(Optional)</span>
                      </label>
                      <input name="officeSpace" value={formData.officeSpace || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary" type="number" min="0" placeholder="Office area size" />
                    </div>
                  )}
                  {isWarehouse && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          Warehouse Size (Sqm)
                        </label>
                        <input name="warehouseSize" value={formData.warehouseSize || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary" type="number" min="0" placeholder="Main warehouse area" required />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          Office Space (Sqm) <span className="text-xs text-zinc-500">(Optional)</span>
                        </label>
                        <input name="officeSpace" value={formData.officeSpace || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary" type="number" min="0" placeholder="Office area inside warehouse" />
                      </div>
                    </>
                  )}
                  {!isCommercial && !isWarehouse && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{isLand ? 'Total Area (Sqm)' : 'Living Area (Sqm)'}</label>
                      <input name="sqft" value={formData.sqft || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary" type="number" min="0" required />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Lot Sqm</label>
                    <input name="lotArea" value={formData.lotArea || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary" type="number" min="0" placeholder="Optional" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary min-h-[150px] transition-all"
                    placeholder="Describe the property's unique features..."
                  />
                </div>
              </div>
            </section>

            {/* Features & Amenities */}
            <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span className="material-icons text-primary">auto_awesome</span> Features & Amenities
              </h2>
              <p className="text-xs text-zinc-400 mb-6">Toggle presets or type a custom feature and press Enter / Add.</p>

              {/* Selected amenities chips */}
              {(formData.amenities || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                  {(formData.amenities || []).map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-zinc-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full"
                    >
                      <span className="material-icons text-primary text-[14px]">check_circle</span>
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-1 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-icons text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Custom amenity input */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={customAmenityInput}
                  onChange={e => setCustomAmenityInput(e.target.value)}
                  onKeyDown={handleCustomAmenityKeyDown}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary text-sm"
                  placeholder="Add a custom feature (e.g. Rooftop Deck)..."
                />
                <button
                  type="button"
                  onClick={addCustomAmenity}
                  disabled={!customAmenityInput.trim()}
                  className="px-4 py-2 bg-primary text-zinc-900 font-bold text-sm rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <span className="material-icons text-[18px]">add</span>
                  Add
                </button>
              </div>

              {/* Preset toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {allAmenityOptions.map((amenity) => {
                  const isActive = formData.amenities?.includes(amenity.label);
                  const isInDatabase = customAmenityOptions.some(c => c.id === amenity.id);
                  return (
                    <div key={amenity.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => toggleAmenity(amenity.label)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                          isActive
                            ? 'bg-primary/10 border-primary shadow-sm shadow-primary/10'
                            : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        <span className={`material-icons text-xl ${isActive ? 'text-primary' : 'text-zinc-400'}`}>
                          {amenity.icon}
                        </span>
                        <span className={`text-xs font-bold flex-1 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                          {amenity.label}
                        </span>
                        {isActive && (
                          <span className="material-icons text-primary text-base">check_circle</span>
                        )}
                      </button>
                      {isInDatabase && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAmenity(amenity.id, amenity.label);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          title="Delete this amenity from database"
                        >
                          <span className="material-icons text-[14px]">close</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Location */}
            <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-icons text-primary">location_on</span> Location
              </h2>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">House/Building Number, Street Name</label>
                  <input name="address" value={formData.address} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary transition-all" placeholder="123 Skyline Blvd" type="text" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">City</label>
                    <input name="city" value={formData.city} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary transition-all" placeholder="Beverly Hills" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Barangay / District</label>
                    <input name="barangay" value={formData.barangay} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary transition-all" placeholder="Barangay Name" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">ZIP</label>
                    <input name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary transition-all" placeholder="90210" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Condo / Building Name (Optional)</label>
                  <input name="condoName" value={formData.condoName} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary transition-all" placeholder="e.g., Lumiere Residences" type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Google Maps URL (Optional)</label>
                  <input name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary transition-all" placeholder="Paste maps.google.com link here..." type="url" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Map Embed HTML (Optional)</label>
                  <textarea
                    name="mapEmbedHtml"
                    value={formData.mapEmbedHtml}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary transition-all min-h-[100px] font-mono text-xs"
                    placeholder='Paste Google Maps embed iframe HTML or URL here...'
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
                    <span className="material-icons text-sm mt-0.5">info</span>
                    <span>To get embed code: Open Google Maps → Search location → Click "Share" → "Embed a map" → Copy entire &lt;iframe&gt; code or just the URL</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Media Upload */}
            <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-icons text-primary">photo_library</span> Media
                </span>
                <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">Max 20 photos</span>
              </h2>
              {formData.images && formData.images.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <span className="material-icons text-base">info</span>
                    <span>Click on any photo to set it as the <strong>preview image</strong> for listings and social media shares.</span>
                  </p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer group">
                  <span className="material-icons text-3xl text-zinc-400 group-hover:text-primary">add_a_photo</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Upload</span>
                </div>
                {formData.images?.map((img, i) => (
                  <div
                    key={i}
                    className={`relative group aspect-square cursor-pointer ${
                      i === (formData.featuredImageIndex || 0)
                        ? 'ring-4 ring-primary ring-offset-2 dark:ring-offset-zinc-900'
                        : 'hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-600'
                    } rounded-2xl transition-all`}
                    onClick={() => setFeaturedImage(i)}
                    title={i === (formData.featuredImageIndex || 0) ? 'Preview Image' : 'Click to set as preview image'}
                  >
                    <img src={img} className="w-full h-full rounded-2xl object-cover" alt={`Property ${i + 1}`} />

                    {/* Preview Badge */}
                    {i === (formData.featuredImageIndex || 0) && (
                      <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
                        <span className="material-icons text-xs">verified</span>
                        PREVIEW
                      </div>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                    >
                      <span className="material-icons text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Status Toggle */}
            <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-icons text-primary">verified</span> Feature This Listing
                  </h2>
                  <p className="text-sm text-zinc-500">Showcase this property on the homepage 'Featured' section.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    name="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-zinc-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {formData.featured && (
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 block mb-3">Featured Duration (Days)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={featuredDays}
                      onChange={(e) => setFeaturedDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-32 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary text-center font-bold"
                    />
                    <div className="flex-1 text-sm text-zinc-500">
                      <p>This listing will be featured until <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {new Date(Date.now() + featuredDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span></p>
                      <p className="text-xs mt-1 text-zinc-400">After this date, the listing will automatically be unfeatured.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-zinc-900 rounded-2xl font-bold text-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className={`material-icons ${isSubmitting ? 'animate-spin' : ''}`}>
                {isSubmitting ? 'sync' : (isEdit ? 'save' : 'publish')}
              </span>
              {isSubmitting ? 'Processing...' : (isEdit ? 'Update Listing' : 'Publish Listing')}
            </button>
          </form>
        </div>

        {/* Live Preview Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
              <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Live Preview</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                </div>
              </div>
              <div className="p-4">
                <div className="aspect-video rounded-xl overflow-hidden relative mb-4 bg-zinc-100 dark:bg-zinc-800">
                  {formData.images && formData.images.length > 0 ? (
                    <img src={formData.images[0]} className="w-full h-full object-cover transition-all" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <span className="material-icons text-4xl">image</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-zinc-900">PREVIEW</div>
                    <div className="bg-zinc-900/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-primary">FOR {formData.listingType?.toUpperCase()}</div>
                  </div>
                  {formData.featured && (
                    <div className="absolute top-3 right-3 bg-primary text-zinc-900 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">FEATURED</div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-primary px-3 py-1 rounded-full text-xs font-bold text-zinc-900 shadow-lg">
                    ₱{(formData.price || 0).toLocaleString()}{formData.listingType === 'rent' ? '/mo' : ''}
                  </div>
                </div>
                <h3 className="text-lg font-bold truncate dark:text-white mb-1">{formData.title || 'Property Title'}</h3>
                
                <div className="flex items-start text-zinc-500 text-xs gap-1 mb-3">
                  <span className="material-icons text-[14px] text-primary mt-0.5">location_on</span>
                  <div className="flex flex-col">
                    <span className="truncate max-w-[200px]">{formData.address || 'Street Address'}</span>
                    <span className="text-[10px] text-zinc-400">
                      {formData.city || 'City'}{formData.barangay ? `, ${formData.barangay}` : ''} {formData.zipCode || ''}
                    </span>
                    {formData.condoName && (
                      <span className="text-[10px] text-primary font-semibold mt-1">{formData.condoName}</span>
                    )}
                  </div>
                </div>

                <div className={`grid ${isLand ? 'grid-cols-1' : 'grid-cols-3'} gap-2 py-3 border-y border-zinc-100 dark:border-zinc-800 mb-4 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium`}>
                  {!isLand && (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-sm text-primary">bed</span> {formData.beds || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-sm text-primary">bathtub</span> {formData.baths || 0}
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-sm text-primary">square_foot</span> {formData.sqft || 0} sqm
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 line-clamp-2 italic">
                  {formData.description || 'Description will appear here...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListing;