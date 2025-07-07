'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

interface OrderItem {
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  status: string;
  total: string;
  createdAt: string;
  itemCount: number;
  items: OrderItem[];
}

const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        const sorted = data.sort((a: Order, b: Order) => a.id - b.id);
        setOrders(sorted);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert('Status update failed');
    }
  };

  const deleteOrder = async (orderId: number) => {
    const confirm = window.confirm('Are you sure you want to delete this order?');
    if (!confirm) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!res.ok) throw new Error('Failed to delete order');

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete order');
    }
  };

  return (
    <div className="px-4 sm:px-6 py-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        📦 Orders Dashboard
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-xl">
            <table className="min-w-[1100px] w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 border-b text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{order.userName}</p>
                      <p className="text-xs text-gray-500">{order.userEmail}</p>
                    </td>
                    <td className="px-4 py-4 text-sm">{order.userPhone}</td>
                    <td className="px-4 py-4 text-sm">{order.userAddress}</td>
                    <td className="px-4 py-4 text-sm">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 text-sm rounded border font-semibold cursor-pointer transition
                          ${
                            order.status === 'Processing'
                              ? 'text-yellow-700 bg-yellow-100 border-yellow-300'
                              : order.status === 'Shipped'
                              ? 'text-blue-700 bg-blue-100 border-blue-300'
                              : order.status === 'Delivered'
                              ? 'text-green-700 bg-green-100 border-green-300'
                              : order.status === 'Cancelled'
                              ? 'text-red-700 bg-red-100 border-red-300'
                              : 'text-gray-700 bg-gray-100 border-gray-300'
                          }
                        `}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 font-semibold">PKR {order.total}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              width={40}
                              height={40}
                              className="rounded border"
                            />
                            <div>
                              <p className="font-medium text-xs">{item.productName}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity} · PKR {item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => deleteOrder(order.id)}
                        title="Delete Order"
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">Order #{order.id}</h3>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-sm">
                  <strong>Customer:</strong> {order.userName}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {order.userEmail}
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> {order.userPhone}
                </p>
                <p className="text-sm mb-2">
                  <strong>Address:</strong> {order.userAddress}
                </p>
                <p className="text-sm mb-2">
                  <strong>Total:</strong> PKR {order.total}
                </p>
                <div className="mb-3">
                  <label className="text-sm font-medium block mb-1">Status:</label>
                  <select
  value={order.status}
  onChange={(e) => updateStatus(order.id, e.target.value)}
  className={`w-full text-sm border rounded px-2 py-1 font-semibold transition
    ${
      order.status === 'Processing'
        ? 'text-yellow-700 bg-yellow-100 border-yellow-300'
        : order.status === 'Shipped'
        ? 'text-blue-700 bg-blue-100 border-blue-300'
        : order.status === 'Delivered'
        ? 'text-green-700 bg-green-100 border-green-300'
        : order.status === 'Cancelled'
        ? 'text-red-700 bg-red-100 border-red-300'
        : 'text-gray-700 bg-gray-100 border-gray-300'
    }
  `}
>
  {statusOptions.map((status) => (
    <option key={status} value={status}>
      {status}
    </option>
  ))}
</select>

                </div>
                <div>
                  <p className="font-medium mb-2">Items:</p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={40}
                          height={40}
                          className="rounded border"
                        />
                        <div>
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} · PKR {item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
