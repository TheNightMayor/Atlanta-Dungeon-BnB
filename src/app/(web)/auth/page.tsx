'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc"
import { signIn, useSession } from 'next-auth/react'
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const defaultFormData = {
    email: '',
    name: '',
    password: '',
};

const Auth = () => {
    const [formData, setFormData] = useState(defaultFormData);

    const inputStyles =
        "border-2 border-tertiary-dark dark:bg-black dark:text-white sm:text-sm text-black rounded-lg block w-full p-2.5 focus:outline-none"

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) router.push("/")
    }, [router, session]);


    const loginHandler = async (provider?: 'google' | 'github' | 'credentials') => {
        try {
            if (provider && provider !== 'credentials') {
                await signIn(provider, { callbackUrl: '/' });
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

            router.push('/');
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

            if (response.ok) {
                toast.success('Account created — signing you in');
                await loginHandler();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Something went wrong');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setFormData(defaultFormData);
        }
    };

    return (
            <section className="container mx-auto pt-28 md:pt-24">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8 w-80 md:w-[70%] mx-auto">
                <div className="flex mb-8 flex-col md:flex-row items-center justify-between">
                    <h1 className="text-ex font-bold leading-tight tracking-tight md:text-2xl">
                        Create an Account
                    </h1>
                    <p>OR</p>
                    <span className="ml-3 cursor-pointer inline-flex items-center font-medium border-2 border-tertiary-dark p-2 rounded-lg hover:bg-tertiary-dark hover:text-white transition-all duration-300"
                        onClick={() => loginHandler('google')}
                    >
                        Sign in with Google:
                        <FcGoogle className="ml-2 text-2xl" />

                        
                    </span>
                </div>

                <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        required
                        className={inputStyles}
                        value={formData.name}
                        onChange={handleInputChange}
                    /> <input
                        type="email"
                        name="email"
                        value={formData.email}
                        placeholder="name@company.com"
                        required
                        className={inputStyles}
                        onChange={handleInputChange}
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        placeholder="password"
                        required
                        minLength={6}
                        className={inputStyles}
                        onChange={handleInputChange}
                    />
                    <button
                        type="submit"
                        className="w-full text-white bg-tertiary-dark focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:bg-white hover:text-black border-2 border-tertiary-dark transition-all duration-300">
                        Sign up
                    </button>
                </form>

                <button onClick={() => loginHandler()} className="rounded-lg border-2 border-tertiary-dark px-5 py-2.5 hover:bg-tertiary-dark hover:text-white dark:hover:bg-tertiary-dark dark:hover:text-white font-medium transition-all duration-300">
                    Already have an account? Sign in
                </button>
            </div>
        </section>
    )
}

export default Auth