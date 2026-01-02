"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  MapPin,
  CreditCard,
  User,
  Menu,
  X,
  Globe,
} from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Track", href: "/track", icon: <MapPin className="w-4 h-4" /> },
    { name: "Create", href: "/create", icon: <Package className="w-4 h-4" /> },
    { name: "Pay", href: "/pay", icon: <CreditCard className="w-4 h-4" /> },
    { name: "Login", href: "/login", icon: <User className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Increased size for better visibility */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="SwiftTrack Logo"
              width={200} // Increased from 160
              height={50} // Increased from 40
              className="h-auto w-auto max-h-12" // max-h-12 ensures it doesn't get too tall
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
            <Link
              href="/register"
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center mt-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
