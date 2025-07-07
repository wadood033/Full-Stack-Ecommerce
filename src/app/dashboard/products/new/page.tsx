'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Category {
  id: number;
  name: string;
  parent_category?: string | null;
}

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    price: '',
    discount: '',
    image: '',
    category_id: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState('');

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        discount: parseFloat(form.discount || '0'),
        category_id: parseInt(form.category_id),
      }),
    });

    if (res.ok) {
      setMessage('✅ Product created successfully!');
      setForm({
        name: '',
        slug: '',
        price: '',
        discount: '',
        image: '',
        category_id: '',
      });
    } else {
      setMessage('❌ Failed to create product');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold text-gray-900">Add New Product</h2>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            name="slug"
            placeholder="Slug (e.g. denim-jacket)"
            value={form.slug}
            onChange={handleChange}
          />
          <Input
            name="price"
            placeholder="Price (PKR)"
            type="number"
            value={form.price}
            onChange={handleChange}
            step="0.01"
          />
          <Input
            name="discount"
            placeholder="Discount (%)"
            type="number"
            value={form.discount}
            onChange={handleChange}
            step="0.01"
          />
          <Input
            name="image"
            placeholder="Image Path (e.g. /img1.jpg)"
            value={form.image}
            onChange={handleChange}
          />

          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.parent_category
                  ? `${cat.parent_category} / ${cat.name}`
                  : cat.name}
              </option>
            ))}
          </select>

          <Button onClick={handleSubmit}>Create Product</Button>
          {message && <p className="text-sm mt-2 text-green-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
