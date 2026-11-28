import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck, X } from 'lucide-react';
import type { UserAccount } from '../types';
import { apiRequest } from '../utils/api';
import { getDefaultDesignationPassword } from '../utils/defaultPasswordPolicy';
import { AnimatedModalShell, AnimatedSuccessCheck } from './motion/RaiMotionSystem';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  token: string;
  isFirstLoginPrompt?: boolean;
  onPasswordChanged: (updatedUser: UserAccount) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  token,
  isFirstLoginPrompt = false,
  onPasswordChanged,
}) => {
  const defaultHint = getDefaultDesignationPassword(user);
  const [currentPassword, setCurrentPassword] = useState(isFirstLoginPrompt ? defaultHint : '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const strengthLabel =
    newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)
      ? { text: 'Strong', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      : newPassword.length >= 6
        ? { text: 'Good', color: 'text-amber-800 bg-amber-50 border-amber-200' }
        : { text: 'Min 6 chars', color: 'text-slate-500 bg-slate-100 border-slate-200' };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      const res = await apiRequest<{ ok: boolean; user: UserAccount }>(
        '/api/auth/change-password',
        {
          method: 'POST',
          body: JSON.stringify({
            currentPassword: currentPassword.trim(),
            newPassword,
          }),
        },
        token || undefined,
      );
      setSaved(true);
      onPasswordChanged(res.user);
      window.setTimeout(() => {
        setSaved(false);
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatedModalShell
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="change-password-heading"
      panelClassName="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-[#254264] bg-[#142B46] px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-[#D6B66D]/50 text-[#D6B66D]">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6B66D]">
              {isFirstLoginPrompt ? 'First-Login Security Step' : 'Account Security'}
            </p>
            <h2 id="change-password-heading" className="text-sm font-extrabold text-white">
              {isFirstLoginPrompt ? 'Change Your Default Password' : 'Update Account Password'}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close change password dialog"
          className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {saved ? (
          <div
            data-testid="password-changed-success"
            className="py-8 text-center space-y-3"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <AnimatedSuccessCheck className="h-6 w-6 text-emerald-700" />
            </div>
            <p className="font-display text-base font-extrabold text-[#142B46]">
              Password Updated Successfully!
            </p>
            <p className="text-xs text-slate-600">
              Your new encrypted password is active for future logins.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                Signed in as {user.name} ({user.designation})
              </p>
              {isFirstLoginPrompt && (
                <p className="text-[11px] text-amber-900">
                  You signed in using the default designation password (
                  <code className="font-mono font-bold">{defaultHint}</code>). Set your own personal
                  password now, or skip and change it later from the top bar.
                </p>
              )}
            </div>

            {error && (
              <div
                key={error}
                role="alert"
                className="rai-shake rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-800"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <label className="block space-y-1">
                <span className="font-bold text-slate-700">
                  {isFirstLoginPrompt ? 'Current Default Password' : 'Current Password'}
                </span>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isFirstLoginPrompt ? defaultHint : 'Enter current password'}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#142B46] focus:outline-none"
                />
              </label>

              <label className="block space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">New Personal Password</span>
                  <span className={`rounded-full border px-2 py-0.2 text-[10px] font-bold ${strengthLabel.color}`}>
                    {strengthLabel.text}
                  </span>
                </div>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Choose a new password (min 6 characters)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#142B46] focus:outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-bold text-slate-700">Confirm New Password</span>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#142B46] focus:outline-none"
                />
              </label>

              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowPasswords((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                >
                  {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPasswords ? 'Hide passwords' : 'Show passwords'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isFirstLoginPrompt ? 'Skip for Now' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </AnimatedModalShell>
  );
};
