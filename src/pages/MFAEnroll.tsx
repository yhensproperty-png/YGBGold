import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.ts';

const MFAEnroll: React.FC = () => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const logoUrl = "/Image/LimeLogo2.png";

  useEffect(() => {
    startEnrollment();
  }, []);

  const startEnrollment = async () => {
    setIsFetching(true);

    const { data: listData } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = listData?.totp?.some(f => f.status === 'verified');

    if (hasVerifiedFactor) {
      navigate('/mfa-verify', { replace: true });
      return;
    }

    const { data: unenrolledFactors } = await supabase.auth.mfa.listFactors();
    const unverifiedFactor = unenrolledFactors?.totp?.find(f => f.status === 'unverified');
    if (unverifiedFactor) {
      await supabase.auth.mfa.unenroll({ factorId: unverifiedFactor.id });
    }

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: "Yhen's Property",
      friendlyName: 'Authenticator App',
    });

    if (enrollError || !data) {
      setError(enrollError?.message || 'Failed to start enrollment.');
      setIsFetching(false);
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
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
      setError('Invalid code. Please check your authenticator app and try again.');
      return;
    }

    navigate('/admin', { replace: true });
  };

  const handleSkip = () => {
    navigate('/manage', { replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-10">
          <div className="flex flex-col items-center mb-8">
            <img src={logoUrl} alt="Yhen's Property" className="h-14 w-auto object-contain rounded-xl mb-6" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <span className="material-icons text-emerald-600 dark:text-emerald-400 text-2xl">security</span>
            </div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight text-center">Set Up Two-Factor Authentication</h1>
            <p className="text-sm text-zinc-500 mt-2 text-center">Scan the QR code with Google Authenticator or Authy to secure your account.</p>
          </div>

          {isFetching ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="material-icons animate-spin text-primary text-3xl">sync</span>
              <p className="text-sm text-zinc-500">Generating your QR code...</p>
            </div>
          ) : error && !qrCode ? (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4">
              <span className="material-icons text-red-500 text-base mt-0.5">error_outline</span>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <>
              <div className="steps space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-black text-zinc-900">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Download an authenticator app</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Google Authenticator, Authy, or any TOTP app works.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-black text-zinc-900">2</span>
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3">Scan this QR code</p>
                    {qrCode && (
                      <div className="bg-white rounded-2xl p-3 inline-block border border-zinc-200 shadow-sm">
                        <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                      </div>
                    )}
                    {secret && (
                      <div className="mt-3">
                        <p className="text-xs text-zinc-500 mb-1">Or enter this code manually:</p>
                        <code className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-lg block font-mono break-all border border-zinc-200 dark:border-zinc-700">{secret}</code>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-black text-zinc-900">3</span>
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3">Enter the 6-digit code to confirm</p>
                    <form onSubmit={handleVerify} className="space-y-4">
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
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />

                      {error && (
                        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                          <span className="material-icons text-red-500 text-base mt-0.5">error_outline</span>
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading || code.replace(/\s/g, '').length < 6}
                        className="w-full py-3.5 bg-primary text-zinc-900 font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <span className="material-icons animate-spin text-lg">sync</span>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <span className="material-icons text-lg">verified_user</span>
                            Enable 2FA
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-center"
              >
                Set up later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MFAEnroll;
