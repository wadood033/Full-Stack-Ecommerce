'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  discount: number | string;
  image: string;
  category_id: number | string;
}

interface Category {
  id: number;
  name: string;
  parent_category?: string | null;
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/categories'),
        ]);

        if (!productRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [productData, categoriesData] = await Promise.all([
          productRes.json(),
          categoriesRes.json(),
        ]);

        setProduct({
          ...productData,
          price: parseFloat(productData.price),
          discount: parseFloat(productData.discount ?? 0),
        });
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('❌ Failed to load product data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!product) return;
    setProduct({ 
      ...product, 
      [e.target.name]: e.target.value 
    });
  };

  const handleUpdate = async () => {
    if (!product) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          slug: product.slug,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          discount: typeof product.discount === 'string' ? parseFloat(product.discount) : product.discount,
          image: product.image,
          category_id: typeof product.category_id === 'string' ? parseInt(product.category_id) : product.category_id,
        }),
      });

      if (!res.ok) throw new Error('Failed to update product');

      setMessage('✅ Product updated successfully!');
      setTimeout(() => router.push('/dashboard/products'), 1500);
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage('❌ Failed to update product');
    }
  };

  if (isLoading) return <p className="p-4 text-gray-600">Loading...</p>;
  if (!product) return <p className="p-4 text-red-600">Product not found</p>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold text-gray-900">Edit Product</h2>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input
            name="name"
            placeholder="Product Name"
            value={product.name}
            onChange={handleChange}
          />
          <Input
            name="slug"
            placeholder="Slug"
            value={product.slug}
            onChange={handleChange}
          />
          <Input
            name="price"
            placeholder="Price (PKR)"
            type="number"
            step="0.01"
            value={product.price}
            onChange={handleChange}
          />
          <Input
            name="discount"
            placeholder="Discount (%)"
            type="number"
            step="0.01"
            value={product.discount}
            onChange={handleChange}
          />
          <Input
            name="image"
            placeholder="Image Path (e.g. /img1.jpg)"
            value={product.image}
            onChange={handleChange}
          />

          <select
            name="category_id"
            value={product.category_id}
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

          <div className="flex gap-2">
            <Button onClick={handleUpdate}>Update Product</Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/products')}
            >
              Cancel
            </Button>
          </div>

          {message && (
            <p
              className={`text-sm mt-2 ${
                message.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}