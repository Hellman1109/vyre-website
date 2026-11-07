
import AuthNav from "./components/AuthNav";

export default function Home() {
  return (
      <main className="min-h-screen bg-[#090711] text-white">
        <nav className="flex items-center justify-between border-b border-purple-900/40 px-8 py-5">
          <h1 className="text-2xl font-black tracking-[0.25em] text-purple-300">
            VYRE
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
            <a href="#home" className="hover:text-purple-300">Home</a>
            <a href="#features" className="hover:text-purple-300">Features</a>
            <a href="/highscores" className="hover:text-purple-300">Highscores</a>
            <a href="/vote" className="hover:text-purple-300">Vote</a>
            <a href="/store" className="hover:text-purple-300">Store</a>
            <a href="/download" className="hover:text-purple-300">Download</a>

            <AuthNav />

            <a
                href="https://discord.gg/vyrersps"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-300"
            >
              Community
            </a>
          </div>
        </nav>

        <section
            id="home"
            className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center"
        >
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-purple-400">
            A new adventure awaits
          </p>

          <h2 className="text-5xl font-black tracking-tight sm:text-7xl">
            WELCOME TO <span className="text-purple-400">VYRE</span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            Forge your legacy. Discover a world of adventure, challenging
            encounters, and a community built for you.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
                href="/download"
                className="rounded-lg bg-purple-600 px-8 py-4 font-bold transition hover:bg-purple-500"
            >
              PLAY NOW
            </a>

            <a
                href="https://discord.gg/vyrersps"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-purple-500/50 px-8 py-4 font-bold transition hover:bg-purple-500/10"
            >
              JOIN DISCORD
            </a>
          </div>

          <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-purple-900/50 bg-purple-950/20 p-5">
              <p className="text-sm text-gray-400">SERVER STATUS</p>
              <p className="mt-2 font-bold text-yellow-300">Coming Soon</p>
            </div>

            <div className="rounded-xl border border-purple-900/50 bg-purple-950/20 p-5">
              <p className="text-sm text-gray-400">PLAYERS ONLINE</p>
              <p className="mt-2 font-bold text-white">0</p>
            </div>

            <div className="rounded-xl border border-purple-900/50 bg-purple-950/20 p-5">
              <p className="text-sm text-gray-400">REVISION</p>
              <p className="mt-2 font-bold text-purple-300">240</p>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-purple-900/30 px-8 py-16">
          <h3 className="text-center text-3xl font-bold">
            YOUR ADVENTURE STARTS HERE
          </h3>

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              ["Explore", "Discover a world full of secrets and adventures."],
              ["Compete", "Take on challenging content and prove your skill."],
              ["Thrive", "Join a community and build your legacy."],
            ].map(([title, description]) => (
                <div
                    key={title}
                    className="rounded-xl border border-purple-900/40 bg-white/[0.03] p-6"
                >
                  <h4 className="text-xl font-bold text-purple-300">{title}</h4>
                  <p className="mt-3 leading-7 text-gray-400">{description}</p>
                </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-purple-900/30 px-8 py-6 text-center text-sm text-gray-500">
          © 2026 Vyre RSPS. All rights reserved.
        </footer>
      </main>
  );
}
