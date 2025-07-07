'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const cart = useSelector((state: RootState) => state.cart);
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.items.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const formattedItems = cart.items.map((item) => ({
      product_id: Number(item.id),
      quantity: item.quantity,
    }));

    const orderPayload = {
      items: formattedItems,
      total,
      name,
      email,
      phone,
      address,
    };

    try {
      setLoading(true);

      if (paymentMethod === 'card') {
        const stripeRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        });

        const stripeData = await stripeRes.json();

        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });

        if (stripeData?.url) {
          window.location.href = stripeData.url;
        } else {
          alert('Stripe redirect failed.');
        }
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) throw new Error('Order creation failed');
        router.push('/success');
      }
    } catch (error) {
      alert('Failed to place order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-20 px-4 md:px-10 lg:px-24 overflow-y-auto">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Billing Form */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Checkout</h2>
          <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border px-3 py-2 rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border px-3 py-2 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              className="w-full border px-3 py-2 rounded-md"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <textarea
              placeholder="Shipping Address"
              className="w-full border px-3 py-2 rounded-md"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <div className="pt-2">
              <p className="font-medium text-gray-800 mb-2">Payment Method</p>
              <div className="flex flex-col gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-black"
                  />
                  Cash on Delivery
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-black"
                  />
                  Credit/Debit Card (via Stripe)
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md text-sm font-medium mt-4 hover:bg-gray-800 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : paymentMethod === 'card'
                ? 'Proceed to Stripe'
                : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white p-6 md:p-10 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-800">Order Summary</h3>
          {cart.items.length === 0 ? (
            <p className="text-gray-500 text-sm">Your cart is empty.</p>
          ) : (
            <div className="space-y-5">
              {cart.items.map((item, i) => (
                <div key={i} className="flex items-start gap-4 text-sm">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                    {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                    <p className="mt-1 font-medium">PKR {item.price} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    PKR {item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>PKR {total}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Inclusive of taxes & free shipping</p>
          </div>
        </div>
      </div>
    </div>
  );
}
