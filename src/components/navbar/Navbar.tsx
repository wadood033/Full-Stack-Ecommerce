'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCartSimple } from '@phosphor-icons/react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCartMenu } from '@/redux/cartSlice';
import type { RootState } from '@/redux/store';
import CartMenu from '@/components/cart/CartMenu';

interface NavItem {
  id: number;
  title: string;
  slug: string;
  parent_id: number | null;
  position: number;
  children?: NavItem[];
}

export default function Navbar() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const pathname = usePathname();
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await fetch('/api/navigation');
        const data = await res.json();
        setNavItems(buildTree(data));
      } catch (err) {
        console.error('Failed to load navigation', err);
      }
    };
    
    if (!pathname.startsWith('/dashboard')) {
      fetchNav();
    }
  }, [pathname]);

  const buildTree = (items: NavItem[]): NavItem[] => {
    const map: Record<number, NavItem> = {};
    const tree: NavItem[] = [];

    items.forEach(item => (map[item.id] = { ...item, children: [] }));
    items.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children!.push(map[item.id]);
      } else {
        tree.push(map[item.id]);
      }
    });

    return tree.sort((a, b) => a.position - b.position);
  };

  const toggleSubmenu = (id: number) => {
    setActiveSubmenu(prev => (prev === id ? null : id));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setActiveSubmenu(null);
  };

  const renderMobileMenu = (items: NavItem[]) => (
    <nav className="text-black bg-white divide-y divide-gray-200">
      {items.map(item => (
        <div key={item.id}>
          <div className="flex justify-between items-center px-6 py-4">
            <Link
              href={item.slug}
              onClick={e => {
                if (item.children?.length) {
                  e.preventDefault();
                  toggleSubmenu(item.id);
                } else {
                  closeMobileMenu();
                }
              }}
              className={`text-base font-bold w-full transition-colors duration-300 ${
                item.title.toLowerCase().includes('sale') ? 'text-red-600' : ''
              }`}
            >
              {item.title.toUpperCase()}
            </Link>
            {item.children && (
              <button onClick={() => toggleSubmenu(item.id)} className="ml-2">
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    activeSubmenu === item.id ? 'rotate-180 text-blue-400' : 'text-gray-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          {item.children && (
            <div
              className={`overflow-hidden transition-all duration-300 ${
                activeSubmenu === item.id ? 'max-h-80' : 'max-h-0'
              }`}
            >
              {item.children.map(child => (
                <Link
                  key={child.id}
                  href={child.slug}
                  className="block px-10 py-3 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  const renderDesktopMenu = (items: NavItem[]) => (
    <>
      {items.map(item => (
        <div key={item.id} className="relative group">
          <Link
            href={item.slug}
            className="px-4 py-2 font-medium text-gray-800 hover:text-black transition duration-200"
          >
            {item.title}
          </Link>

          {item.children && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible scale-95 group-hover:scale-100 transition-all duration-300 z-50">
              {item.children.map(child => (
                <Link
                  key={child.id}
                  href={child.slug}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );

  if (pathname.startsWith('/dashboard')) return null;

  return (
    <header className="fixed top-0 z-50 w-full bg-white/20 backdrop-blur-lg transition duration-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-gray-900 hover:text-black"
            onClick={closeMobileMenu}
          >
            Khumaar
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {renderDesktopMenu(navItems)}
          </nav>

          {/* Cart Icon */}
          <button
            onClick={() => dispatch(toggleCartMenu())}
            className="relative p-2 text-gray-900 hover:text-black"
            aria-label="Toggle Cart"
          >
            <ShoppingCartSimple className="w-7 h-7" weight="fill" />
            {cart.items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cart.items.length}
              </span>
            )}
          </button>

          {/* Hamburger Icon for Mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-900 hover:text-black"
            aria-label="Open Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      <div
        className={`fixed inset-0 z-40 transition duration-300 ${
          mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-end items-center px-6 py-4 border-b border-gray-200">
            <button
              onClick={closeMobileMenu}
              className="text-gray-700 hover:text-black"
              aria-label="Close Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto">{renderMobileMenu(navItems)}</div>
        </div>
      </div>

      {/* Cart Slide Menu */}
      <CartMenu />
    </header>
  );
}