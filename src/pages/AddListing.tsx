import React, { useState, useRef, useEffect } from 'react';
// Force reload to fix potential build sync issues
import { useNavigate, useParams } from 'react-router-dom';
import { PropertyListing, PropertyType } from '../types.ts';
import { PropertyService } from '../services/propertyService.ts';
import { supabase } from '../services/supabaseClient.ts';
import { SEO } from '../components/SEO.tsx';
import { compressImage, fileToBase64, getFileSizeInMB } from '../utils/imageCompression.ts';

interface AddListingProps {
  onAdd: (property: PropertyListing) => Promise<void>;
  isEdit?: boolean;
}

const ICON_KEYWORD_MAP: { keywords: string[]; icon: string }[] = [
  { keywords: ['gold', 'karat', 'k', 'pure', 'purity'], icon: 'diamond' },
  { keywords: ['cert', 'verify', 'legal', 'official'], icon: 'verified' },
  { keywords: ['stamp', 'hallmark', 'mark'], icon: 'approval' },
  { keywords: ['new', 'mint', 'perfect'], icon: 'new_releases' },
  { keywords: ['watch', 'rolex'], icon: 'watch' },
  { keywords: ['ring'], icon: 'fiber_manual_record' },
  { keywords: ['safe', 'secure', 'box'], icon: 'lock' },
];

function inferIconFromLabel(label: string): string {
  const lower = label.toLowerCase();
  for (const entry of ICON_KEYWORD_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.icon;
    }
  }
  return 'label'; // Default generic tag icon
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

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

const AddListing: React.FC<AddListingProps> = ({ onAdd, isEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Partial<PropertyListing>>({
    title: '',
    type: PropertyType.Jewelry,
    price: 0,
    description: '',
    address: '',
    barangay: '',
    city: '',
    condoName: '',
    zipCode: '',
    googleMapsUrl: '',
    mapEmbedHtml: '',
    beds: 18, // Karat
    baths: 0,  // Weight
    lotArea: 0,
    origin: 'Saudi Gold',
    amenities: [],
    images: [],
    featured: false,
    agent: 'Yhen',
    status: 'active'
  });

  const [customAmenityOptions, setCustomAmenityOptions] = useState<{ id: string; label: string; icon: string }[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [featuredDays, setFeaturedDays] = useState(30);

  useEffect(() => {
    const fetchAmenities = async () => {
      const data = await loadCustomAmenities();
      setCustomAmenityOptions(data);
    };
    fetchAmenities();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      PropertyService.getById(id).then(property => {
        if (property) {
          setFormData(prev => ({ ...prev, ...property }));
        }
      });
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'price') {
      const numValue = parseInt(value.replace(/\D/g, '')) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'beds' || name === 'baths' || name === 'sqft' || name === 'lotArea') {
      const numValue = name === 'baths' ? parseFloat(value) : parseInt(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsSubmitting(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImage(files[i]);
        const base64 = await fileToBase64(compressed);
        newImages.push(base64);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImages].slice(0, 20)
    }));
    setIsSubmitting(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = (prev.images || []).filter((_, i) => i !== index);
      let newFeaturedIndex = prev.featuredImageIndex || 0;
      if (index === newFeaturedIndex) newFeaturedIndex = 0;
      else if (index < newFeaturedIndex) newFeaturedIndex--;
      
      return {
        ...prev,
        images: newImages,
        featuredImageIndex: newFeaturedIndex
      };
    });
  };

  const setFeaturedImage = (index: number) => {
    setFormData(prev => ({ ...prev, featuredImageIndex: index }));
  };

  const toggleAmenity = (label: string) => {
    setFormData(prev => {
      const current = prev.amenities || [];
      if (current.includes(label)) {
        return { ...prev, amenities: current.filter(a => a !== label) };
      } else {
        return { ...prev, amenities: [...current, label] };
      }
    });
  };

  const removeAmenity = (label: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter(a => a !== label)
    }));
  };

  const addCustomAmenity = async () => {
    if (!customAmenityInput.trim()) return;
    const label = customAmenityInput.trim();
    if (customAmenityOptions.some(a => a.label.toLowerCase() === label.toLowerCase())) {
      setCustomAmenityInput('');
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      label,
      icon: inferIconFromLabel(label)
    };

    await saveCustomAmenity(newItem);
    setCustomAmenityOptions(prev => [...prev, newItem]);
    toggleAmenity(label);
    setCustomAmenityInput('');
  };

  const handleCustomAmenityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomAmenity();
    }
  };

  const handleDeleteAmenity = async (id: string, label: string) => {
    await deleteCustomAmenity(id);
    setCustomAmenityOptions(prev => prev.filter(a => a.id !== id));
    removeAmenity(label);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const propertyId = formData.id || crypto.randomUUID();
      const slug = formData.slug || `${slugify(formData.title || 'item')}-${propertyId.slice(0, 8)}`;
      
      let listingId = formData.listing_id;
      if (!listingId) {
        // Fetch all properties to find the highest number
        try {
          const allProps = await PropertyService.getAll();
          // Filter for listing IDs that are purely numeric 3-digit format (or close to it)
          const maxNum = allProps.reduce((max, p) => {
            // Check if it's a 3-digit-like number (001, 002, etc)
            const match = p.listing_id?.match(/^\d+$/);
            if (match) {
              const num = parseInt(match[0]);
              // Ignore high random numbers like 5147 to let it start from 001
              if (num > 500) return max; 
              return num > max ? num : max;
            }
            return max;
          }, 0);
          listingId = (maxNum + 1).toString().padStart(3, '0');
        } catch (err) {
          console.error("Failed to fetch existing listings for ID generation:", err);
          listingId = `001`; // Fallback
        }
      }

      const propertyData = {
        ...formData,
        id: propertyId,
        slug: slug,
        listing_id: listingId,
        dateListed: formData.dateListed || new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
        featuredUntil: formData.featured 
          ? new Date(Date.now() + featuredDays * 24 * 60 * 60 * 1000).toISOString()
          : null
      } as PropertyListing;

      // Use the onAdd prop which handles both Add/Update and state refresh in App.tsx
      await onAdd(propertyData);

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/manage');
      }, 2000);
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert(`Error saving listing: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAmenityOptions = [
    { id: '18k', label: '18K Gold', icon: 'diamond' },
    { id: '21k', label: '21K Gold', icon: 'diamond' },
    { id: '24k', label: '24K Gold', icon: 'diamond' },
    { id: 'cert', label: 'Certified', icon: 'verified' },
    { id: 'hallmark', label: 'Hallmark Stamped', icon: 'approval' },
    { id: 'mint', label: 'Mint Condition', icon: 'new_releases' },
    ...customAmenityOptions
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SEO
        title={`${isEdit ? 'Edit' : 'Add'} Listing - YGB Gold`}
        description="Admin portal to manage gold and precious metal listings."
      />
      
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
            <span className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">GOLD INVENTORY</span>
            <h1 className="text-3xl font-bold dark:text-white">{isEdit ? 'Edit' : 'Create'} Gold Item Listing</h1>
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
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Listing Title</label>
                      <input 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary transition-all" 
                        placeholder="e.g. 18k Yellow Gold Rolex" 
                        type="text" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Item Category</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-2.5"
                        required
                      >
                        <option value="">Select Category</option>
                        {Object.values(PropertyType).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
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

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Purity (Karat)</label>
                      <select
                        name="beds"
                        value={formData.beds || 18}
                        onChange={handleChange}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-2.5"
                        required
                      >
                        <option value="18">18K</option>
                        <option value="21">21K</option>
                        <option value="24">24K</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Weight (Grams)</label>
                      <input name="baths" value={formData.baths || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary" type="number" min="0" step="0.01" placeholder="0.00" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Origin</label>
                      <select
                        name="origin"
                        value={formData.origin || 'Saudi Gold'}
                        onChange={handleChange}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-2.5"
                        required
                      >
                        <option value="Saudi Gold">Saudi Gold</option>
                        <option value="Japan Gold">Japan Gold</option>
                        <option value="Chinese Gold">Chinese Gold</option>
                        <option value="Hongkong Gold">Hongkong Gold</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Serial/ID</label>
                      <input name="lotArea" value={formData.lotArea || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary" type="text" placeholder="Optional" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary min-h-[150px]"
                      placeholder="Describe the item's condition..." 
                    />
                  </div>
                </div>
              </section>

              {/* Tags */}
              <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-icons text-primary">auto_awesome</span> Tags & Hallmarks
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {(formData.amenities || []).map((amenity) => (
                    <span key={amenity} className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-zinc-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {amenity}
                      <button type="button" onClick={() => removeAmenity(amenity)} className="text-zinc-400 hover:text-red-500">
                        <span className="material-icons text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={customAmenityInput}
                    onChange={e => setCustomAmenityInput(e.target.value)}
                    onKeyDown={handleCustomAmenityKeyDown}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary text-sm"
                    placeholder="Add a custom tag..."
                  />
                  <button type="button" onClick={addCustomAmenity} className="px-4 py-2 bg-primary text-zinc-900 font-bold text-sm rounded-xl">Add</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allAmenityOptions.map((amenity) => {
                    const isActive = formData.amenities?.includes(amenity.label);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.label)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${isActive ? 'bg-primary/10 border-primary' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700'}`}
                      >
                        <span className="material-icons text-sm text-primary">{amenity.icon}</span>
                        <span className="text-xs font-bold flex-1">{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Media */}
              <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-icons text-primary">photo_library</span> Media
                </h2>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary">
                    <span className="material-icons text-2xl text-zinc-400">add_a_photo</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Upload</span>
                  </div>
                  {formData.images?.map((img, i) => (
                    <div key={i} className="relative aspect-square group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100">
                        <span className="material-icons text-xs">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-zinc-900 rounded-2xl font-bold text-lg hover:brightness-110 shadow-lg"
              >
                {isSubmitting ? 'Processing...' : (isEdit ? 'Update Listing' : 'Publish Listing')}
              </button>
            </form>
          </div>

          {/* Sidebar Preview */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {formData.images && formData.images.length > 0 ? (
                    <img src={formData.images[0]} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <span className="material-icons text-5xl">image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded-full text-xs font-bold text-zinc-900 shadow-lg">
                    ₱{(formData.price || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold dark:text-white mb-2">{formData.title || 'Item Title'}</h3>
                  <div className="flex items-center gap-4 text-zinc-500 text-sm mb-4">
                    <span className="flex items-center gap-1"><span className="material-icons text-sm text-primary">diamond</span> {formData.beds || 0}K</span>
                    <span className="flex items-center gap-1"><span className="material-icons text-sm text-primary">scale</span> {formData.baths || 0}g</span>
                    <span className="flex items-center gap-1"><span className="material-icons text-sm text-primary">public</span> {formData.origin || 'Saudi Gold'}</span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 italic mb-4">
                    {formData.description || 'Description will appear here...'}
                  </p>
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{formData.type}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
