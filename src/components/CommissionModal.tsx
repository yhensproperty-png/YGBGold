import React, { useState, useEffect } from 'react';
import { Commission, PropertyListing } from '../types';
import { commissionService } from '../services/commissionService';

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyListing | null;
  commission: Commission | null;
  onSave: () => void;
}

const CommissionModal: React.FC<CommissionModalProps> = ({
  isOpen,
  onClose,
  property,
  commission,
  onSave,
}) => {
  const [soldPrice, setSoldPrice] = useState<string>('0');
  const [soldPriceDisplay, setSoldPriceDisplay] = useState<string>('0');
  const [customerAgreedPercentage, setCustomerAgreedPercentage] = useState<string>('0');
  const [yhenPercentage, setYhenPercentage] = useState<string>('0');
  const [taylorPercentage, setTaylorPercentage] = useState<string>('0');
  const [daphnePercentage, setDaphnePercentage] = useState<string>('0');
  const [abbyPercentage, setAbbyPercentage] = useState<string>('0');
  const [juvyPercentage, setJuvyPercentage] = useState<string>('0');
  const [customerPaid, setCustomerPaid] = useState(false);
  const [yhenPaid, setYhenPaid] = useState(false);
  const [taylorPaid, setTaylorPaid] = useState(false);
  const [daphnePaid, setDaphnePaid] = useState(false);
  const [abbyPaid, setAbbyPaid] = useState(false);
  const [juvyPaid, setJuvyPaid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatNumberWithCommas = (value: string): string => {
    const num = value.replace(/,/g, '');
    if (!num || isNaN(Number(num))) return '';
    return Number(num).toLocaleString('en-US');
  };

  const handleSoldPriceChange = (value: string) => {
    const cleanValue = value.replace(/,/g, '');
    setSoldPrice(cleanValue);
    setSoldPriceDisplay(formatNumberWithCommas(cleanValue));
  };

  useEffect(() => {
    if (commission) {
      setSoldPrice(commission.sold_price.toString());
      setSoldPriceDisplay(formatNumberWithCommas(commission.sold_price.toString()));
      setCustomerAgreedPercentage(commission.customer_agreed_percentage.toString());
      setYhenPercentage(commission.yhen_percentage.toString());
      setTaylorPercentage(commission.taylor_percentage.toString());
      setDaphnePercentage(commission.daphne_percentage?.toString() || '0');
      setAbbyPercentage(commission.abby_percentage?.toString() || '0');
      setJuvyPercentage(commission.juvy_percentage?.toString() || '0');
      setCustomerPaid(commission.customer_paid);
      setYhenPaid(commission.yhen_paid);
      setTaylorPaid(commission.taylor_paid);
      setDaphnePaid(commission.daphne_paid || false);
      setAbbyPaid(commission.abby_paid || false);
      setJuvyPaid(commission.juvy_paid || false);
    } else {
      setSoldPrice('0');
      setSoldPriceDisplay('0');
      setCustomerAgreedPercentage('0');
      setYhenPercentage('0');
      setTaylorPercentage('0');
      setDaphnePercentage('0');
      setAbbyPercentage('0');
      setJuvyPercentage('0');
      setCustomerPaid(false);
      setYhenPaid(false);
      setTaylorPaid(false);
      setDaphnePaid(false);
      setAbbyPaid(false);
      setJuvyPaid(false);
    }
  }, [commission]);

  if (!isOpen || !property) return null;

  const soldPriceNum = parseFloat(soldPrice) || 0;
  const customerAgreedPercentageNum = parseFloat(customerAgreedPercentage) || 0;
  const yhenPercentageNum = parseFloat(yhenPercentage) || 0;
  const taylorPercentageNum = parseFloat(taylorPercentage) || 0;
  const daphnePercentageNum = parseFloat(daphnePercentage) || 0;
  const abbyPercentageNum = parseFloat(abbyPercentage) || 0;
  const juvyPercentageNum = parseFloat(juvyPercentage) || 0;

  const { yhenAmount, taylorAmount, totalPercentage } = commissionService.calculateCommissionAmounts(
    soldPriceNum,
    yhenPercentageNum,
    taylorPercentageNum
  );

  const daphneAmount = (soldPriceNum * daphnePercentageNum) / 100;
  const abbyAmount = (soldPriceNum * abbyPercentageNum) / 100;
  const juvyAmount = (soldPriceNum * juvyPercentageNum) / 100;

  const handleSave = async () => {
    if (!property) return;

    setIsSaving(true);
    try {
      if (commission) {
        await commissionService.updateCommission(commission.id, {
          sold_price: soldPriceNum,
          customer_agreed_percentage: customerAgreedPercentageNum,
          yhen_percentage: yhenPercentageNum,
          taylor_percentage: taylorPercentageNum,
          daphne_percentage: daphnePercentageNum,
          abby_percentage: abbyPercentageNum,
          juvy_percentage: juvyPercentageNum,
          customer_paid: customerPaid,
          yhen_paid: yhenPaid,
          taylor_paid: taylorPaid,
          daphne_paid: daphnePaid,
          abby_paid: abbyPaid,
          juvy_paid: juvyPaid,
        });
      } else {
        const newCommission = await commissionService.createCommission(
          property.id,
          property.listing_id,
          property.title
        );
        await commissionService.updateCommission(newCommission.id, {
          sold_price: soldPriceNum,
          customer_agreed_percentage: customerAgreedPercentageNum,
          yhen_percentage: yhenPercentageNum,
          taylor_percentage: taylorPercentageNum,
          daphne_percentage: daphnePercentageNum,
          abby_percentage: abbyPercentageNum,
          juvy_percentage: juvyPercentageNum,
          customer_paid: customerPaid,
          yhen_paid: yhenPaid,
          taylor_paid: taylorPaid,
          daphne_paid: daphnePaid,
          abby_paid: abbyPaid,
          juvy_paid: juvyPaid,
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving commission:', error);
      alert('Failed to save commission. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!commission) return;

    setIsDeleting(true);
    try {
      await commissionService.deleteCommission(commission.id);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting commission:', error);
      alert('Failed to delete commission. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800">
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold dark:text-white">Commission Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="material-icons text-zinc-600 dark:text-zinc-400">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-bold text-sm text-zinc-500 uppercase tracking-wider mb-2">Property Information</h3>
            <div className="flex items-start gap-4">
              {property.images[property.featuredImageIndex ?? 0] && (
                <img
                  src={property.images[property.featuredImageIndex ?? 0] ?? property.images[0]}
                  alt={property.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-bold dark:text-white text-lg">{property.title}</p>
                <p className="text-sm text-zinc-500">Listing ID: {property.listing_id}</p>
                <p className="text-sm text-zinc-500">Original Price: ₱{property.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Sold Price *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">₱</span>
                <input
                  type="text"
                  value={soldPriceDisplay}
                  onChange={(e) => handleSoldPriceChange(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Customer Agreed Commission %
              </label>
              <input
                type="number"
                value={customerAgreedPercentage}
                onChange={(e) => setCustomerAgreedPercentage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
              />
              <p className="mt-2 text-sm font-bold text-sky-600 dark:text-sky-400">
                ₱{((soldPriceNum * customerAgreedPercentageNum) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Yhen's Commission %
                </label>
                <input
                  type="number"
                  value={yhenPercentage}
                  onChange={(e) => setYhenPercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ₱{yhenAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Taylor's Commission %
                </label>
                <input
                  type="number"
                  value={taylorPercentage}
                  onChange={(e) => setTaylorPercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ₱{taylorAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Daphne's Commission %
                </label>
                <input
                  type="number"
                  value={daphnePercentage}
                  onChange={(e) => setDaphnePercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ₱{daphneAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Abby's Commission %
                </label>
                <input
                  type="number"
                  value={abbyPercentage}
                  onChange={(e) => setAbbyPercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ₱{abbyAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Juvy's Commission %
                </label>
                <input
                  type="number"
                  value={juvyPercentage}
                  onChange={(e) => setJuvyPercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ₱{juvyAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {totalPercentage > 100 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-2">
                <span className="material-icons text-red-600 text-base">warning</span>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Total percentage ({totalPercentage.toFixed(2)}%) exceeds 100%
                </p>
              </div>
            )}

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Total Commission</p>
              <p className="text-2xl font-bold dark:text-white">
                ₱{(yhenAmount + taylorAmount + daphneAmount + abbyAmount + juvyAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-zinc-500 mt-1">{(totalPercentage + daphnePercentageNum + abbyPercentageNum + juvyPercentageNum).toFixed(2)}% of sold price</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-zinc-500 uppercase tracking-wider">Payment Status</h3>

              <label className="flex items-center justify-between p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-zinc-500">payments</span>
                  <div>
                    <p className="font-bold dark:text-white">Customer Payment Received</p>
                    {commission?.customer_payment_date && customerPaid && (
                      <p className="text-xs text-zinc-500">
                        Paid on {new Date(commission.customer_payment_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={customerPaid}
                  onChange={(e) => setCustomerPaid(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-zinc-500">account_balance_wallet</span>
                  <div>
                    <p className="font-bold dark:text-white">Yhen Paid</p>
                    {commission?.yhen_payment_date && yhenPaid && (
                      <p className="text-xs text-zinc-500">
                        Paid on {new Date(commission.yhen_payment_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={yhenPaid}
                  onChange={(e) => setYhenPaid(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-zinc-500">account_balance_wallet</span>
                  <div>
                    <p className="font-bold dark:text-white">Taylor Paid</p>
                    {commission?.taylor_payment_date && taylorPaid && (
                      <p className="text-xs text-zinc-500">
                        Paid on {new Date(commission.taylor_payment_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={taylorPaid}
                  onChange={(e) => setTaylorPaid(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-zinc-500">account_balance_wallet</span>
                  <div>
                    <p className="font-bold dark:text-white">Daphne Paid</p>
                    {commission?.daphne_payment_date && daphnePaid && (
                      <p className="text-xs text-zinc-500">
                        Paid on {new Date(commission.daphne_payment_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={daphnePaid}
                  onChange={(e) => setDaphnePaid(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-zinc-500">account_balance_wallet</span>
                  <div>
                    <p className="font-bold dark:text-white">Abby Paid</p>
                    {commission?.abby_payment_date && abbyPaid && (
                      <p className="text-xs text-zinc-500">
                        Paid on {new Date(commission.abby_payment_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={abbyPaid}
                  onChange={(e) => setAbbyPaid(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-zinc-500">account_balance_wallet</span>
                  <div>
                    <p className="font-bold dark:text-white">Juvy Paid</p>
                    {commission?.juvy_payment_date && juvyPaid && (
                      <p className="text-xs text-zinc-500">
                        Paid on {new Date(commission.juvy_payment_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={juvyPaid}
                  onChange={(e) => setJuvyPaid(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between gap-3">
          <div>
            {commission && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                disabled={isSaving || isDeleting}
              >
                <span className="material-icons text-lg">delete</span>
                Delete Commission
              </button>
            )}
            {showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <span className="material-icons text-lg">warning</span>
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              disabled={isSaving || isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isDeleting || soldPriceNum <= 0}
              className="px-6 py-3 rounded-xl bg-primary text-zinc-900 font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSaving ? 'Saving...' : 'Save Commission'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionModal;
