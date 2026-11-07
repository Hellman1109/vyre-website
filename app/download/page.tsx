export default function DownloadPage() {
    return (
        <main className="min-h-screen bg-[#090711] px-6 py-16 text-white">
            <div className="mx-auto max-w-4xl">
                <a
                    href="/"
                    className="text-sm text-purple-300 transition hover:text-purple-200"
                >
                    ← Back to Home
                </a>

                <section className="mt-12 rounded-2xl border border-purple-900/50 bg-purple-950/20 p-8 text-center sm:p-12">
                    <p className="text-sm font-bold uppercase tracking-[0.4em] text-purple-400">
                        Your adventure begins
                    </p>

                    <h1 className="mt-4 text-4xl font-black sm:text-6xl">
                        PLAY <span className="text-purple-400">VYRE</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl leading-7 text-gray-400">
                        Download the official Vyre Launcher and join a world of adventure,
                        challenging encounters, and a community built for you.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                        <a
                            href="https://github.com/Hellman1109/vyre-website/releases/download/launcher-v1.0.1/Vyre.Launcher-1.0.1.exe"
                            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-8 py-4 font-bold transition hover:bg-purple-500"
                        >
                            DOWNLOAD INSTALLER
                        </a>

                        <a
                            href="https://github.com/Hellman1109/vyre-website/releases/download/launcher-v1.0.1/Vyre-Launcher-Portable-v1.0.1.zip"
                            className="inline-flex items-center justify-center rounded-lg border border-purple-500/60 px-8 py-4 font-bold transition hover:bg-purple-500/10"
                        >
                            DOWNLOAD PORTABLE ZIP
                        </a>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        Windows · Vyre Launcher v1.0.1 · Java runtime included
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-2xl font-bold text-purple-300">
                        Getting Started
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-purple-900/40 bg-white/[0.03] p-6">
                            <p className="text-sm font-bold text-purple-400">OPTION 01</p>
                            <h3 className="mt-2 text-lg font-bold">Windows Installer</h3>
                            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-gray-400">
                                <li>Download and open the installer.</li>
                                <li>Follow the installation prompts.</li>
                                <li>Launch Vyre from your desktop or Start menu.</li>
                                <li>Click PLAY NOW.</li>
                            </ol>
                        </div>

                        <div className="rounded-xl border border-purple-900/40 bg-white/[0.03] p-6">
                            <p className="text-sm font-bold text-purple-400">OPTION 02</p>
                            <h3 className="mt-2 text-lg font-bold">Portable ZIP</h3>
                            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-gray-400">
                                <li>Download the portable ZIP.</li>
                                <li>Right-click it and select Extract All.</li>
                                <li>Open the extracted Vyre Launcher folder.</li>
                                <li>Double-click Vyre Launcher.exe, then click PLAY NOW.</li>
                            </ol>
                        </div>
                    </div>
                </section>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Need help?{" "}
                    <a
                        href="https://discord.gg/vyrersps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-300 hover:text-purple-200"
                    >
                        Join our Discord
                    </a>
                </p>
            </div>
        </main>
    );
}
