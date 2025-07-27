import InteractiveMap from "@/components/InteractiveMap";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Been There: Philippines
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your travels across the beautiful archipelago of the
              Philippines. Mark the regions you&apos;ve visited, stayed in, or
              passed through.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractiveMap className="w-full" />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Built with Next.js 15, TypeScript, and Tailwind CSS
            </p>
            <p className="text-sm">
              Start exploring and marking your Philippine adventures! 🇵🇭
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
