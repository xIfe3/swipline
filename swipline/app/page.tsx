"use client";

import { useState } from "react";
import {
  Search,
  Package,
  Shield,
  Clock,
  Globe,
  Truck,
  CheckCircle,
  Users,
  Award,
  Zap,
  MapPin,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [trackingId, setTrackingId] = useState("");
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track/${trackingId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gray-50" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium mb-6 border border-blue-100">
                <Zap className="w-4 h-4 mr-2" />
                Fast & Secure Border Crossings
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Ship Across <span className="text-blue-600">Borders</span>
                <br />
                With <span className="text-orange-500">Confidence</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Real-time tracking, instant border fee payments, and seamless
                delivery across 150+ countries. Your global shipping partner.
              </p>

              {/* Tracking Search */}
              <div className="max-w-2xl mx-auto mb-16">
                <form onSubmit={handleTrack} className="relative">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={trackingId}
                          onChange={(e) =>
                            setTrackingId(e.target.value.toUpperCase())
                          }
                          placeholder="Enter your tracking ID (e.g., SWPL240101ABC123)"
                          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Search className="w-5 h-5 mr-2 inline" />
                      Track Parcel
                    </button>
                  </div>
                </form>
                <p className="text-gray-500 text-sm mt-3">
                  Enter the tracking ID received via email
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
                <Link
                  href="/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-3 transition-all"
                >
                  <Package className="w-5 h-5" />
                  Create New Shipment
                </Link>
                <Link
                  href="/login"
                  className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-semibold text-lg px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
              {[
                { number: "50K+", label: "Parcels Delivered" },
                { number: "150+", label: "Countries" },
                { number: "99%", label: "On-time Delivery" },
                { number: "24/7", label: "Support" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Swipline?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need for seamless international shipping
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Global Reach",
                description:
                  "Ship to 150+ countries with competitive rates and local expertise",
                color: "text-blue-600",
                bgColor: "bg-blue-50",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure Payments",
                description:
                  "One-click border fee payments with bank-level security",
                color: "text-green-600",
                bgColor: "bg-green-50",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Real-time Tracking",
                description:
                  "Live updates with map visualization and delivery alerts",
                color: "text-purple-600",
                bgColor: "bg-purple-50",
              },
              {
                icon: <Truck className="w-8 h-8" />,
                title: "Fast Delivery",
                description:
                  "Optimized routes and customs clearance for speedy delivery",
                color: "text-orange-600",
                bgColor: "bg-orange-50",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Dedicated Support",
                description:
                  "24/7 customer support for all your shipping questions",
                color: "text-red-600",
                bgColor: "bg-red-50",
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Trusted Partner",
                description:
                  "Industry-leading reliability with 99% satisfaction rate",
                color: "text-indigo-600",
                bgColor: "bg-indigo-50",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6`}
                >
                  <div className={feature.color}>{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works in 4 Easy Steps
            </h2>
            <p className="text-gray-600 text-lg">
              From booking to delivery - we handle everything
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Shipment",
                description: "Fill parcel details and get instant quote",
                icon: "📝",
              },
              {
                step: "02",
                title: "Get Tracking ID",
                description: "Receive tracking ID instantly via email",
                icon: "📧",
              },
              {
                step: "03",
                title: "Track Live",
                description: "Monitor real-time location on interactive map",
                icon: "📍",
              },
              {
                step: "04",
                title: "Pay & Deliver",
                description: "Clear border fees online, get door delivery",
                icon: "🚚",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center h-full shadow-sm">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {step.step}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-8 h-0.5 bg-blue-200 transform translate-x-4 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Details Form */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ready to Ship With Us?
              </h2>
              <p className="text-gray-600 text-lg">
                Get a custom quote in minutes
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Your Company Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Needs *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32"
                    placeholder="Tell us about your shipping requirements, destinations, frequency, etc."
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletter"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="newsletter"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Yes, I'd like to receive shipping tips and updates from
                    Swipline
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Get Free Quote
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Start Shipping With Swipline Today
            </h2>
            <p className="text-xl mb-10 opacity-95">
              Join thousands of businesses shipping worldwide with confidence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    <span className="text-blue-400">Swip</span>line
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Border Crossing Made Simple
                  </p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                Your trusted partner for international shipping and logistics.
                Fast, secure, and reliable parcel delivery across borders.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-white mb-4">Services</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/track"
                      className="hover:text-white transition-colors"
                    >
                      Track Parcel
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/create"
                      className="hover:text-white transition-colors"
                    >
                      Create Shipment
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pay"
                      className="hover:text-white transition-colors"
                    >
                      Border Payments
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-white transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-white transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/careers"
                      className="hover:text-white transition-colors"
                    >
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-white transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cookies"
                      className="hover:text-white transition-colors"
                    >
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Swipline. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
