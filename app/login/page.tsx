"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setMessage(error.message);
            return;
        }

        router.push("/account");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#090711] px-6 text-white">
            <div className="w-full max-w-md">
                <a
                    href="/"
                    className="block text-center text-2xl font-black tracking-[0.25em] text-purple-300"
                >
                    VYRE
                </a>

                <div className="mt-10 rounded-2xl border border-purple-900/40 bg-white/[0.03] p-8">
                    <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-purple-400">
                        Welcome back
                    </p>

                    <h1 className="mt-3 text-center text-3xl font-black">
                        Login
                    </h1>

                    <p className="mt-3 text-center text-sm text-gray-400">
                        Sign in to your Vyre account.
                    </p>

                    <form onSubmit={handleLogin} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm text-gray-300">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full rounded-lg border border-purple-900/50 bg-black/30 px-4 py-3 outline-none transition focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-lg border border-purple-900/50 bg-black/30 px-4 py-3 outline-none transition focus:border-purple-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Signing In..." : "Login"}
                        </button>
                    </form>

                    {message && (
                        <p className="mt-5 rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-center text-sm text-red-200">
                            {message}
                        </p>
                    )}

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Don’t have an account?{" "}
                        <a
                            href="/register"
                            className="font-bold text-purple-300 hover:text-purple-200"
                        >
                            Register
                        </a>
                    </p>

                    <a
                        href="/account"
                        className="mt-4 block text-center text-sm text-purple-300 transition hover:text-purple-200"
                    >
                        Go to Account Dashboard →
                    </a>
                </div>

                <a
                    href="/"
                    className="mt-6 block text-center text-sm text-gray-500 hover:text-purple-300"
                >
                    ← Back to Home
                </a>
            </div>
        </main>
    );
}