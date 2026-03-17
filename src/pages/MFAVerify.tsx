import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.ts';

const MFAVerify: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const logoUrl = "/Image/LimeLogo2.png";

  useEffect(() => {
    loadFactor();
  }, []);

  const loadFactor = async () => {
    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError || !data?.totp?.length) {
      navigate('/login', { replace: true });
      return;
    }
    const verifiedFactor = data.totp.find(f => f.status === 'verified');
    if (!verifiedFactor) {
      navigate('/login', { replace: true });
      return;
    }
    setFactorId(verifiedFactor.id);
    setIsFetching(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challengeData) {
      setError(challengeError?.message || 'Failed to create challenge.');
      setIsLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: code.replace(/\s/g, ''),
    });

    setIsLoading(false);

    if (verifyError) {
      setError('Invalid code. Please try again.');
      setCode('');
      return;
    }

    navigate('/admin', { replace: true });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-10">
          <div className="flex flex-col items-center mb-10">
            <img src={logoUrl} alt="Yhen's Property" className="h-14 w-auto object-contain rounded-xl mb-6" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <span className="material-icons text-emerald-600 dark:text-emerald-400 text-2xl">phonelink_lock</span>
            </div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Two-Factor Authentication</h1>
            <p className="text-sm text-zinc-500 mt-2 text-center">Enter the 6-digit code from your authenticator app to continue.</p>
          </div>

          {isFetching ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="material-icons animate-spin text-primary text-3xl">sync</span>
              <p className="text-sm text-zinc-500">Loading...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Authentication Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9 ]*"
                  maxLength={7}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="000000"
                  required
                  autoComplete="one-time-code"
                  autoFocus
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <span className="material-icons text-red-500 text-base mt-0.5">error_outline</span>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.replace(/\s/g, '').length < 6}
                className="w-full py-3.5 bg-primary text-zinc-900 font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-icons animate-spin text-lg">sync</span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-lg">lock_open</span>
                    Verify & Sign In
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-center"
              >
                Sign in with a different account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MFAVerify;
