'use client';

import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-black text-4xl md:text-5xl font-bold tracking-wider mb-6"
      >
        KHUMAR
      </motion.h1>

      <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
