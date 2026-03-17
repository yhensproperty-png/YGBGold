
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PropertyListing, Commission } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { commissionService } from '../services/commissionService.ts';
import CommissionList from '../components/CommissionList.tsx';
import CommissionModal from '../components/CommissionModal.tsx';

const ITEMS_PER_PAGE = 10;

interface ManageListingsProps {
  properties: PropertyListing[];
  onUpdate: (property: PropertyListing) => void;
  onDelete: (id: string) => void;
}

type View = 'active' | 'sold' | 'rented' | 'commission' | 'archived';

function PropertyTable({
  items,
  onView,
  onEdit,
  onDelete,
  actions,
  canDelete,
}: {
  items: PropertyListing[];
  onView: (property: PropertyListing) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  actions: (property: PropertyListing) => React.ReactNode;
  canDelete: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
      {/* Mobile Card View */}
      <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {currentItems.length === 0 ? (
          <div className="px-6 py-16 text-center text-zinc-500">
            <span className="material-icons text-4xl block mb-2 text-zinc-300">inventory_2</span>
            No listings here.
          </div>
        ) : (
          currentItems.map((property) => (
            <div key={property.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                  <img src={property.images[property.featuredImageIndex ?? 0] ?? property.images[0]} alt={`${property.title} preview`} className="w-full h-full object-cover" loading="lazy" width="800" height="600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold dark:text-white text-sm line-clamp-2 mb-1">{property.title}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1 mb-2">
                    <span className="material-icons text-[12px]">place</span>
                    {property.city}, {property.state}
                  </p>
                  <p className="font-bold dark:text-white text-sm">₱{property.price.toLocaleString()}</p>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Property Type</p>
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{property.type}</p>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Listing</p>
                    <p className={`text-xs font-bold ${property.listingType === 'rent' ? 'text-sky-500' : 'text-emerald-600'}`}>
                      {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  property.status === 'active'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : property.status === 'sold'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : property.status === 'archived'
                    ? 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                    : property.status === 'rented'
                    ? 'bg-sky-50 text-sky-600 border border-sky-200'
                    : 'bg-yellow-100 text-yellow-600 border border-yellow-200'
                }`}>
                  {property.status}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(property)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 active:bg-zinc-100"
                    title="View Listing"
                  >
                    <span className="material-icons text-base">visibility</span>
                  </button>
                  <button
                    onClick={() => onEdit(property.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 active:bg-zinc-100"
                    title="Edit"
                  >
                    <span className="material-icons text-base">edit</span>
                  </button>
                  {actions(property)}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(property.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                      title="Delete"
                    >
                      <span className="material-icons text-base">delete_outline</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <th className="pl-6 pr-3 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Property</th>
              <th className="px-2 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Price</th>
              <th className="px-2 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Type</th>
              <th className="px-2 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Listing</th>
              <th className="px-2 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Agent</th>
              <th className="px-2 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
              <th className="pl-2 pr-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-16 text-center text-zinc-500">
                  <span className="material-icons text-4xl block mb-2 text-zinc-300">inventory_2</span>
                  No listings here.
                </td>
              </tr>
            ) : (
              currentItems.map((property) => (
                <tr key={property.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="pl-6 pr-3 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                        <img src={property.images[property.featuredImageIndex ?? 0] ?? property.images[0]} alt={`${property.title} preview`} className="w-full h-full object-cover" loading="lazy" width="800" height="600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold dark:text-white line-clamp-1 text-sm">{property.title}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <span className="material-icons text-[12px]">place</span>
                          <span className="truncate">{property.city}, {property.state}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-5">
                    <p className="font-bold dark:text-white text-sm whitespace-nowrap">₱{property.price.toLocaleString()}</p>
                  </td>
                  <td className="px-2 py-5">
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{property.type}</p>
                  </td>
                  <td className="px-2 py-5">
                    <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold border ${
                      property.listingType === 'rent'
                        ? 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                    }`}>
                      {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                  </td>
                  <td className="px-2 py-5">
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate">{property.agent || '-'}</p>
                  </td>
                  <td className="px-2 py-5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      property.status === 'active'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : property.status === 'sold'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : property.status === 'archived'
                        ? 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                        : property.status === 'rented'
                        ? 'bg-sky-50 text-sky-600 border border-sky-200'
                        : 'bg-yellow-100 text-yellow-600 border border-yellow-200'
                    }`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="pl-2 pr-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView(property)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-primary hover:border-primary transition-all flex-shrink-0"
                        title="View Listing"
                      >
                        <span className="material-icons text-sm">visibility</span>
                      </button>
                      <button
                        onClick={() => onEdit(property.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-primary hover:border-primary transition-all flex-shrink-0"
                        title="Edit Listing"
                      >
                        <span className="material-icons text-sm">edit</span>
                      </button>
                      {actions(property)}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(property.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:border-red-500 transition-all flex-shrink-0"
                          title="Delete Listing"
                        >
                          <span className="material-icons text-sm">delete_outline</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {items.length > ITEMS_PER_PAGE && (
        <div className="px-8 py-6 bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            Showing <span className="font-bold text-zinc-900 dark:text-zinc-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
            <span className="font-bold text-zinc-900 dark:text-zinc-300">{Math.min(currentPage * ITEMS_PER_PAGE, items.length)}</span> of{' '}
            <span className="font-bold text-zinc-900 dark:text-zinc-300">{items.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-primary hover:text-primary disabled:opacity-30 transition-all"
            >
              <span className="material-icons text-sm">chevron_left</span>
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm font-bold transition-all ${
                      currentPage === page
                        ? 'bg-primary text-zinc-900 shadow-sm'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-primary hover:text-primary disabled:opacity-30 transition-all"
            >
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const ManageListings: React.FC<ManageListingsProps> = ({ properties, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<View>('active');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isLoadingCommissions, setIsLoadingCommissions] = useState(false);

  const activeListings = useMemo(() => properties.filter(p => p.status === 'active' || p.status === 'draft'), [properties]);
  const soldListings = useMemo(() => properties.filter(p => p.status === 'sold'), [properties]);
  const archivedListings = useMemo(() => properties.filter(p => p.status === 'archived'), [properties]);
  const rentedListings = useMemo(() => properties.filter(p => p.status === 'rented'), [properties]);

  const loadCommissions = async () => {
    if (!isAdmin) return;
    setIsLoadingCommissions(true);
    try {
      const data = await commissionService.getAllCommissions();
      setCommissions(data);
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setIsLoadingCommissions(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadCommissions();
    }
  }, [isAdmin]);

  const handleArchive = (property: PropertyListing) => {
    onUpdate({ ...property, status: 'archived' });
  };

  const handleUnarchive = (property: PropertyListing) => {
    onUpdate({ ...property, status: 'active' });
  };

  const handleMarkSold = async (property: PropertyListing) => {
    onUpdate({ ...property, status: 'sold' });

    if (isAdmin) {
      try {
        const existingCommission = await commissionService.getCommissionByPropertyId(property.id);
        if (!existingCommission) {
          await commissionService.createCommission(property.id, property.listing_id, property.title);
          await loadCommissions();
        }
      } catch (error) {
        console.error('Error creating commission record:', error);
      }
    }
  };

  const handleUnmarkSold = (property: PropertyListing) => {
    onUpdate({ ...property, status: 'active' });
  };

  const handleMarkRented = (property: PropertyListing) => {
    onUpdate({ ...property, status: 'rented' });
  };

  const handleUnmarkRented = (property: PropertyListing) => {
    onUpdate({ ...property, status: 'active' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      onDelete(id);
    }
  };

  const activeActions = (property: PropertyListing) => (
    <>
      <button
        onClick={() => handleMarkSold(property)}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 hover:border-emerald-400 transition-all flex-shrink-0"
        title="Mark as Sold"
      >
        <span className="material-icons text-sm">sell</span>
      </button>
      <button
        onClick={() => handleMarkRented(property)}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-sky-600 hover:border-sky-400 transition-all flex-shrink-0"
        title="Mark as Rented"
      >
        <span className="material-icons text-sm">key</span>
      </button>
      <button
        onClick={() => handleArchive(property)}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-primary hover:border-primary transition-all flex-shrink-0"
        title="Archive"
      >
        <span className="material-icons text-sm">archive</span>
      </button>
    </>
  );

  const soldActions = (property: PropertyListing) => (
    <>
      {isAdmin && (
        <button
          onClick={async () => {
            const commission = await commissionService.getCommissionByPropertyId(property.id);
            setSelectedProperty(property);
            setSelectedCommission(commission);
            setIsCommissionModalOpen(true);
          }}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 transition-all flex-shrink-0"
          title="Manage Commission"
        >
          <span className="material-icons text-sm">payments</span>
        </button>
      )}
      <button
        onClick={() => handleUnmarkSold(property)}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all flex-shrink-0"
        title="Restore to Active"
      >
        <span className="material-icons text-sm">undo</span>
      </button>
    </>
  );

  const rentedActions = (property: PropertyListing) => (
    <button
      onClick={() => handleUnmarkRented(property)}
      className="w-9 h-9 flex items-center justify-center rounded-xl border border-sky-200 text-sky-600 hover:bg-sky-50 transition-all flex-shrink-0"
      title="Restore to Active"
    >
      <span className="material-icons text-sm">undo</span>
    </button>
  );

  const archivedActions = (property: PropertyListing) => (
    <button
      onClick={() => handleUnarchive(property)}
      className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-primary hover:border-primary transition-all flex-shrink-0"
      title="Restore to Active"
    >
      <span className="material-icons text-sm">unarchive</span>
    </button>
  );

  const handleManageCommission = async (commission: Commission) => {
    const property = properties.find(p => p.id === commission.property_id);
    if (property) {
      setSelectedProperty(property);
      setSelectedCommission(commission);
      setIsCommissionModalOpen(true);
    }
  };

  const handleCommissionSaved = () => {
    loadCommissions();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold dark:text-white">Manage Listings</h1>
          <p className="text-zinc-500 mt-1">Review and manage your property portfolio</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/add"
            className="px-6 py-3 bg-primary text-zinc-900 font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            Add New Listing
          </Link>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 flex-wrap border-b border-zinc-200 dark:border-zinc-800 pb-0 -mb-6">
        {([
          { view: 'active' as View, label: 'Active', icon: 'home', count: activeListings.length, activeColor: 'border-primary text-primary', dotColor: 'bg-primary', adminOnly: false },
          { view: 'rented' as View, label: 'Rented', icon: 'key', count: rentedListings.length, activeColor: 'border-sky-500 text-sky-600', dotColor: 'bg-sky-500', adminOnly: false },
          { view: 'sold' as View, label: 'Sold', icon: 'sell', count: soldListings.length, activeColor: 'border-emerald-500 text-emerald-600', dotColor: 'bg-emerald-500', adminOnly: false },
          { view: 'commission' as View, label: 'Commission', icon: 'payments', count: commissions.length, activeColor: 'border-purple-500 text-purple-600', dotColor: 'bg-purple-500', adminOnly: true },
          { view: 'archived' as View, label: 'Archived', icon: 'inventory_2', count: archivedListings.length, activeColor: 'border-zinc-500 text-zinc-600', dotColor: 'bg-zinc-400', adminOnly: false },
        ]).filter(tab => !tab.adminOnly || isAdmin).map(tab => (
          <button
            key={tab.view}
            onClick={() => setActiveView(tab.view)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all -mb-px ${
              activeView === tab.view
                ? tab.activeColor
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <span className="material-icons text-base">{tab.icon}</span>
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              activeView === tab.view ? 'bg-current/10' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Listings */}
      {activeView === 'active' && (
        <section>
          <PropertyTable
            items={activeListings}
            onView={(property) => navigate(`/property/${property.slug}`)}
            onEdit={(id) => navigate(`/edit/${id}`)}
            onDelete={handleDelete}
            actions={activeActions}
            canDelete={isAdmin}
          />
        </section>
      )}

      {/* Rented Listings */}
      {activeView === 'rented' && (
        <section>
          {rentedListings.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-8 py-16 text-center text-zinc-400 shadow-xl">
              <span className="material-icons text-4xl block mb-2 text-zinc-300">key</span>
              No rented listings yet.
            </div>
          ) : (
            <PropertyTable
              items={rentedListings}
              onView={(property) => navigate(`/property/${property.slug}`)}
              onEdit={(id) => navigate(`/edit/${id}`)}
              onDelete={handleDelete}
              actions={rentedActions}
              canDelete={isAdmin}
            />
          )}
        </section>
      )}

      {/* Sold Listings */}
      {activeView === 'sold' && (
        <section>
          {soldListings.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-8 py-16 text-center text-zinc-400 shadow-xl">
              <span className="material-icons text-4xl block mb-2 text-zinc-300">sell</span>
              No sold listings yet.
            </div>
          ) : (
            <PropertyTable
              items={soldListings}
              onView={(property) => navigate(`/property/${property.slug}`)}
              onEdit={(id) => navigate(`/edit/${id}`)}
              onDelete={handleDelete}
              actions={soldActions}
              canDelete={isAdmin}
            />
          )}
        </section>
      )}

      {/* Commission Records */}
      {activeView === 'commission' && isAdmin && (
        <section>
          {isLoadingCommissions ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-8 py-16 text-center text-zinc-400 shadow-xl">
              <span className="material-icons text-4xl block mb-2 text-zinc-300 animate-spin">sync</span>
              Loading commissions...
            </div>
          ) : (
            <CommissionList
              commissions={commissions}
              properties={properties}
              onManageCommission={handleManageCommission}
            />
          )}
        </section>
      )}

      {/* Archived Listings */}
      {activeView === 'archived' && (
        <section>
          {archivedListings.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-8 py-16 text-center text-zinc-400 shadow-xl">
              <span className="material-icons text-4xl block mb-2 text-zinc-300">inventory_2</span>
              No archived listings.
            </div>
          ) : (
            <PropertyTable
              items={archivedListings}
              onView={(property) => navigate(`/property/${property.slug}`)}
              onEdit={(id) => navigate(`/edit/${id}`)}
              onDelete={handleDelete}
              actions={archivedActions}
              canDelete={isAdmin}
            />
          )}
        </section>
      )}

      {/* Commission Modal */}
      <CommissionModal
        isOpen={isCommissionModalOpen}
        onClose={() => {
          setIsCommissionModalOpen(false);
          setSelectedCommission(null);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
        commission={selectedCommission}
        onSave={handleCommissionSaved}
      />
    </div>
  );
};

export default ManageListings;
