export default function SuccessPage() {
    return (
        <main className="min-h-screen bg-[#090711] text-white flex items-center justify-center">
            <div className="text-center p-10">
                <h1 className="text-3xl font-bold text-purple-400">
                    Payment Successful!
                </h1>

                <p className="mt-4 text-gray-400">
                    Thank you for supporting Vyre RSPS!
                </p>

                <a
                    href="/store"
                    className="mt-8 inline-block rounded-lg bg-purple-600 px-6 py-3 font-bold"
                >
                    Return to Store
                </a>
            </div>
        </main>
    );
}