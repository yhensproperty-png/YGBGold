import React, { useState, useMemo } from 'react';
import { Commission, PropertyListing } from '../types';

const ITEMS_PER_PAGE = 10;

interface CommissionListProps {
  commissions: Commission[];
  properties: PropertyListing[];
  onManageCommission: (commission: Commission) => void;
}

const CommissionList: React.FC<CommissionListProps> = ({ commissions, properties, onManageCommission }) => {
  const getPropertyAgent = (propertyId: string): string => {
    const property = properties.find(p => p.id === propertyId);
    return property?.agent || '-';
  };
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(commissions.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return commissions.slice(start, start + ITEMS_PER_PAGE);
  }, [commissions, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPaymentStatusBadge = (paid: boolean) => {
    if (paid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
          <span className="material-icons text-[12px]">check_circle</span>
          Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
        <span className="material-icons text-[12px]">cancel</span>
        Unpaid
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
      {commissions.length === 0 ? (
        <div className="px-8 py-16 text-center text-zinc-500">
          <span className="material-icons text-4xl block mb-2 text-zinc-300">receipt_long</span>
          No commission records yet. Commission records are created when properties are marked as sold.
        </div>
      ) : (
        <>
          <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {currentItems.map((commission) => (
              <div key={commission.id} className="p-4 space-y-3">
                <div>
                  <p className="font-bold dark:text-white text-sm line-clamp-2 mb-1">
                    {commission.property_title}
                  </p>
                  <p className="text-xs text-zinc-500">Listing ID: {commission.listing_id}</p>
                  <p className="font-bold dark:text-white text-sm mt-2">
                    Sold: ₱{commission.sold_price.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Agent: <span className="text-zinc-700 dark:text-zinc-300 font-bold">{getPropertyAgent(commission.property_id)}</span></p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">Customer</p>
                    {getPaymentStatusBadge(commission.customer_paid)}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">Yhen</p>
                    {getPaymentStatusBadge(commission.yhen_paid)}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">Taylor</p>
                    {getPaymentStatusBadge(commission.taylor_paid)}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">Daphne</p>
                    {getPaymentStatusBadge(commission.daphne_paid || false)}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">Abby</p>
                    {getPaymentStatusBadge(commission.abby_paid || false)}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">Juvy</p>
                    {getPaymentStatusBadge(commission.juvy_paid || false)}
                  </div>
                </div>

                <button
                  onClick={() => onManageCommission(commission)}
                  className="w-full px-4 py-2 bg-primary text-zinc-900 font-bold rounded-xl hover:scale-105 transition-transform text-sm"
                >
                  Manage Commission
                </button>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Property
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Agent
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Sold Price
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Customer Paid
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Yhen Paid
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Taylor Paid
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Daphne Paid
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Abby Paid
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Juvy Paid
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {currentItems.map((commission) => (
                  <tr
                    key={commission.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <div>
                        <p className="font-bold dark:text-white line-clamp-1 text-sm">
                          {commission.property_title}
                        </p>
                        <p className="text-xs text-zinc-500">Listing ID: {commission.listing_id}</p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{getPropertyAgent(commission.property_id)}</p>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <p className="font-bold dark:text-white text-sm">
                        ₱{commission.sold_price.toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Commission: ₱{(commission.yhen_amount + commission.taylor_amount + (commission.daphne_amount || 0) + (commission.abby_amount || 0) + (commission.juvy_amount || 0)).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <div className="space-y-1">
                        {getPaymentStatusBadge(commission.customer_paid)}
                        <p className="text-xs text-zinc-500">
                          ₱{(commission.yhen_amount + commission.taylor_amount + (commission.daphne_amount || 0) + (commission.abby_amount || 0) + (commission.juvy_amount || 0)).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <div className="space-y-1">
                        {getPaymentStatusBadge(commission.yhen_paid)}
                        <p className="text-xs text-zinc-500">
                          ₱{commission.yhen_amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <div className="space-y-1">
                        {getPaymentStatusBadge(commission.taylor_paid)}
                        <p className="text-xs text-zinc-500">
                          ₱{commission.taylor_amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <div className="space-y-1">
                        {getPaymentStatusBadge(commission.daphne_paid || false)}
                        <p className="text-xs text-zinc-500">
                          ₱{(commission.daphne_amount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <div className="space-y-1">
                        {getPaymentStatusBadge(commission.abby_paid || false)}
                        <p className="text-xs text-zinc-500">
                          ₱{(commission.abby_amount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <div className="space-y-1">
                        {getPaymentStatusBadge(commission.juvy_paid || false)}
                        <p className="text-xs text-zinc-500">
                          ₱{(commission.juvy_amount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-5 text-right">
                      <button
                        onClick={() => onManageCommission(commission)}
                        className="px-4 py-2 bg-primary text-zinc-900 font-bold rounded-xl hover:scale-105 transition-transform text-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {commissions.length > ITEMS_PER_PAGE && (
            <div className="px-8 py-6 bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-zinc-500">
                Showing <span className="font-bold text-zinc-900 dark:text-zinc-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-bold text-zinc-900 dark:text-zinc-300">{Math.min(currentPage * ITEMS_PER_PAGE, commissions.length)}</span> of{' '}
                <span className="font-bold text-zinc-900 dark:text-zinc-300">{commissions.length}</span> results
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
        </>
      )}
    </div>
  );
};

export default CommissionList;
