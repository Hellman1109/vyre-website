
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
                        Download the official Vyre client and join a world of adventure,
                        challenging encounters, and a community built for you.
                    </p>

                    <a
                        href="https://drive.google.com/file/d/1aq5Pfz6U3ohPHGT_daWrpVOSI6SO8c87/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 inline-flex rounded-lg bg-purple-600 px-8 py-4 font-bold transition hover:bg-purple-500"
                    >
                        DOWNLOAD FOR WINDOWS
                    </a>

                    <p className="mt-4 text-sm text-gray-500">
                        Windows · Official Vyre Client
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-2xl font-bold text-purple-300">
                        Getting Started
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        {[
                            ["01", "Download", "Download the Vyre client ZIP file."],
                            ["02", "Extract", "Right-click the ZIP file and select Extract All."],
                            ["03", "Play", "Open the extracted folder and launch Vyre.exe."],
                        ].map(([number, title, description]) => (
                            <div
                                key={number}
                                className="rounded-xl border border-purple-900/40 bg-white/[0.03] p-6"
                            >
                                <p className="text-sm font-bold text-purple-400">{number}</p>
                                <h3 className="mt-2 text-lg font-bold">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-400">
                                    {description}
                                </p>
                            </div>
                        ))}
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
