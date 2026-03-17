import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { supabase } from '../services/supabaseClient.ts';
import { SEO } from '../components/SEO.tsx';

const HCAPTCHA_SITE_KEY = "50b2fe65-b00b-4b9e-ad62-3ba471098be2";

const Sell: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    propertyType: 'residential',
    city: '',
    barangay: '',
    askingPrice: '',
    description: '',
    hasTitle: 'yes',
    urgency: 'moderate',
    privacyConsent: false,
    marketingConsent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    if (showSuccess) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      setSubmitMessage({
        type: 'error',
        text: 'Please complete the captcha verification.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const submissionData = {
        access_key: '843dc172-4947-4bc8-907a-320244d9f5fa',
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        whatsapp_number: formData.whatsappNumber,
        property_type: formData.propertyType,
        city: formData.city,
        barangay: formData.barangay,
        asking_price: formData.askingPrice || 'Not specified',
        description: formData.description,
        has_title: formData.hasTitle === 'yes' ? 'Yes' : 'No',
        urgency: formData.urgency,
        privacy_consent: formData.privacyConsent,
        marketing_consent: formData.marketingConsent,
        from_name: "Yhen's Property - Seller Inquiry",
        subject: `New Seller Inquiry: ${formData.propertyType} in ${formData.city}`,
        'h-captcha-response': captchaToken,
      };

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit inquiry');
      }

      const { data: insertedData, error: dbError } = await supabase
        .from('seller_inquiries')
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            phone_number: formData.phoneNumber,
            whatsapp_number: formData.whatsappNumber,
            property_type: formData.propertyType,
            city: formData.city,
            barangay: formData.barangay,
            asking_price: formData.askingPrice ? parseInt(formData.askingPrice.replace(/\D/g, '')) : null,
            description: formData.description,
            has_title: formData.hasTitle === 'yes',
            urgency: formData.urgency,
            privacy_consent: formData.privacyConsent,
            marketing_consent: formData.marketingConsent,
          }
        ])
        .select();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      const sellerInquiryId = insertedData && insertedData.length > 0 ? insertedData[0].id : null;

      await supabase
        .from('seller_inquiry_emails')
        .insert([
          {
            seller_inquiry_id: sellerInquiryId,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phoneNumber,
            whatsapp: formData.whatsappNumber,
            property_type: formData.propertyType,
            city: formData.city,
            barangay: formData.barangay,
            asking_price: formData.askingPrice || null,
            description: formData.description,
            has_title: formData.hasTitle,
            urgency: formData.urgency,
            privacy_consent: formData.privacyConsent,
            marketing_consent: formData.marketingConsent,
          }
        ]);

      setShowSuccess(true);

      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        whatsappNumber: '',
        propertyType: 'residential',
        city: '',
        barangay: '',
        askingPrice: '',
        description: '',
        hasTitle: 'yes',
        urgency: 'moderate',
        privacyConsent: false,
        marketingConsent: false,
      });
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Failed to submit inquiry. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = "639467543767";

  return (
    <>
      <SEO
        title="List Your Property - Sell Real Estate in the Philippines | Yhen's Property"
        description="Sell your property with Yhen's Property. Connect with serious buyers across the Philippines. Expert guidance for condos, houses, villas, and land sales."
        type="website"
        url="https://yhens-property.com/sell"
      />
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
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

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-2">Ready to Sell?</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold dark:text-white mb-4">List Your Property With Us</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Join Yhen's Property and connect with serious buyers across the Philippines. We handle the details so you can focus on what matters.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="bg-primary/10 p-3 rounded-xl text-primary">
                  <span className="material-icons text-xl">assignment</span>
                </span>
                Property Information Required
              </h2>

              <div className="space-y-6 mb-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-zinc-800 dark:to-zinc-800/50 p-4 rounded-xl border border-blue-100 dark:border-zinc-700">
                    <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Documentation</h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <li>✓ Certificate of Title (TCT or CCT)</li>
                      <li>✓ Tax Declaration (Larong Assessment)</li>
                      <li>✓ Real Property Tax Clearance</li>
                      <li>✓ Valid Government ID (seller)</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-50/50 dark:from-zinc-800 dark:to-zinc-800/50 p-4 rounded-xl border border-green-100 dark:border-zinc-700">
                    <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">Property Details</h3>
                    <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                      <li>✓ Lot number & lot area</li>
                      <li>✓ Building area / floor area</li>
                      <li>✓ Number of bedrooms & bathrooms</li>
                      <li>✓ Property condition & features</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-zinc-800 dark:to-zinc-800/50 p-4 rounded-xl border border-amber-100 dark:border-zinc-700">
                    <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">Legal Requirements</h3>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                      <li>✓ Title free from encumbrances</li>
                      <li>✓ No lis pendens or adverse claims</li>
                      <li>✓ All taxes & assessments current</li>
                      <li>✓ Property classification confirmed</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-zinc-800 dark:to-zinc-800/50 p-4 rounded-xl border border-purple-100 dark:border-zinc-700">
                    <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2">Marketing Materials</h3>
                    <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                      <li>✓ High-quality photos (up to 20)</li>
                      <li>✓ Property description & highlights</li>
                      <li>✓ Location map & coordinates</li>
                      <li>✓ Asking price & sale terms</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                  <div className="flex gap-3">
                    <span className="material-icons text-blue-600 dark:text-blue-400 text-xl flex-shrink-0 mt-0.5">info</span>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-semibold mb-1">Important Note:</p>
                      <p>All sellers must provide valid proof of ownership and government-issued ID. If married, spouse consent is required for sale transactions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
                <h3 className="text-xl font-bold mb-6">Why Sell With Us?</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <span className="material-icons text-primary text-2xl flex-shrink-0">verified_user</span>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Direct Representation</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Work directly with Yhen from start to finish</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-icons text-primary text-2xl flex-shrink-0">visibility</span>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Maximum Exposure</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Featured on our platform to qualified buyers</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-icons text-primary text-2xl flex-shrink-0">trending_up</span>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Market Knowledge</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Expert pricing guidance for PH properties</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-icons text-primary text-2xl flex-shrink-0">support_agent</span>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Full Support</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Assistance with documentation & negotiations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-2">Quick Stats</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Philippine Real Estate 2026</p>

              <div className="space-y-4">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Average Processing Time</p>
                  <p className="text-lg font-bold text-primary">4-8 weeks</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Metro Manila condo resale (foreign buyers)</p>
                </div>

                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Market Demand</p>
                  <p className="text-lg font-bold text-primary">Moderate to Improving</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Buyer-friendly with promos & discounts</p>
                </div>

                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Top Locations</p>
                  <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                    <span className="block">BGC / Fort Bonifacio</span>
                    <span className="block">Makati CBD, Ortigas Center</span>
                    <span className="block">Quezon City (C5/Katipunan)</span>
                    <span className="block">Pasig, Parañaque</span>
                    <span className="block text-zinc-500 dark:text-zinc-400 italic">Emerging: Eastwood, Rockwell</span>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">Need Help?</p>
                  <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Yhen, I'd like to sell my property.")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-green-500/20">
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="bg-primary/10 p-3 rounded-xl text-primary">
              <span className="material-icons text-xl">mail</span>
            </span>
            Tell Us About Your Property
          </h2>

          {submitMessage && submitMessage.type === 'error' && (
            <div className="mb-6 p-4 rounded-xl border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
              <div className="flex items-center gap-2">
                <span className="material-icons text-lg">error</span>
                <p className="font-medium">{submitMessage.text}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Telephone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                  placeholder="+country code"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                  placeholder="+country code"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                >
                  <option value="residential">Residential (House/Villa)</option>
                  <option value="condo">Condo/Apartment</option>
                  <option value="land">Land Plot</option>
                  <option value="commercial">Commercial</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                  placeholder="e.g., Makati, Manila, Quezon City"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Barangay / District</label>
                <input
                  type="text"
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                  placeholder="e.g., South Cembo, Ermita"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Asking Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₱</span>
                  <input
                    type="text"
                    name="askingPrice"
                    value={formData.askingPrice}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, askingPrice: num.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }));
                    }}
                    className="w-full pl-9 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Do you have a Certificate of Title?</label>
                <select
                  name="hasTitle"
                  value={formData.hasTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No, but I have other documents</option>
                  <option value="unsure">I'm not sure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">How urgent is your sale?</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                >
                  <option value="not-urgent">Not urgent</option>
                  <option value="moderate">Moderate</option>
                  <option value="urgent">Urgent (ASAP)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Property Description & Details</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all min-h-[120px] resize-none"
                placeholder="Tell us about your property - size, bedrooms, bathrooms, condition, special features, etc."
              />
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              {/* Mandatory Privacy Consent */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacyConsent"
                  name="privacyConsent"
                  checked={formData.privacyConsent}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="marketingConsent" className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed cursor-pointer">
                  Keep me updated with new property listings, market reports, and investment opportunities via email.
                </label>
              </div>
            </div>

            <div className="flex justify-center">
              <HCaptcha
                ref={captchaRef}
                sitekey={HCAPTCHA_SITE_KEY}
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
              />
            </div>

            <div className="space-y-3">
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Yhen, I'd like to sell my property.")}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-green-500/20">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>

              <button
                type="submit"
                disabled={isSubmitting || !formData.privacyConsent || !captchaToken}
                className="w-full py-4 bg-primary text-zinc-900 rounded-xl font-bold text-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                title={!formData.privacyConsent ? "Please accept the privacy policy to continue" : !captchaToken ? "Please complete the captcha verification" : ""}
              >
                <span className={`material-icons ${isSubmitting ? 'animate-spin' : ''}`}>
                  {isSubmitting ? 'sync' : 'send'}
                </span>
                {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              We typically respond within 24 hours via WhatsApp or email.
            </p>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default Sell;
