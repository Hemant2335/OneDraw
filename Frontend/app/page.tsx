import React from "react";
import Link from "next/link";

export default function Home() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Navbar */}
        <nav className="p-6 bg-white shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-purple-800">DrawCanvas</h1>
            <Link href="/">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-300">
                Start Drawing
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold text-purple-800 mb-6">
            Unleash Your Creativity
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Draw, sketch, and create amazing art with our intuitive online canvas. Perfect for artists, designers, and anyone who loves to create!
          </p>
          <Link href="/">
            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-purple-700 transition duration-300">
              Get Started
            </button>
          </Link>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-purple-800 mb-16">
              Why Choose DrawCanvas?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="bg-purple-100 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  🎨
                </div>
                <h3 className="text-xl font-semibold text-purple-800 mt-6">
                  Easy to Use
                </h3>
                <p className="text-gray-600 mt-2">
                  Our canvas is designed to be simple and intuitive, so you can focus on creating.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="bg-purple-100 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  ✏️
                </div>
                <h3 className="text-xl font-semibold text-purple-800 mt-6">
                  Multiple Tools
                </h3>
                <p className="text-gray-600 mt-2">
                  Choose from a variety of tools like pens, shapes, and erasers to bring your ideas to life.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="bg-purple-100 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  🌐
                </div>
                <h3 className="text-xl font-semibold text-purple-800 mt-6">
                  Collaborative
                </h3>
                <p className="text-gray-600 mt-2">
                  Share your canvas with others and collaborate in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-purple-800 text-white py-8">
          <div className="container mx-auto px-6 text-center">
            <p className="text-lg">
              &copy; 2023 DrawCanvas. All rights reserved.
            </p>
            <p className="text-sm mt-2">
              Made with ❤️ by Your Team
            </p>
          </div>
        </footer>
      </div>
  );
}
