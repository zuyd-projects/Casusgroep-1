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
    <header className="w-full z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 lg:ml-60">
        {/* Mobile: Logo and menu */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
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
            className="ml-3 font-semibold text-zinc-800 dark:text-white lg:hidden"
          >
            OrderFlow
          </Link>
        </div>

        {/* Right: Search and icons */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="py-1.5 pl-8 pr-4 w-48 lg:w-64 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-500 text-zinc-800 dark:text-white"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex items-center">
            <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405M18 14.158V11a6 6 0 00-4-5.659V5a2 2 0 00-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            <div className="ml-3 flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-600 dark:bg-pink-600 flex items-center justify-center text-sm font-bold text-white">
                      {getUserInitials(user.name)}
                    </div>
                    <div className="hidden md:block">
                      <span className="text-sm font-medium text-zinc-800 dark:text-white">
                        {user.name}
                      </span>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {user.role}
                      </div>
                    </div>
                  </div>
                  <LogoutButton className="text-sm py-1 px-3" />
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800">
          <nav className="px-2 py-3 space-y-1">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Welcome, {user.name} ({user.role})
                </div>
                {["dashboard", "orders", "customers", "products", "settings"].map(
                  (route) => (
                    <Link
                      key={route}
                      href={`/dashboard/${route === "dashboard" ? "" : route}`}
                      className="block px-3 py-2 rounded-md text-base font-medium transition-colors bg-pink-400/80 text-white shadow dark:bg-zinc-800 dark:text-white"
                    >
                      {route.charAt(0).toUpperCase() + route.slice(1)}
                    </Link>
                  )
                )}
                <div className="px-3 py-2">
                  <LogoutButton className="w-full" />
                </div>
              </>
            ) : (
              <div className="space-y-2 px-3">
                <Link
                  href="/login"
                  className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
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
