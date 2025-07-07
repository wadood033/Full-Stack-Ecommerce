'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export function Topbar() {
  const pathname = usePathname();

  const title = useMemo(() => {
    if (!pathname) return 'Loading...';

    if (pathname.includes('/products')) return 'Manage Products';
    if (pathname.includes('/navigation')) return 'Navigation Settings';
    if (pathname.includes('/orders')) return 'Order Overview';
    if (pathname.includes('/product-details')) return 'Product Details';
    return 'Dashboard';
  }, [pathname]);

  return (
    <header className="w-full h-16 flex items-center px-6 bg-black text-white border-b border-white/10 shadow-sm">
      <h1 className="text-lg sm:text-xl font-semibold tracking-wide">
        {title}
      </h1>
    </header>
  );
}
