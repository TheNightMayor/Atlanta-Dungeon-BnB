'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { signIn, useSession } from 'next-auth/react'
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const defaultFormData = {
    email: '',
    name: '',
    password: '',
};

const Auth = () => {
    const [formData, setFormData] = useState(defaultFormData);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const forgotRef = useRef<HTMLDivElement | null>(null);

    const inputStyles = "form-input"

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const mode = searchParams?.get('mode');
        const emailParam = searchParams?.get('email');
        if (mode === 'signin') setIsSigningIn(true);
        if (emailParam) setFormData(f => ({ ...f, email: decodeURIComponent(emailParam) }));
    }, [searchParams]);

    useEffect(() => {
        if (!showForgot) return;
        const onDocClick = (e: MouseEvent) => {
            if (forgotRef.current && !forgotRef.current.contains(e.target as Node)) {
                setShowForgot(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showForgot]);

    useEffect(() => {
        if (session) router.push('/auth/redirect')
    }, [router, session]);


    const loginHandler = async (provider?: 'google' | 'github' | 'credentials') => {
        try {
            if (provider && provider !== 'credentials') {
                await signIn(provider, { callbackUrl: '/auth/redirect' });
                return;
            }

            const res = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            } as any);

            if (res && typeof res === 'object' && 'error' in res && (res as any).error) {
                toast.error((res as any).error || 'Invalid credentials');
                return;
            }

            router.push('/auth/redirect');
        } catch (err) {
            toast.error('something went wrong');
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const response = await fetch('/api/sanity/signUp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                toast.success(data.message || 'Account created. Check your email to confirm your account.');
                setIsSigningIn(true);
            } else {
                toast.error(data.error || 'Something went wrong');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setFormData(defaultFormData);
        }
    };

    const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSigningIn) {
            await loginHandler('credentials');
            return;
        }
        await handleSubmit(event);
    };

    const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const resp = await fetch('/api/auth/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await resp.json().catch(() => ({}));
            if (resp.ok) {
                toast.success('If an account exists, you will receive reset instructions');
                // keep modal open and set cooldown from server (if provided)
                setResendCooldown(Number(data?.cooldown) || 180);
            } else {
                toast.error(data.error || 'Something went wrong');
            }
        } catch (err) {
            toast.error('Something went wrong');
        }
    };

    const handleResend = async () => {
        try {
            const resp = await fetch('/api/auth/forgot/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await resp.json().catch(() => ({}));
            if (resp.ok) {
                toast.success('If an account exists, reset instructions have been resent');
                setResendCooldown(Number(data?.cooldown) || 180);
            } else {
                toast.error(data.error || 'Something went wrong');
            }
        } catch (err) {
            toast.error('Something went wrong');
        }
    };

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setInterval(() => setResendCooldown(s => {
            if (s <= 1) {
                clearInterval(t);
                return 0;
            }
            return s - 1;
        }), 1000);
        return () => clearInterval(t);
    }, [resendCooldown]);

    return (
            <section className="container mx-auto pt-2 md:pt-2">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8 w-80 md:w-[70%] mx-auto">
                <div className="flex mb-8 flex-col md:flex-row items-center justify-between">
                    <h1 className="text-ex font-bold leading-tight tracking-tight md:text-2xl">
                        {isSigningIn ? 'Sign in' : 'Create an Account'}
                    </h1>
                    <p>OR</p>
                    <button type="button" className="btn-tertiary-outline ml-3 inline-flex items-center"
                        onClick={() => loginHandler('google')}
                    >
                        Sign in with Google:
                        <FcGoogle className="ml-2 text-2xl" />
                    </button>
                </div>

                <form className="space-y-4 md:space-y-6" onSubmit={handleFormSubmit}>
                    {!isSigningIn && (
                        <input 
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            required
                            className={inputStyles}
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        placeholder="name@company.com"
                        required
                        className={inputStyles}
                        onChange={handleInputChange}
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            placeholder="password"
                            required
                            minLength={6}
                            className={inputStyles}
                            onChange={handleInputChange}
                            aria-label="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(s => !s)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-2xl text-tertiary-dark dark:text-white"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="btn-tertiary-solid">
                        {isSigningIn ? 'Sign in' : 'Sign up'}
                    </button>
                </form>

                <div className="flex flex-col space-y-2">
                    <button onClick={() => setIsSigningIn(s => !s)} className="btn-tertiary-outline w-full">
                        {isSigningIn ? 'Create a new Account' : 'Already have an account? Sign in'}
                    </button>

                    <button onClick={() => setShowForgot(true)} className="text-sm underline text-tertiary-dark dark:text-white self-start">
                        Forgot username or password?
                    </button>
                </div>

                {showForgot && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                        <div ref={forgotRef} className="modal-panel w-80">
                            <h2 className="text-lg font-semibold mb-3">Forgot username or password</h2>
                            <form onSubmit={handleForgotSubmit} className="space-y-3">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    required
                                    className={inputStyles}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                                <div className="flex space-x-2">
                                    <button type="submit" className="btn-tertiary-solid flex-1" disabled={resendCooldown > 0}>{resendCooldown > 0 ? `Sent — wait ${resendCooldown}s` : 'Send reset'}</button>
                                    <button type="button" onClick={() => setShowForgot(false)} className="btn-tertiary flex-1">Cancel</button>
                                </div>
                                <div className="mt-2">
                                    <button type="button" onClick={handleResend} disabled={resendCooldown > 0} className="btn-tertiary-white">
                                        {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend email'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Auth