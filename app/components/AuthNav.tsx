"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function AuthNav() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setLoggedIn(!!session);
            setLoading(false);
        }

        checkSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
    }

    const linkStyle = {
        color: "#e9d5ff",
        textDecoration: "none",
        marginLeft: "18px",
    };

    if (loading) {
        return null;
    }

    return loggedIn ? (
        <>
            <Link href="/account" style={linkStyle}>
                Account
            </Link>

            <button
                onClick={handleLogout}
                style={{
                    ...linkStyle,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                }}
            >
                Logout
            </button>
        </>
    ) : (
        <>
            <Link href="/login" style={linkStyle}>
                Login
            </Link>

            <Link href="/register" style={linkStyle}>
                Register
            </Link>
        </>
    );
}
