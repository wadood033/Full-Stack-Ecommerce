'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount: number;
  image: string;
  category_id: number;
  original_price?: number | null;
}

interface Category {
  id: number;
  name: string;
  parent_category?: string | null;
}

interface ProductForm {
  name: string;
  price: string;
  discount: string;
  image: string;
  category_id: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>({
    name: '',
    price: '',
    discount: '',
    image: '',
    category_id: '',
  });

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data: Product[] = await res.json();
      const parsed = data.map((p) => ({
        ...p,
        price: Number(p.price),
        discount: Number(p.discount ?? 0),
      }));
      setProducts(parsed);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const price = parseFloat(form.price);
      const discount = parseFloat(form.discount || '0');
      const discountedPrice =
        discount > 0 ? price - (price * discount) / 100 : price;

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          image: form.image,
          price: discountedPrice,
          original_price: discount > 0 ? price : null,
          discount,
          category_id: parseInt(form.category_id),
        }),
      });

      if (!res.ok) throw new Error('Failed to create product');

      await fetchProducts();
      setForm({
        name: '',
        price: '',
        discount: '',
        image: '',
        category_id: '',
      });
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>

      {/* Form Card */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="space-y-4 pt-6">
          <Input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="price"
              placeholder="Price (PKR)"
              type="number"
              value={form.price}
              onChange={handleChange}
            />
            <Input
              name="discount"
              placeholder="Discount (%)"
              type="number"
              value={form.discount}
              onChange={handleChange}
            />
          </div>
          <Input
            name="image"
            placeholder="Image URL (e.g. /img1.jpg)"
            value={form.image}
            onChange={handleChange}
          />
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="border p-2 rounded w-full bg-white text-sm"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.parent_category
                  ? `${cat.parent_category} / ${cat.name}`
                  : cat.name}
              </option>
            ))}
          </select>

          <Button onClick={handleSubmit} className="w-full">
            Create Product
          </Button>
        </CardContent>
      </Card>

      {/* Product Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden hover:shadow-md transition-shadow duration-300 w-full max-w-[230px] mx-auto"
          >
            <div className="relative aspect-[4/5] bg-gray-50">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardContent className="p-3 space-y-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">{product.slug}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-bold text-black">
                    Rs. {product.price.toFixed(0)}
                  </span>
                  {product.discount > 0 && (
                    <span className="ml-1 text-[10px] text-red-500">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      router.push(`/dashboard/products/${product.id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}