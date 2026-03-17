import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface Props {
  onToast: (message: string, type: 'success' | 'error') => void;
}

const MFAManageCard: React.FC<Props> = ({ onToast }) => {
  const navigate = useNavigate();
  const { hasMFAEnrolled, aal, refreshAAL } = useAuth();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadFactor();
  }, [hasMFAEnrolled]);

  const loadFactor = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const factor = data?.totp?.find(f => f.status === 'verified');
    setFactorId(factor?.id ?? null);
  };

  const handleRemove = async () => {
    if (!factorId) return;
    setIsRemoving(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setIsRemoving(false);
    setShowConfirm(false);
    if (error) {
      onToast('Failed to remove 2FA: ' + error.message, 'error');
    } else {
      await refreshAAL();
      onToast('Two-factor authentication removed from your account.', 'success');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-lg font-black text-zinc-900 dark:text-white">Two-Factor Authentication</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Manage 2FA for your account</p>
      </div>

      <div className="px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              hasMFAEnrolled ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-zinc-100 dark:bg-zinc-800'
            }`}>
              <span className={`material-icons text-2xl ${hasMFAEnrolled ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                {hasMFAEnrolled ? 'verified_user' : 'security'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Authenticator App (TOTP)
                </p>
                {hasMFAEnrolled ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                    Not set up
                  </span>
                )}
              </div>
              {hasMFAEnrolled ? (
                <p className="text-xs text-zinc-500">
                  Your account is protected with an authenticator app.
                  {aal === 'aal2' && <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold">Verified this session.</span>}
                </p>
              ) : (
                <p className="text-xs text-zinc-500">
                  Add an extra layer of security using Google Authenticator or Authy.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:flex-shrink-0">
            {hasMFAEnrolled ? (
              !showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <span className="material-icons text-base">remove_moderator</span>
                  Remove 2FA
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-bold">Are you sure?</span>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {isRemoving ? <span className="material-icons animate-spin text-sm">sync</span> : <span className="material-icons text-sm">delete</span>}
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={() => navigate('/mfa-enroll')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                <span className="material-icons text-base">add_moderator</span>
                Set Up 2FA
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFAManageCard;
