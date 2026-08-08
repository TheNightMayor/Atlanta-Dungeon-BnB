'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const VerifyPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email has been verified.');
          window.location.href = `/auth?verified=1&email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
        } else {
          setStatus('error');
          setMessage(data.error || 'Unable to verify your email.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Unable to verify your email. Please try again later.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <section className="container mx-auto py-10 px-4">
      <div className="mx-auto max-w-xl rounded-3xl card-border bg-white dark:bg-black p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Email Verification</h1>
        <p className="mb-6 text-base text-gray-700 dark:text-gray-300">{message}</p>
        {status === 'success' ? (
          <Link href="/auth" className="btn-primary inline-block px-6 py-3">
            Return to sign in
          </Link>
        ) : (
          <div className="space-x-4">
            <Link href="/auth" className="btn-tertiary-outline inline-block px-6 py-3">
              Go to auth page
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default VerifyPage;
