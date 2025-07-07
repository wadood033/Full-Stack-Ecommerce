'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  toggleCartMenu,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
} from '@/redux/cartSlice';
import type { RootState } from '@/redux/store';
import { Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartMenu() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isOpen, items } = useSelector((state: RootState) => state.cart);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const goToCheckout = () => {
    dispatch(toggleCartMenu());
    router.push('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-[99] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch(toggleCartMenu())}
      />

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-white z-[100] shadow-xl transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button
            className="text-gray-600 hover:text-black"
            onClick={() => dispatch(toggleCartMenu())}
            aria-label="Close Cart"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto max-h-[calc(100vh-9.5rem)] p-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          ) : (
            <ul className="space-y-6">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    {item.size && (
                      <p className="text-xs text-gray-500">Size: {item.size}</p>
                    )}
                    {item.color && (
                      <p className="text-xs text-gray-500">Color: {item.color}</p>
                    )}
                    <p className="text-sm text-gray-800 font-medium mt-1">
                      PKR {item.price} × {item.quantity} ={' '}
                      <span className="font-bold">
                        PKR {item.price * item.quantity}
                      </span>
                    </p>
                    <div className="flex items-center mt-2 gap-2">
                      <button
                        onClick={() =>
                          dispatch(
                            decrementQuantity({
                              id: item.id,
                              size: item.size,
                              color: item.color,
                            })
                          )
                        }
                        className="p-1 border rounded text-gray-600 hover:text-black"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(
                            incrementQuantity({
                              id: item.id,
                              size: item.size,
                              color: item.color,
                            })
                          )
                        }
                        className="p-1 border rounded text-gray-600 hover:text-black"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      dispatch(
                        removeFromCart({
                          id: item.id,
                          size: item.size,
                          color: item.color,
                        })
                      )
                    }
                    className="text-gray-500 hover:text-red-600 mt-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Subtotal & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>PKR {total}</span>
            </div>
            <button
              className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
              onClick={goToCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
