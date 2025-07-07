'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/cartSlice';

export default function SuccessPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <CheckCircle className="text-green-600 w-20 h-20 mb-6" />
      <h1 className="text-3xl font-bold text-black mb-2">Payment Successful</h1>
      <p className="text-base text-gray-700 mb-12 max-w-md">
        Thank you for your purchase. Your order has been placed successfully.
      </p>

<Link href="/" passHref>
  <div className="group relative inline-block border-2 border-black rounded-2xl overflow-hidden">
    <span className="absolute inset-0 bg-black transition-all duration-300 ease-in-out group-hover:bg-white"></span>
    <span className="relative z-10 inline-block px-4 py-3 text-md font-semibold text-white transition-colors duration-300 ease-in-out group-hover:text-black">
      Continue Shopping →
    </span>
  </div>
</Link>



    </div>
  );
}
