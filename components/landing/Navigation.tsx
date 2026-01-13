"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { signOut } = useAuthActions();

  const isLoggedIn = isAuthenticated;

  const navItems = isLoggedIn
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Practice", href: "/practice" },
        { label: "Matching", href: "/matching" },
        // { label: "Portfolio", href: "/portfolio" },
        // { label: "Assessment", href: "/quiz" },
        { label: "About", href: "/about" },
      ]
    : [
        { label: "Features", href: "#how-it-works" },
        { label: "Practice Zone", href: "#practice-zone" },
        { label: "Careers", href: "#careers" },
        { label: "About", href: "/about" },
      ];

  return (
    <nav className="z-50 bg-[#000408] backdrop-blur-xl border-b border-gray-700/50">
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
                alt="TrainingX.AI Logo"
                width={48}
                height={48}
                className="h-12 w-full"
              />
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
                  data-testid={`link-${item.label
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.href}>
                  <span
                    className="text-gray-100 hover:text-gray-50 transition-colors cursor-pointer"
                    data-testid={`link-${item.label
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            )}
          </div>
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="h-10 w-24 bg-gray-700/50 rounded-md animate-pulse" />
            ) : !isLoggedIn ? (
              <Link href="/auth">
                <Button
                  className="bg-gradient-to-r from-gradient-from to-gradient-to"
                  data-testid="button-get-started"
                >
                  Get Started
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={() => void signOut()}
                className="border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
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
          <div
            id="mobile-navigation"
            className="md:hidden py-4 border-t border-white/10"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) =>
                item.href.startsWith("#") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-gray-100 hover:text-gray-50 transition-colors px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid={`mobile-link-${item.label
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} href={item.href}>
                    <span
                      className="text-gray-100 hover:text-gray-50 transition-colors px-2 py-1 cursor-pointer block"
                      onClick={() => setIsMenuOpen(false)}
                      data-testid={`mobile-link-${item.label
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              )}
              {isLoading ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  <div className="h-10 w-full bg-gray-700/50 rounded-md animate-pulse" />
                </div>
              ) : !isLoggedIn ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  <Link href="/auth">
                    <Button
                      className="bg-gradient-to-r from-gradient-from to-gradient-to w-full"
                      data-testid="mobile-button-get-started"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => {
                      void signOut();
                      setIsMenuOpen(false);
                    }}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full"
                    data-testid="mobile-button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
