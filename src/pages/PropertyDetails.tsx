import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { SEO } from '../components/SEO.tsx';
import { PropertyListing, PropertyType } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';

/**
 * CONFIGURATION:
 * 1. Web3Forms access key provided by user.
 * 2. WhatsApp Business number for instant chat.
 */
const WEB3FORMS_ACCESS_KEY = "843dc172-4947-4bc8-907a-320244d9f5fa";
const WHATSAPP_NUMBER = "639467543767";
const HCAPTCHA_SITE_KEY = "50b2fe65-b00b-4b9e-ad62-3ba471098be2"; 

interface PropertyDetailsProps {
  properties: PropertyListing[];
}

const AMENITY_MAP: Record<string, string> = {
  'Central Air Conditioning': 'ac_unit',
  'Swimming Pool': 'pool',
  '1-Car Garage': 'directions_car',
  '2-Car Garage': 'directions_car',
  '3-Car Garage': 'directions_car',
  'Covered Parking': 'garage',
  'Visitor Parking': 'local_parking',
  'Street Parking': 'local_parking',
  'Smart Security System': 'security',
  '24/7 Security': 'shield',
  'CCTV Surveillance': 'videocam',
  'Biometric Access': 'fingerprint',
  'Perimeter Fence': 'fence',
  'Fire Alarm System': 'local_fire_department',
  'Backup Generator': 'power',
  'Fireplace': 'fireplace',
  'Wine Cellar': 'wine_bar',
  'Home Gym': 'fitness_center',
  'Private Garden': 'yard',
  'Landscaped Gardens': 'park',
  'Solar Panels': 'solar_power',
  'Waterfront': 'water',
  'Mountain View': 'landscape',
  'Smart Home Technology': 'settings_remote',
  'Fiber Internet': 'wifi',
  'Gated Community': 'lock',
  'Balcony': 'balcony',
  'Balcony / Terrace': 'deck',
  'Lanai/Patio': 'deck',
  'Roof Deck': 'roofing',
  'Private Elevator': 'elevator',
  'Pet Friendly': 'pets',
  'Hardwood Floors': 'layers',
  'Marble/Granite Countertops': 'countertops',
  'High Ceilings': 'unfold_more',
  'Large Windows/Natural Light': 'wb_sunny',
  'Walk-in Closet': 'checkroom',
  'Built-in Wardrobes': 'storage',
  'Study Room/Home Office': 'menu_book',
  'Powder Room': 'wc',
  'Service Area/Dirty Kitchen': 'kitchen',
  'Storage Room': 'inventory_2',
  'Road Access': 'add_road',
  'Utilities Ready': 'power',
  'Water Heater': 'hot_tub',
  'Individual Water Meter': 'water_drop',
  'Individual Electric Meter': 'electrical_services',
  'Cable TV Ready': 'tv',
  'Telephone Line Ready': 'phone',
  'Maids Room': 'meeting_room',
  'Maids Room with Bathroom': 'bathroom',
  'Fully Furnished': 'chair',
  'Semi Furnished': 'weekend',
  'Modern Kitchen': 'kitchen',
  'Kitchen Island': 'countertops',
  'Dishwasher': 'local_laundry_service',
  'Refrigerator Included': 'kitchen',
  'Microwave Included': 'microwave',
  'Range Hood': 'air',
  'Gas Range/Stove': 'gas_meter',
  "Children's Playground": 'child_care',
  'Basketball Court': 'sports_basketball',
  'Jogging Path': 'directions_walk',
  'Function Hall/Clubhouse': 'meeting_room',
  'Concierge Service': 'support_agent',
  'Package Receiving': 'inventory',
  'Sky Lounge': 'apartment',
  'Co-working Space': 'work',
  'Business Center': 'business_center',
  'Mini Theater': 'theaters',
  'Game Room': 'sports_esports',
  'Near Public Transport': 'directions_bus',
  'Near Schools': 'school',
  'Near Shopping Centers': 'shopping_cart',
  'Near Hospitals': 'local_hospital',
  'Newly Renovated': 'construction'
};

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ properties }) => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const property = properties.find(p => p.id === id || p.slug === id || p.listing_id === id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    privacyConsent: false,
    marketingConsent: false
  });

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowShareMenu(false); }, 1800);
    });
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Check out this property: "${property?.title}" in ${property?.city}\n${window.location.href}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, '')}?text=${message}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareFacebook = () => {
    const url = window.location.href;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookShareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  useEffect(() => {
    if (selectedImage || showSuccess) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, showSuccess]);

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-zinc-400">Property not found</h2>
        <Link to="/" className="text-primary font-bold hover:underline">Back to listings</Link>
      </div>
    );
  }

  const dateListedFormatted = property.dateListed
    ? new Date(property.dateListed).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recently';

  const dateUpdatedFormatted = property.dateUpdated
    ? new Date(property.dateUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      alert('Please complete the captcha verification.');
      return;
    }

    setIsSubmitting(true);

    const submissionData = {
      access_key: WEB3FORMS_ACCESS_KEY,
      name: formData.name,
      email: formData.email,
      message: formData.message,
      privacy_consent: formData.privacyConsent,
      marketing_consent: formData.marketingConsent,
      from_name: "Yhen's Property Pro Website",
      subject: `New Lead: ${property.title}`,
      property_info: `${property.title} in ${property.city}`,
      page_url: window.location.href,
      'h-captcha-response': captchaToken,
    };

    try {
      const [emailResponse, dbResponse] = await Promise.all([
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(submissionData),
        }),
        supabase
          .from('property_inquiries')
          .insert({
            property_id: property.id,
            property_title: property.title,
            name: formData.name,
            email: formData.email,
            message: formData.message,
            privacy_consent: formData.privacyConsent,
            marketing_consent: formData.marketingConsent
          })
      ]);

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        setShowSuccess(true);
        setFormData({ name: '', email: '', message: '', privacyConsent: false, marketingConsent: false });
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      } else {
        console.error("Email Submission Failure:", emailResult);
        alert(`Error: ${emailResult.message}. Tip: Check if you have verified your Web3Forms email address.`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again or use the WhatsApp button.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi Yhen, I'm interested in "${property.title}" located in ${property.city}. \n\nCheck out the property details here: ${window.location.href}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  const isLand = property.type === PropertyType.Land;

  const generateSEOTitle = (): string => {
    const unitType = property.type;
    const transactionType = property.listingType === 'sale' ? 'for Sale' : 'for Rent';
    const location = property.city;
    const buildingName = property.condoName || property.barangay;

    return `${unitType} ${transactionType} in ${location} | ${buildingName} | Yhen's Property`;
  };

  const generateSEODescription = (): string => {
    const priceFormatted = `₱${property.price.toLocaleString()}`;
    const transactionType = property.listingType === 'sale' ? 'for sale' : 'for rent';

    let desc = `${property.type} ${transactionType} in ${property.city} at ${priceFormatted}`;

    if (!isLand) {
      desc += ` • ${property.beds} bed${property.beds > 1 ? 's' : ''}, ${property.baths} bath${property.baths > 1 ? 's' : ''}`;
    }

    desc += ` • ${property.sqft.toLocaleString()} sqm`;

    if (property.condoName) {
      desc += ` • Located in ${property.condoName}`;
    }

    if (property.address && property.address !== property.city) {
      desc += ` near ${property.address}`;
    }

    const remainingLength = 160 - desc.length;
    if (remainingLength > 20 && property.description) {
      const snippet = property.description.substring(0, remainingLength - 3).trim();
      desc += ` • ${snippet}...`;
    }

    return desc.substring(0, 160);
  };

  const generateImageAlt = (imageIndex: number): string => {
    const baseDesc = `${property.type} ${property.listingType === 'sale' ? 'for sale' : 'for rent'} in ${property.city}`;

    if (imageIndex === 0) {
      let altText = `${baseDesc}`;
      if (!isLand) {
        altText += ` - ${property.beds} bedroom, ${property.baths} bathroom`;
      }
      if (property.condoName) {
        altText += ` at ${property.condoName}`;
      }
      return altText;
    }

    const viewDescriptions = ['exterior view', 'interior view', 'amenities', 'neighborhood', 'detailed view'];
    const viewType = viewDescriptions[Math.min(imageIndex - 1, viewDescriptions.length - 1)];

    return `${baseDesc} - ${viewType}`;
  };

  const pageTitle = generateSEOTitle();
  const pageDescription = generateSEODescription();
  const pageUrl = window.location.href;
  const featuredIndex = property.featuredImageIndex ?? 0;
  const featuredImageUrl = property.images[featuredIndex] ?? property.images[0];
  const imageUrl = featuredImageUrl
    ? (featuredImageUrl.startsWith('http') ? featuredImageUrl : `${window.location.origin}${featuredImageUrl}`)
    : `${window.location.origin}/Image/Hero_Villa.png`;
  const imageAlt = generateImageAlt(featuredIndex);

  const getImageType = (url: string): string => {
    if (url.endsWith('.webp')) return 'image/webp';
    if (url.endsWith('.png')) return 'image/png';
    if (url.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
  };

  const imageType = getImageType(imageUrl);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": pageUrl,
    "image": property.images,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "PHP",
      "availability": property.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": property.price,
        "priceCurrency": "PHP"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.city,
      "addressRegion": property.barangay,
      "postalCode": property.zipCode,
      "addressCountry": "PH"
    },
    "numberOfRooms": !isLand ? property.beds : undefined,
    "numberOfBathroomsTotal": !isLand ? property.baths : undefined,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.sqft,
      "unitCode": "MTK"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Property Type",
        "value": property.type
      },
      {
        "@type": "PropertyValue",
        "name": "Listing Type",
        "value": property.listingType === 'sale' ? 'For Sale' : 'For Rent'
      },
      {
        "@type": "PropertyValue",
        "name": "Lot Area",
        "value": property.lotArea ? `${property.lotArea} sqm` : 'N/A'
      }
    ],
    "amenityFeature": property.amenities.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity
    })),
    "datePosted": property.dateListed,
    "dateModified": property.dateUpdated || property.dateListed
  };

  const categorySlug = property.listingType === 'rent'
    ? 'rent'
    : property.type === PropertyType.House || property.type === PropertyType.Villa
      ? 'buy-houses'
      : property.type === PropertyType.Condo
        ? 'buy-condos'
        : property.type === PropertyType.Land
          ? 'buy-land'
          : '';

  const categoryName = property.listingType === 'rent'
    ? `Rent ${property.type}`
    : property.type === PropertyType.House || property.type === PropertyType.Villa
      ? 'Buy Houses/Villas'
      : `Buy ${property.type}s`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryName,
        "item": `${window.location.origin}/category/${categorySlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": property.title,
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={pageUrl}
        ogType="website"
        ogTitle={property.title}
        ogDescription={pageDescription}
        ogUrl={pageUrl}
        ogImage={imageUrl}
        ogImageWidth="1200"
        ogImageHeight="630"
        ogImageAlt={imageAlt}
        ogImageType={imageType}
        ogSiteName="Yhen's Property"
        ogLocale="en_PH"
        ogPriceAmount={property.price.toString()}
        ogPriceCurrency="PHP"
        twitterCard="summary_large_image"
        twitterTitle={property.title}
        twitterDescription={pageDescription}
        twitterImage={imageUrl}
        structuredData={structuredData}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-6 relative">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 p-12 rounded-[40px] shadow-2xl text-center flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center shadow-xl shadow-primary/20">
              <span className="material-icons text-zinc-900 text-5xl font-bold">check_circle</span>
            </div>
            <div>
              <h2 className="text-3xl font-black dark:text-white mb-2 tracking-tighter">Inquiry Sent!</h2>
              <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">Your message has been received. Yhen will contact you shortly.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="px-10 py-4 bg-primary text-zinc-900 font-bold rounded-2xl hover:scale-105 transition-all">Done</button>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/95 backdrop-blur-md p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 z-[110] w-14 h-14 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-primary shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 hover:brightness-125 transition-all group"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <span className="material-icons text-4xl font-black">close</span>
          </button>

          {property.images.length > 1 && (
            <>
              <button
                className="absolute left-4 md:left-8 z-[110] w-12 h-12 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-primary shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 hover:brightness-125 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = selectedImageIndex === 0 ? property.images.length - 1 : selectedImageIndex - 1;
                  setSelectedImageIndex(newIndex);
                  setSelectedImage(property.images[newIndex]);
                }}
                title="Previous image"
              >
                <span className="material-icons text-2xl font-black">chevron_left</span>
              </button>

              <button
                className="absolute right-4 md:right-8 z-[110] w-12 h-12 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-primary shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 hover:brightness-125 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = selectedImageIndex === property.images.length - 1 ? 0 : selectedImageIndex + 1;
                  setSelectedImageIndex(newIndex);
                  setSelectedImage(property.images[newIndex]);
                }}
                title="Next image"
              >
                <span className="material-icons text-2xl font-black">chevron_right</span>
              </button>

              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[110] bg-zinc-900/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-white text-sm font-bold shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {selectedImageIndex + 1} / {property.images.length}
              </div>
            </>
          )}

          <img
            src={selectedImage}
            alt={generateImageAlt(selectedImageIndex)}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="mb-6">
        <nav className="flex text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 gap-2">
          <Link
            to={property.listingType === 'rent' ? "/category/rent" : (property.type === PropertyType.House || property.type === PropertyType.Villa) ? "/category/buy-houses" : property.type === PropertyType.Condo ? "/category/buy-condos" : property.type === PropertyType.Land ? "/category/buy-land" : "/"}
            className="hover:text-primary transition-colors"
          >
            {property.listingType === 'rent'
              ? `RENT ${property.type.toUpperCase()}`
              : (property.type === PropertyType.House || property.type === PropertyType.Villa)
                ? 'BUY HOUSES/VILLAS'
                : `BUY ${property.type.toUpperCase()}S`
            }
          </Link>
          <span>/</span>
          <span className="text-zinc-500">{property.city}</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black dark:text-white tracking-tighter leading-none">{property.title}</h1>
            <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">#{property.listing_id}</span>
            <div className="relative flex-shrink-0" ref={shareRef}>
              <button
                onClick={() => setShowShareMenu(v => !v)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-primary hover:text-zinc-900 text-zinc-500 dark:text-zinc-400 transition-all"
                title="Share"
              >
                <span className="material-icons text-[20px]">share</span>
              </button>
              {showShareMenu && (
                <div className="absolute right-0 md:left-0 top-12 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden w-48 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="material-icons text-[18px] text-zinc-400">{copied ? 'check_circle' : 'link'}</span>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 mx-3"></div>
                  <button
                    onClick={handleShareFacebook}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <svg className="w-[18px] h-[18px] fill-[#1877F2] flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 mx-3"></div>
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <svg className="w-[18px] h-[18px] fill-[#25D366] flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {dateUpdatedFormatted && (
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/80 px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <span className="material-icons text-zinc-400 text-base">update</span>
                <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Updated {dateUpdatedFormatted}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <span className="material-icons text-primary text-base">schedule</span>
              <span className="text-[9px] font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">Listed {dateListedFormatted}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-zinc-500 font-medium mt-3">
          <div className="flex items-center gap-2">
            <span className="material-icons text-primary text-sm">location_on</span>
            <span className="text-sm">{property.address}, {property.city}, {property.barangay}</span>
          </div>
          {property.condoName && (
            <div className="flex items-center gap-2 text-primary font-semibold">
              <span className="material-icons text-sm">apartment</span>
              <span className="text-sm">{property.condoName}</span>
            </div>
          )}
          {property.googleMapsUrl && (
            <div className="flex items-center gap-2">
              <a
                href={property.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-bold text-sm flex items-center gap-1"
              >
                <span className="material-icons text-sm">map</span>
                View on Google Maps
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 h-auto lg:h-[400px] relative">
            <div
              className="col-span-2 lg:row-span-2 relative group overflow-hidden rounded-2xl shadow-lg cursor-zoom-in h-64 sm:h-80 lg:h-full"
              onClick={() => {
                const featIdx = property.featuredImageIndex ?? 0;
                setSelectedImage(property.images[featIdx] ?? property.images[0]);
                setSelectedImageIndex(featIdx);
              }}
            >
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={property.images[property.featuredImageIndex ?? 0] ?? property.images[0]} alt={generateImageAlt(property.featuredImageIndex ?? 0)} loading="eager" width="1200" height="800" />
            </div>
            {property.images.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-md cursor-zoom-in h-32 sm:h-40 lg:h-auto"
                onClick={() => {
                  setSelectedImage(img);
                  setSelectedImageIndex(idx + 1);
                }}
              >
                <img className="w-full h-full object-cover" src={img} alt={generateImageAlt(idx + 1)} loading="lazy" width="800" height="600" />
              </div>
            ))}
          </div>

          <section className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex-1 min-w-[200px]">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-1">Listing Price</span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black dark:text-white tracking-tighter">
                  ₱{property.price.toLocaleString()}{property.listingType === 'rent' ? '/mo' : ''}
                </div>
              </div>

              <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

              <div className={`flex-grow grid ${isLand ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-5'} gap-4 items-center`}>
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
                {property.type === PropertyType.Warehouse && property.warehouseSize && (
                  <div className="text-center">
                    <span className="material-icons text-primary text-xl block mb-0.5">warehouse</span>
                    <span className="block font-black text-lg dark:text-white leading-none">{property.warehouseSize.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Warehouse sqm</span>
                  </div>
                )}
                {(property.type === PropertyType.Commercial || property.type === PropertyType.Warehouse) && property.officeSpace && (
                  <div className="text-center">
                    <span className="material-icons text-primary text-xl block mb-0.5">business_center</span>
                    <span className="block font-black text-lg dark:text-white leading-none">{property.officeSpace.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Office sqm</span>
                  </div>
                )}
                <div className="text-center">
                  <span className="material-icons text-primary text-xl block mb-0.5">square_foot</span>
                  <span className="block font-black text-lg dark:text-white leading-none">{property.sqft.toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">{isLand ? 'Total Area' : 'Living sqm'}</span>
                </div>
                <div className="text-center">
                  <span className="material-icons text-primary text-xl block mb-0.5">landscape</span>
                  <span className="block font-black text-lg dark:text-white leading-none">{(property.lotArea || 0).toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Lot Sqm</span>
                </div>
                <div className="text-center">
                  <span className="material-icons text-primary text-xl block mb-0.5">apartment</span>
                  <span className="block font-black text-lg dark:text-white leading-none">{property.type}</span>
                  <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Type</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3 dark:text-white tracking-tighter">
              <span className="w-1.5 h-8 bg-primary rounded-full"></span> About This Property
            </h2>
            <div className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium text-base max-w-3xl">
              {property.description}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3 dark:text-white tracking-tighter">
              <span className="w-1.5 h-8 bg-primary rounded-full"></span> Features & Amenities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {property.amenities.map((amenity, i) => (
                <div key={i} className="flex items-center p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center mr-4 shadow-sm">
                    <span className="material-icons text-primary text-lg">
                      {AMENITY_MAP[amenity] || 'verified'}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 tracking-tight">{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {(property.googleMapsUrl || property.mapEmbedHtml) && (
            <section>
              <h2 className="text-2xl font-black mb-4 flex items-center gap-3 dark:text-white tracking-tighter">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span> Location
              </h2>
              {property.mapEmbedHtml ? (
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg bg-zinc-100 dark:bg-zinc-800">
                  <iframe
                    src={(() => {
                      const srcMatch = property.mapEmbedHtml.match(/src=["']([^"']+)["']/);
                      if (srcMatch && srcMatch[1]) {
                        return srcMatch[1];
                      }

                      const urlMatch = property.mapEmbedHtml.match(/https:\/\/www\.google\.com\/maps\/embed[^\s"'<>]*/);
                      if (urlMatch) {
                        return urlMatch[0];
                      }

                      return '';
                    })()}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Property Location Map"
                  />
                </div>
              ) : property.googleMapsUrl ? (
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-icons text-primary text-4xl">location_on</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 font-semibold mb-2">
                      {property.address}, {property.city}
                    </p>
                    <p className="text-zinc-400 text-sm mb-4">{property.barangay}</p>
                    <a
                      href={property.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-zinc-900 font-bold rounded-xl hover:brightness-110 transition-all"
                    >
                      <span className="material-icons text-base">map</span>
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              ) : null}
              {property.googleMapsUrl && (
                <a
                  href={property.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-primary hover:underline font-bold text-sm"
                >
                  <span className="material-icons text-base">open_in_new</span>
                  Open in Google Maps
                </a>
              )}
            </section>
          )}
        </div>

        {/* Sidebar / Form */}
        <div className="lg:col-span-4 relative">
          <div className="lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 ring-1 ring-black/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                  <span className="material-icons text-zinc-900 text-3xl font-black">home_work</span>
                </div>
                <div>
                  <h3 className="font-black text-2xl dark:text-white tracking-tighter">Yhen</h3>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-0.5">Property Specialist</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleInquirySubmit}>
                <div>
                  <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold focus:ring-primary focus:border-primary transition-all placeholder:text-zinc-300"
                    placeholder="John Doe"
                    type="text" required disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold focus:ring-primary focus:border-primary transition-all placeholder:text-zinc-300"
                    placeholder="john@example.com"
                    type="email" required disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 px-1">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold focus:ring-primary focus:border-primary min-h-[100px] resize-none placeholder:text-zinc-300"
                    placeholder="I am interested in this property..."
                    required disabled={isSubmitting}
                  />
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {/* Mandatory Privacy Consent */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacyConsent"
                      name="privacyConsent"
                      checked={formData.privacyConsent}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                      required
                    />
                    <label htmlFor="privacyConsent" className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <Link
                        to="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline"
                      >
                        Privacy Policy
                      </Link>{' '}
                      and consent to Yhen's Property processing my data to handle this inquiry.
                    </label>
                  </div>

                  {/* Optional Marketing Consent */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="marketingConsent"
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="marketingConsent" className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed cursor-pointer">
                      Keep me updated with new property listings, market reports, and investment opportunities via email.
                    </label>
                  </div>
                </div>

                <div className="flex justify-center py-2">
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={HCAPTCHA_SITE_KEY}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.privacyConsent || !captchaToken}
                    className="w-full bg-primary text-zinc-900 font-black py-3.5 rounded-xl shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!formData.privacyConsent ? "Please accept the privacy policy to continue" : !captchaToken ? "Please complete the captcha verification" : ""}
                  >
                    {isSubmitting ? (
                      <span className="material-icons animate-spin text-lg">sync</span>
                    ) : (
                      <span className="material-icons text-lg group-hover:translate-x-1 transition-transform">send</span>
                    )}
                    <span className="text-base">{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppClick}
                    className="w-full bg-[#25D366] text-white font-black py-3.5 rounded-xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-base">WhatsApp Inquiry</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      {(() => {
        const featuredProps = properties.filter(p =>
          p.featured &&
          (p.status === 'active' || p.status === 'draft') &&
          p.id !== property.id
        );

        return featuredProps.length > 0 ? (
          <section className="py-16 border-t border-zinc-200 dark:border-zinc-800 mt-16">
            <div className="mb-12">
              <span className="text-primary font-bold tracking-[0.4em] text-[11px] mb-4 block uppercase">Featured Properties</span>
              <h2 className="text-4xl font-black dark:text-white tracking-tighter">You Might Also Like</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredProps.slice(0, 3).map((prop) => (
                <Link
                  key={prop.id}
                  to={`/property/${prop.slug}`}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-all"
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={prop.images[prop.featuredImageIndex ?? 0] ?? prop.images[0]}
                      alt={`${prop.type} ${prop.listingType === 'sale' ? 'for sale' : 'for rent'} in ${prop.city}${!isLand && prop.beds ? ` - ${prop.beds} bedroom, ${prop.baths} bathroom` : ''}${prop.condoName ? ` at ${prop.condoName}` : ''}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      width="800"
                      height="600"
                    />
                    <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur text-primary border border-primary/30 font-bold px-2.5 py-1 rounded-full text-[9px] tracking-widest shadow-lg">
                      FEATURED
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-2.5 py-1 rounded-lg">
                      <span className="font-bold dark:text-white text-sm">
                        ₱{prop.price.toLocaleString()}{prop.listingType === 'rent' ? '/mo' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {prop.title}
                    </h3>
                    <p className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                      <span className="material-icons text-xs">place</span> {prop.city}, {prop.barangay}
                    </p>
                    {prop.condoName && (
                      <p className="text-primary text-[10px] font-semibold mb-3">{prop.condoName}</p>
                    )}
                    <div className={`flex items-center gap-2 text-xs font-bold text-zinc-500 ${prop.type === PropertyType.Land ? 'justify-between' : 'justify-between'}`}>
                      {prop.type !== PropertyType.Land && (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="material-icons text-[14px] text-primary">king_bed</span>
                            <span>{prop.beds}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-icons text-[14px] text-primary">bathtub</span>
                            <span>{prop.baths}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-[14px] text-primary">square_foot</span>
                        <span>{prop.sqft.toLocaleString()} sqm</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null;
      })()}
    </div>
    </>
  );
};

export default PropertyDetails;