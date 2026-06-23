'use client';

import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const inputStyles = "form-input";

export default function ResetPage() {
  const params = useSearchParams();
  const token = params?.get('token') || '';
  const email = params?.get('email') || '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        toast.success('Password reset successful — please sign in');
        const target = `/auth?mode=signin&email=${encodeURIComponent(email)}`;
        router.push(target);
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto pt-6">
      <div className="p-6 w-80 mx-auto">
        <h1 className="text-xl font-semibold mb-4">Reset your password</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyles} required minLength={6} />
          <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputStyles} required minLength={6} />
          <button type="submit" disabled={loading} className="btn-tertiary-solid">{loading ? 'Resetting…' : 'Reset password'}</button>
        </form>
      </div>
    </section>
  );
}
