import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface PropertyInquiry {
  id: string;
  property_id: string;
  property_title: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface SellerInquiryEmail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  property_type: string;
  city: string;
  barangay: string | null;
  asking_price: string | null;
  description: string | null;
  has_title: string;
  urgency: string;
  status: string;
  created_at: string;
}

type InquiryType = 'contact' | 'property' | 'seller';

const InquiryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InquiryType>('contact');
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [propertyInquiries, setPropertyInquiries] = useState<PropertyInquiry[]>([]);
  const [sellerInquiryEmails, setSellerInquiryEmails] = useState<SellerInquiryEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | PropertyInquiry | SellerInquiryEmail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newStatus, setNewStatus] = useState('new');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const [contactRes, propertyRes, sellerRes] = await Promise.all([
        supabase
          .from('contact_inquiries')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('property_inquiries')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('seller_inquiry_emails')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (!contactRes.error && contactRes.data) {
        setContactInquiries(contactRes.data as ContactInquiry[]);
      }
      if (!propertyRes.error && propertyRes.data) {
        setPropertyInquiries(propertyRes.data as PropertyInquiry[]);
      }
      if (!sellerRes.error && sellerRes.data) {
        setSellerInquiryEmails(sellerRes.data as SellerInquiryEmail[]);
      }
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (inquiryId: string) => {
    let table = 'contact_inquiries';
    if (activeTab === 'property') {
      table = 'property_inquiries';
    } else if (activeTab === 'seller') {
      table = 'seller_inquiry_emails';
    }

    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', inquiryId);

    if (!error) {
      await loadInquiries();
      setShowDetail(false);
      setSelectedInquiry(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'responded':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const inquiries = activeTab === 'contact' ? contactInquiries : activeTab === 'property' ? propertyInquiries : sellerInquiryEmails;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-primary font-black tracking-[0.4em] text-[10px] uppercase block mb-2">INQUIRY MANAGEMENT</span>
          <h2 className="text-2xl sm:text-3xl font-black dark:text-white tracking-tighter">
            Customer Inquiries
          </h2>
          <p className="text-zinc-500 text-sm mt-2 font-medium">
            Track and manage all customer contact and property inquiries
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 px-6 py-4 font-bold text-center transition-all ${
              activeTab === 'contact'
                ? 'bg-primary text-zinc-900'
                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <span className="material-icons text-xl align-middle mr-2 inline-block">email</span>
            Contact ({contactInquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('property')}
            className={`flex-1 px-6 py-4 font-bold text-center transition-all ${
              activeTab === 'property'
                ? 'bg-primary text-zinc-900'
                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <span className="material-icons text-xl align-middle mr-2 inline-block">location_city</span>
            Property ({propertyInquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`flex-1 px-6 py-4 font-bold text-center transition-all ${
              activeTab === 'seller'
                ? 'bg-primary text-zinc-900'
                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <span className="material-icons text-xl align-middle mr-2 inline-block">sell</span>
            Seller ({sellerInquiryEmails.length})
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-zinc-500">
                <span className="material-icons animate-spin">refresh</span>
                Loading inquiries...
              </div>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-5xl text-zinc-300 block mb-4">inbox</span>
              <p className="text-zinc-500 font-medium">No inquiries yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => {
                    setSelectedInquiry(inquiry);
                    setNewStatus(inquiry.status);
                    setShowDetail(true);
                  }}
                  className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-zinc-900 dark:text-white">{inquiry.name}</h4>
                      <p className="text-sm text-zinc-500">{inquiry.email}</p>
                      {activeTab === 'property' && 'property_title' in inquiry && (
                        <p className="text-xs text-primary font-medium mt-1">Property: {inquiry.property_title}</p>
                      )}
                      {activeTab === 'seller' && 'property_type' in inquiry && (
                        <p className="text-xs text-primary font-medium mt-1">{inquiry.property_type} in {inquiry.city}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(inquiry.status)}`}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                    {'message' in inquiry ? inquiry.message : `${inquiry.property_type} - ₱${inquiry.asking_price || 'TBD'}`}
                  </p>
                  <p className="text-xs text-zinc-400">{formatDate(inquiry.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDetail && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg dark:text-white">Inquiry Details</h3>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedInquiry(null);
                }}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Name</label>
                <p className="text-zinc-900 dark:text-white font-medium">{selectedInquiry.name}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Email</label>
                <a href={`mailto:${selectedInquiry.email}`} className="text-primary font-medium hover:underline">
                  {selectedInquiry.email}
                </a>
              </div>

              {selectedInquiry.phone && (
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Phone</label>
                  <a href={`tel:${selectedInquiry.phone}`} className="text-primary font-medium hover:underline">
                    {selectedInquiry.phone}
                  </a>
                </div>
              )}

              {activeTab === 'property' && 'property_title' in selectedInquiry && (
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Property</label>
                  <p className="text-zinc-900 dark:text-white font-medium">{selectedInquiry.property_title}</p>
                </div>
              )}

              {activeTab === 'seller' && 'property_type' in selectedInquiry && (
                <>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Property Type</label>
                    <p className="text-zinc-900 dark:text-white font-medium">{selectedInquiry.property_type}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">City</label>
                      <p className="text-zinc-900 dark:text-white font-medium">{selectedInquiry.city}</p>
                    </div>
                    {selectedInquiry.barangay && (
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Barangay</label>
                        <p className="text-zinc-900 dark:text-white font-medium">{selectedInquiry.barangay}</p>
                      </div>
                    )}
                  </div>

                  {selectedInquiry.asking_price && (
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Asking Price</label>
                      <p className="text-zinc-900 dark:text-white font-medium">₱{selectedInquiry.asking_price}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Has Title</label>
                      <p className="text-zinc-900 dark:text-white font-medium">{selectedInquiry.has_title}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Urgency</label>
                      <p className="text-zinc-900 dark:text-white font-medium capitalize">{selectedInquiry.urgency}</p>
                    </div>
                  </div>

                  {selectedInquiry.description && (
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Description</label>
                      <p className="text-zinc-900 dark:text-white whitespace-pre-wrap text-sm">{selectedInquiry.description}</p>
                    </div>
                  )}

                  {selectedInquiry.whatsapp && (
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">WhatsApp</label>
                      <a href={`https://wa.me/${selectedInquiry.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                        {selectedInquiry.whatsapp}
                      </a>
                    </div>
                  )}
                </>
              )}

              {'message' in selectedInquiry && (
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Message</label>
                  <p className="text-zinc-900 dark:text-white whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Submitted</label>
                <p className="text-zinc-600 dark:text-zinc-400">{formatDate(selectedInquiry.created_at)}</p>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-3">Update Status</label>
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                  >
                    <option value="new">New</option>
                    <option value="responded">Responded</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    onClick={() => handleStatusUpdate(selectedInquiry.id)}
                    className="px-6 py-2 bg-primary text-zinc-900 font-bold rounded-xl hover:brightness-110 transition-all"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryManagement;
