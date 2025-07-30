"use client";

import {useEffect, useState} from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      title: "Real-time Collaboration",
      description: "Work together seamlessly with your team. See changes instantly as they happen.",
    },
    {
      icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 7l3 3",
      title: "Advanced Design Tools",
      description: "Professional-grade tools for vector editing, prototyping, and design systems.",
    },
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      title: "Lightning Fast",
      description: "Optimized performance ensures smooth designing even with complex projects.",
    }
  ];

  return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
              className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl"
              style={{
                transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
                transition: 'transform 0.1s ease-out'
              }}
          />
          <div
              className="absolute top-1/2 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl"
              style={{
                transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
                transition: 'transform 0.1s ease-out'
              }}
          />
        </div>

        {/* Spacer for fixed navbar */}
        <div className="h-[9vh]"></div>

        {/* Hero Section with Enhanced Browser Mockup */}
        <div className="relative z-10 pt-8 pb-12 px-6">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="container mx-auto">
              <div className="relative max-w-5xl mx-auto">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-white/5 blur-3xl rounded-3xl transform scale-110" />

                <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                  {/* Browser Header */}
                  <div className="bg-gray-800/80 px-6 py-4 flex items-center space-x-3 border-b border-white/10">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-white/30 rounded-full hover:bg-white/50 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 bg-white/30 rounded-full hover:bg-white/50 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 bg-white/30 rounded-full hover:bg-white/50 transition-colors cursor-pointer"></div>
                    </div>
                    <div className="flex-1 bg-black/30 rounded-xl px-6 py-2 mx-6 border border-white/10">
                      <span className="text-white/70 text-sm font-mono">https://onedraw.com</span>
                    </div>
                  </div>

                  {/* Browser Content */}
                  <div className="p-10 h-96 bg-gradient-to-br from-gray-900/50 to-black/50">
                    <div className="w-full h-full bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                      {/* Animated design elements */}
                      <div className="absolute top-6 left-6 w-12 h-12 bg-white/80 rounded-xl animate-pulse shadow-lg"></div>
                      <div className="absolute top-6 right-6 w-8 h-8 bg-white/60 rounded-full animate-bounce delay-300"></div>
                      <div className="absolute bottom-6 left-12 w-16 h-6 bg-white/70 rounded-full animate-pulse delay-700"></div>
                      <div className="absolute bottom-6 right-12 w-6 h-12 bg-white/50 rounded-lg animate-bounce delay-1000"></div>

                      {/* Grid pattern overlay */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="w-full h-full" style={{
                          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }}></div>
                      </div>

                      {/* Center content */}
                      <div className="text-center z-10">
                        <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                          <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <p className="text-white text-xl font-semibold mb-2">Live Design Canvas</p>
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                          <span className="text-white/70 text-sm font-medium">3 designers collaborating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Text Section */}
        <div className="relative z-20 pt-20">
          <div className={`container mx-auto px-6 py-20 text-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-7xl md:text-9xl font-black text-white mb-8 leading-none tracking-tight">
              Design{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Together
            </span>
              <br />
              Create{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">
              Excellence
            </span>
            </h1>
            <p className="text-2xl text-gray-400 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              The definitive collaborative design platform where teams create extraordinary work.
              Experience seamless real-time collaboration with professional-grade tools.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
              <button className="group relative bg-white text-black px-12 py-5 rounded-full text-xl font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 transform hover:shadow-2xl">
                <span className="relative z-10">Start Creating Free</span>
              </button>
              <button className="group border-2 border-white/30 text-white px-12 py-5 rounded-full text-xl font-semibold hover:border-white hover:bg-white/5 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <span className="flex items-center">
                Watch Demo
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { number: '100K+', label: 'Active Creators', accent: 'bg-white' },
                { number: '5M+', label: 'Projects Created', accent: 'bg-gray-300' },
                { number: '99.9%', label: 'Uptime SLA', accent: 'bg-gray-500' }
              ].map((stat, index) => (
                  <div key={index} className="group p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className={`w-3 h-3 ${stat.accent} rounded-full mx-auto mb-4 group-hover:scale-150 transition-transform`}></div>
                    <div className="text-5xl font-black text-white mb-3">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 font-medium text-lg">{stat.label}</div>
                  </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="container mx-auto px-6 py-24">
            <div className={`text-center mb-20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-6xl font-black text-white mb-8 tracking-tight">
                Everything you need to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                design brilliantly
              </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Powerful features engineered for teams who demand excellence and efficiency in their creative workflow
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className={`group relative p-10 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer ${activeFeature === index ? 'ring-2 ring-white/30' : ''}`}
                      onMouseEnter={() => setActiveFeature(index)}
                      style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-20 h-20">
                      <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full opacity-30 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="relative z-10">
                      <div className="w-20 h-20 mx-auto mb-8 bg-white/10 rounded-3xl flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300 border border-white/20">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                        </svg>
                      </div>

                      <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-gray-100 transition-colors">
                        {feature.title}
                      </h3>

                      <p className="text-gray-400 leading-relaxed text-lg group-hover:text-gray-300 transition-colors mb-6">
                        {feature.description}
                      </p>

                      {/* Hover indicator */}
                      <div className="flex items-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="w-8 h-px bg-white mr-4"></div>
                        <span className="text-sm font-medium tracking-wide">EXPLORE</span>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="relative mt-24 bg-gradient-to-t from-gray-900 to-transparent border-t border-white/10">
            <div className="container mx-auto px-6 py-20">
              <div className="grid md:grid-cols-4 gap-16">
                <div className="md:col-span-1">
                  <h3 className="text-4xl font-black text-white mb-6 tracking-tight">
                    OneDraw
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                    Redefining collaborative design through innovation, precision, and seamless teamwork.
                  </p>
                  <div className="flex space-x-4">
                    {['Tw', 'Gh', 'Li'].map((social) => (
                        <a
                            key={social}
                            href="#"
                            className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 border border-white/20 font-bold text-sm"
                        >
                          {social}
                        </a>
                    ))}
                  </div>
                </div>

                {[
                  { title: 'Product', links: ['Features', 'Pricing', 'Templates', 'Integrations'] },
                  { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
                  { title: 'Support', links: ['Help Center', 'Contact', 'Community', 'Status'] }
                ].map((column, index) => (
                    <div key={index}>
                      <h4 className="font-black text-white mb-8 text-xl tracking-wide">{column.title}</h4>
                      <ul className="space-y-4">
                        {column.links.map((link) => (
                            <li key={link}>
                              <a
                                  href="#"
                                  className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-lg font-medium"
                              >
                                {link}
                              </a>
                            </li>
                        ))}
                      </ul>
                    </div>
                ))}
              </div>

              <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 mb-4 md:mb-0 font-medium">
                  &copy; 2025 OneDraw. All rights reserved.
                </p>
                <div className="flex space-x-8 text-sm">
                  {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((link) => (
                      <a
                          key={link}
                          href="#"
                          className="text-gray-500 hover:text-gray-300 transition-colors font-medium"
                      >
                        {link}
                      </a>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
  );
}