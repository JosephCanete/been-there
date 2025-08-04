import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Been There Philippines
                </h1>
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                href="/stats"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Stats
              </Link>
              <Link
                href="/map"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 font-medium"
              >
                Start Tracking
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* About Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            About Been There Philippines
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A passion project dedicated to helping Filipino travelers and
            visitors document their incredible journeys across our beautiful
            archipelago.
          </p>
        </div>

        <div className="space-y-16">
          {/* Mission Section */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Our Mission
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              The Philippines is home to over 7,640 islands, each with its own
              unique beauty, culture, and experiences. Our interactive travel
              tracker makes it easy to visualize and document your journey
              across this incredible archipelago.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you&apos;re a local exploring your own backyard or a
              visitor discovering the Philippines for the first time, this tool
              helps you keep track of where you&apos;ve been and plan where to
              go next.
            </p>
          </section>

          {/* How It Works */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              How It Works
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  🗺️ Interactive Map
                </h4>
                <p className="text-gray-600">
                  Click on any province to cycle through different status
                  levels. Pan and zoom to explore every corner of the
                  Philippines.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  📱 Mobile Friendly
                </h4>
                <p className="text-gray-600">
                  Fully responsive design works perfectly on your phone, tablet,
                  or desktop. Track your travels wherever you are.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  💾 Auto Save
                </h4>
                <p className="text-gray-600">
                  Your progress is automatically saved locally in your browser.
                  No account required, your data stays private.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  📊 Progress Tracking
                </h4>
                <p className="text-gray-600">
                  See detailed statistics about your travel progress and
                  completion percentage across all Philippine regions.
                </p>
              </div>
            </div>
          </section>

          {/* Status Levels */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Travel Status Levels
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded border-2 border-green-700"></div>
                <div>
                  <h4 className="font-semibold text-green-800">Been There</h4>
                  <p className="text-green-700 text-sm">
                    Places you&apos;ve visited and explored
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded border-2 border-blue-700"></div>
                <div>
                  <h4 className="font-semibold text-blue-800">Visited</h4>
                  <p className="text-blue-700 text-sm">
                    Destinations where you&apos;ve spent the night or stayed
                    longer
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                <div className="w-6 h-6 bg-red-500 rounded border-2 border-red-700"></div>
                <div>
                  <h4 className="font-semibold text-red-800">Lived</h4>
                  <p className="text-red-700 text-sm">
                    Places you&apos;ve passed through during transit
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gray-300 rounded border-2 border-gray-500"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Not Visited</h4>
                  <p className="text-gray-700 text-sm">
                    Areas you haven&apos;t explored yet
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Details */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Built With
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Next.js 15 with App Router</li>
                  <li>• React 18 with TypeScript</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Interactive SVG maps</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Pan and zoom interactions</li>
                  <li>• Touch and mobile support</li>
                  <li>• Local storage persistence</li>
                  <li>• Keyboard navigation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Mapping?</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Begin documenting your Philippine adventures today. Every journey
              has a story worth remembering.
            </p>
            <Link
              href="/map"
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-block"
            >
              🗺️ Open Interactive Map
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <span className="text-xl font-bold">Been There Philippines</span>
            </div>
            <p className="text-gray-400 mb-6">
              Track your adventures across the beautiful Philippines
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/map"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Map
              </Link>
              <Link
                href="/stats"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Stats
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                © 2025 Been There Philippines. Made with ❤️ for Filipino
                travelers.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
