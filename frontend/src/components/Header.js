"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { tokenService } from "../utils/auth";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = tokenService.getUserData();
    const token = tokenService.getToken();
    
    if (token && userData) {
      setUser(userData);
    }
  }, []);

  const getUserInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <header className="w-full z-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 lg:ml-60">
        {/* Mobile: Logo and menu */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white/80 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <Link
            href="/dashboard"
            className="ml-3 text-xl font-bold text-white lg:hidden"
          >
            ERPNumber1
          </Link>
        </div>

        {/* Right: User info and actions */}
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-700 dark:bg-pink-700 flex items-center justify-center text-sm font-bold text-white">
                  {getUserInitials(user.name)}
                </div>
                <div className="hidden md:block">
                  <span className="text-sm font-semibold text-white">
                    {user.name}
                  </span>
                  <div className="text-xs text-purple-200 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
              <LogoutButton className="text-sm py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" />
            </>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm bg-white hover:bg-gray-100 text-purple-600 rounded-lg transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800">
          <nav className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-purple-100 mb-3">
                  Welcome, <span className="font-medium text-white">{user.name}</span> 
                  <span className="block text-xs text-purple-200 capitalize">({user.role})</span>
                </div>
                {["dashboard", "orders", "customers", "products", "settings"].map(
                  (route) => (
                    <Link
                      key={route}
                      href={`/dashboard/${route === "dashboard" ? "" : route}`}
                      className="block px-4 py-3 rounded-lg text-base font-medium transition-colors bg-purple-500 hover:bg-purple-400 text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {route.charAt(0).toUpperCase() + route.slice(1)}
                    </Link>
                  )
                )}
                <div className="px-3 py-2 pt-4">
                  <LogoutButton className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors" />
                </div>
              </>
            ) : (
              <div className="space-y-3 px-3">
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-3 bg-white hover:bg-gray-100 text-purple-600 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}