"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Profile = {
    username: string;
    rsps_username: string | null;
    created_at: string;
};

export default function AccountPage() {
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [email, setEmail] = useState("");

    const [newUsername, setNewUsername] = useState("");
    const [rspsUsername, setRspsUsername] = useState("");

    const [message, setMessage] = useState("");
    const [rspsMessage, setRspsMessage] = useState("");

    const [saving, setSaving] = useState(false);
    const [savingRspsUsername, setSavingRspsUsername] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                router.replace("/login");
                return;
            }

            setEmail(user.email ?? "");

            const { data, error } = await supabase
                .from("profiles")
                .select("username, rsps_username, created_at")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Could not load profile:", error.message);
            } else {
                setProfile(data);
                setNewUsername(data.username);
                setRspsUsername(data.rsps_username ?? "");
            }

            setLoading(false);
        }

        loadProfile();
    }, [router]);

    async function handleSaveUsername(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setMessage("");

        const trimmedUsername = newUsername.trim();

        if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
            setMessage("Username must be between 3 and 20 characters.");
            return;
        }

        setSaving(true);

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setMessage("Your session expired. Please log in again.");
            setSaving(false);
            router.replace("/login");
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .update({ username: trimmedUsername })
            .eq("id", user.id)
            .select("username, rsps_username, created_at")
            .single();

        if (error) {
            if (error.code === "23505") {
                setMessage("That username is already taken.");
            } else {
                setMessage(`Could not save username: ${error.message}`);
            }
        } else {
            setProfile(data);
            setNewUsername(data.username);
            setRspsUsername(data.rsps_username ?? "");
            setMessage("Username updated successfully!");
        }

        setSaving(false);
    }

    async function handleSaveRspsUsername(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setRspsMessage("");

        const trimmedUsername = rspsUsername.trim();

        if (trimmedUsername.length < 1 || trimmedUsername.length > 12) {
            setRspsMessage(
                "RSPS username must be between 1 and 12 characters."
            );
            return;
        }

        setSavingRspsUsername(true);

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setRspsMessage("Your session expired. Please log in again.");
            setSavingRspsUsername(false);
            router.replace("/login");
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .update({ rsps_username: trimmedUsername })
            .eq("id", user.id)
            .select("rsps_username")
            .single();

        if (error) {
            if (error.code === "23505") {
                setRspsMessage(
                    "That RSPS username is already linked to another account."
                );
            } else {
                setRspsMessage(
                    `Could not save RSPS username: ${error.message}`
                );
            }
        } else {
            setRspsUsername(data.rsps_username ?? "");
            setRspsMessage("RSPS username linked successfully!");
        }

        setSavingRspsUsername(false);
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        router.replace("/login");
    }

    if (loading) {
        return (
            <main style={styles.page}>
                <p>Loading your Vyre account...</p>
            </main>
        );
    }

    return (
        <main style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Vyre Account Dashboard</h1>

                <p style={styles.subtitle}>
                    Welcome to your player account.
                </p>

                <div style={styles.infoBox}>
                    <p>
                        <strong>Username:</strong>{" "}
                        {profile?.username ?? "Profile not found"}
                    </p>

                    <p>
                        <strong>Email:</strong> {email}
                    </p>

                    <p>
                        <strong>Account Status:</strong> Signed In
                    </p>

                    {profile?.created_at && (
                        <p>
                            <strong>Registered:</strong>{" "}
                            {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div style={styles.infoBox}>
                    <h2 style={styles.sectionTitle}>
                        Edit Website Username
                    </h2>

                    <form onSubmit={handleSaveUsername}>
                        <label htmlFor="newUsername" style={styles.label}>
                            New username
                        </label>

                        <input
                            id="newUsername"
                            type="text"
                            value={newUsername}
                            onChange={(event) =>
                                setNewUsername(event.target.value)
                            }
                            minLength={3}
                            maxLength={20}
                            required
                            style={styles.input}
                            placeholder="Enter a new username"
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            style={styles.button}
                        >
                            {saving ? "Saving..." : "Save Username"}
                        </button>
                    </form>

                    {message && <p style={styles.message}>{message}</p>}
                </div>

                <div style={styles.infoBox}>
                    <h2 style={styles.sectionTitle}>In-Game Account</h2>

                    <p>
                        <strong>RSPS Username:</strong>{" "}
                        {profile?.rsps_username || "Not linked"}
                    </p>

                    <p>
                        <strong>Link Status:</strong>{" "}
                        {profile?.rsps_username ? "Linked" : "Not linked"}
                    </p>

                    <form onSubmit={handleSaveRspsUsername}>
                        <label htmlFor="rspsUsername" style={styles.label}>
                            Your Vyre in-game username
                        </label>

                        <input
                            id="rspsUsername"
                            type="text"
                            value={rspsUsername}
                            onChange={(event) =>
                                setRspsUsername(event.target.value)
                            }
                            minLength={1}
                            maxLength={12}
                            required
                            style={styles.input}
                            placeholder="Enter your RSPS username"
                        />

                        <button
                            type="submit"
                            disabled={savingRspsUsername}
                            style={styles.button}
                        >
                            {savingRspsUsername
                                ? "Saving..."
                                : profile?.rsps_username
                                    ? "Update RSPS Username"
                                    : "Link RSPS Username"}
                        </button>
                    </form>

                    {rspsMessage && (
                        <p style={styles.message}>{rspsMessage}</p>
                    )}

                    <p style={styles.smallText}>
                        Make sure this matches the username you use to log into
                        Vyre. Your store purchases will eventually be delivered
                        to this account.
                    </p>
                </div>

                <div style={styles.buttons}>
                    <a href="/store" style={styles.button}>
                        Visit Store
                    </a>

                    <a href="/vote" style={styles.button}>
                        Vote for Vyre
                    </a>
                </div>

                <button
                    onClick={handleLogout}
                    style={styles.logoutButton}
                >
                    Logout
                </button>

                <a href="/" style={styles.homeLink}>
                    Back to Home
                </a>
            </div>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#080611",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
    },
    card: {
        width: "100%",
        maxWidth: "600px",
        background: "#120d20",
        border: "1px solid #39245b",
        borderRadius: "16px",
        padding: "32px",
        textAlign: "center",
    },
    title: {
        color: "#b77aff",
        fontSize: "30px",
        marginBottom: "10px",
    },
    subtitle: {
        color: "#c4b8d8",
        marginBottom: "28px",
    },
    infoBox: {
        background: "#0b0813",
        border: "1px solid #302044",
        borderRadius: "10px",
        padding: "18px",
        textAlign: "left",
        lineHeight: "1.8",
        overflowWrap: "anywhere",
        marginBottom: "16px",
    },
    sectionTitle: {
        color: "#b77aff",
        marginTop: 0,
    },
    label: {
        display: "block",
        marginBottom: "8px",
        color: "#c4b8d8",
    },
    input: {
        boxSizing: "border-box",
        width: "100%",
        background: "#080611",
        color: "#ffffff",
        border: "1px solid #493064",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "12px",
    },
    message: {
        color: "#d8b4fe",
        marginBottom: 0,
    },
    smallText: {
        color: "#c4b8d8",
        fontSize: "14px",
    },
    buttons: {
        display: "flex",
        gap: "12px",
        justifyContent: "center",
        flexWrap: "wrap",
        marginTop: "24px",
    },
    button: {
        display: "inline-block",
        background: "#7c3aed",
        color: "#ffffff",
        padding: "12px 18px",
        border: "none",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: "bold",
        cursor: "pointer",
    },
    logoutButton: {
        display: "block",
        width: "100%",
        marginTop: "20px",
        background: "#24152f",
        color: "#e9d5ff",
        border: "1px solid #6b3b91",
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
    },
    homeLink: {
        display: "inline-block",
        marginTop: "20px",
        color: "#b77aff",
        textDecoration: "none",
    },
};