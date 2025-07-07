'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Package,
  LayoutGrid,
  ShoppingCart,
  Info,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    exact: true,
  },
  {
    href: '/dashboard/orders',
    label: 'Orders',
    icon: ShoppingCart,
  },
  {
    href: '/dashboard/products',
    label: 'Products',
    icon: Package,
  },
  {
    href: '/dashboard/product-details',
    label: 'Product Details',
    icon: Info,
  },
  {
    href: '/dashboard/navigation',
    label: 'Navigation',
    icon: LayoutGrid,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Topbar for mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-gray-800 flex justify-between items-center p-4">
        <h1 className="text-lg font-bold">KHUMAR Admin</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Background overlay when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 z-50 h-full w-64 bg-black text-white flex flex-col border-r border-gray-800 md:hidden"
          >
            <div className="p-6 border-b border-gray-800">
              <h1 className="text-2xl font-bold tracking-wide">
                KHUMAR <span className="font-light text-gray-400">Admin Panel</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1">Version 2.4.0</p>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              {links.map(({ href, label, icon: Icon, exact }) => (
                <motion.div key={href} whileHover={{ x: 3 }}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)} // Close menu on click
                    className={cn(
                      'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      isActive(href, exact)
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        isActive(href, exact) ? 'text-black' : 'text-gray-400'
                      )}
                    />
                    <span className="ml-3">{label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 min-h-screen bg-black text-white flex-col border-r border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-wide">
            KHUMAR <span className="font-light text-gray-400">Admin Panel</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Version 2.4.0</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon, exact }) => (
            <motion.div key={href} whileHover={{ x: 3 }}>
              <Link
                href={href}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive(href, exact)
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    isActive(href, exact) ? 'text-black' : 'text-gray-400'
                  )}
                />
                <span className="ml-3">{label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>
      </aside>
    </>
  );
}
