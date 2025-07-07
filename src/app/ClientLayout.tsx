'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { SignedIn, UserButton } from '@clerk/nextjs';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/Footer'; // ✅ Footer imported here
import Loader from '@/components/Loader';
import { AnimatePresence, motion } from 'framer-motion';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  const [showLoader, setShowLoader] = useState(true);
  const [canRenderContent, setCanRenderContent] = useState(false);

  useEffect(() => {
    setShowLoader(true);
    setCanRenderContent(false);

    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Loader */}
      <AnimatePresence mode="wait" onExitComplete={() => setCanRenderContent(true)}>
        {showLoader && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[9999] bg-white dark:bg-black flex items-center justify-center"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      {canRenderContent && (
        <>
          <div className="min-h-screen flex flex-col">
            {/* Dashboard Header */}
            {isDashboard && (
              <header className="flex justify-end items-center py-5 px-10">
                <div className="w-10 h-10 flex items-center justify-center -mt-3">
                  <Suspense
                    fallback={
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    }
                  >
                    <SignedIn>
                      <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                  </Suspense>
                </div>
              </header>
            )}

            {/* Navbar */}
            {!isDashboard && <Navbar />}

            {/* Main Content */}
            <main className="flex-grow">{children}</main>
          </div>

          {/* Footer - Cleanly placed after layout */}
          {!isDashboard && <Footer />}
        </>
      )}
    </>
  );
}
