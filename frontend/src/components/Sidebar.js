// A simple sidebar component for the dashboard
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Orders', href: '/dashboard/orders' },
  { label: 'Customers', href: '/dashboard/customers' },
  {
    label: 'Products',
    children: [
      { label: 'Product A', href: '/dashboard/products/a' },
      { label: 'Product B', href: '/dashboard/products/b' },
      { label: 'Product C', href: '/dashboard/products/c' },
    ],
  },
  { label: 'Settings', href: '/dashboard/settings' },
];

function SidebarItem({ item, pathname }) {
  const [open, setOpen] = useState(false);
  const isActive = item.href ? pathname === item.href : item.children?.some(child => pathname === child.href);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={`flex items-center px-3 py-2 rounded-md transition-colors ${
          isActive
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
        }`}
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
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
          isActive
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
        }`}
      >
        <span>{item.label}</span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && (
        <div id={`submenu-${item.label}`} className="ml-4 mt-1 space-y-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block px-3 py-2 rounded-md transition-colors ${
                pathname === child.href
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
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

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 h-screen border-r border-zinc-200 dark:border-zinc-800 p-4 hidden lg:block">
      <div className="flex items-center mb-8 px-2">
        <span className="text-xl font-bold">OrderFlow</span>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <SidebarItem key={item.label} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}