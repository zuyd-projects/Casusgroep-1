"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Simulations", href: "/dashboard/simulations" },
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Voorraad Beheer", href: "/dashboard/voorraadBeheer" },
  { label: "Supplier", href: "/dashboard/supplier" },
  { label: "Plannings", href: "/dashboard/plannings" },
  { label: "Runner", href: "/dashboard/runner" },
  {
    label: "Production Lines",
    href: "/dashboard/production-lines",
    children: [
      { label: "Production Line 1", href: "/dashboard/production-lines/1" },
      { label: "Production Line 2", href: "/dashboard/production-lines/2" },
    ],
  },
  { label: "Account Manager", href: "/dashboard/accountManager" },
  { label: "Delivery", href: "/dashboard/delivery" },
  { label: "Process Mining", href: "/dashboard/process-mining" },
  { label: "Admin", href: "/dashboard/admin" },
];

function SidebarItem({ item, pathname, onMobileMenuClose }) {
  const [open, setOpen] = useState(false);
  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((child) => pathname === child.href);

  const baseClass =
    "flex items-center justify-between px-4 py-2 rounded-lg transition-all font-medium";
  const activeClass = "bg-purple-800 text-white shadow-md";
  const inactiveClass = "text-white/90 hover:bg-white/10 hover:text-white";

  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={onMobileMenuClose}
        className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`submenu-${item.label}`}
        onClick={() => setOpen((v) => !v)}
        className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        <span>{item.label}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${
            open ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      {open && (
        <div id={`submenu-${item.label}`} className="ml-4 mt-1 space-y-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onMobileMenuClose}
              className={`block px-4 py-2 rounded-lg transition-colors font-medium ${
                pathname === child.href
                  ? "bg-pink-700 text-white shadow-md"
                  : "text-white/80 hover:bg-pink-600/20 hover:text-white"
              }`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg shadow-lg"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          w-60 h-screen bg-gradient-to-b from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800 text-white p-6 rounded-br-3xl shadow-2xl relative
          lg:block
          ${isMobileMenuOpen ? 'fixed left-0 top-0 z-40' : 'hidden lg:block'}
        `}
      >
      <div className="flex items-center mb-10 px-2">
        <span className="text-3xl font-extrabold tracking-wide drop-shadow-lg text-white">
          ERPNumber1
        </span>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <SidebarItem 
            key={item.label} 
            item={item} 
            pathname={pathname}
            onMobileMenuClose={() => setIsMobileMenuOpen(false)}
          />
        ))}
      </nav>
      <div className="absolute bottom-8 left-0 w-full px-6">
        <span className="text-white/70 text-sm">About</span>
      </div>
    </aside>
    </>
  );
}
