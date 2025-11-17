"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContextProvider";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated;

  const navItems = isLoggedIn
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Practice", href: "/practice" },
        { label: "Matching", href: "/matching" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Assessment", href: "/assessment" },
      ]
    : [
        { label: "Features", href: "#how-it-works" },
        { label: "Practice Zone", href: "#practice-zone" },
        { label: "Careers", href: "#careers" },
        { label: "About", href: "#track-record" },
      ];

  return (
    <nav className="z-50 bg-slate-950 backdrop-blur-xl border-b border-gray-700/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link href="/">
            <div
              className="flex items-center cursor-pointer"
              data-testid="link-logo"
            >
              <Image
                src="/logo.webp"
                alt="TrainingX.Ai Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              {/* <span className="text-2xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                TrainingX.Ai
              </span> */}
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) =>
              item.href.startsWith("#") ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-100 hover:text-gray-50 transition-colors"
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.href}>
                  <span
                    className="text-gray-100 hover:text-gray-50 transition-colors cursor-pointer"
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            )}
          </div>
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn && (
              <Link href="/auth">
                <Button
                  className="bg-gradient-to-r from-gradient-from to-gradient-to"
                  data-testid="button-get-started"
                >
                  {/* Get Started */}
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 stroke-white" />
            ) : (
              <Menu className="h-6 w-6 stroke-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) =>
                item.href.startsWith("#") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-gray-100 hover:text-gray-50 transition-colors px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} href={item.href}>
                    <span
                      className="text-gray-100 hover:text-gray-50 transition-colors px-2 py-1 cursor-pointer block"
                      onClick={() => setIsMenuOpen(false)}
                      data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              )}
              {!isLoggedIn && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link href="/auth">
                    <Button
                      className="bg-gradient-to-r from-gradient-from to-gradient-to w-full"
                      data-testid="mobile-button-get-started"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
