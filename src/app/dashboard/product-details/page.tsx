"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number | null;
}

interface ProductDetails {
  product_id: number | string;
  gallery: string[];
  rating: number | string;
  full_description: string;
  care_instructions: string;
  material: string;
  fit: string;
  length: string;
  colors: string[];
  sizes: string[];
  gender: string;
  model_info: string;
  price?: number;
  original_price?: number | null;
  discount_percentage?: number;
  quantity: number;
}

export default function ProductDetailsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductDetails>({
    product_id: 0,
    gallery: ["", "", "", ""],
    rating: 0,
    full_description: "",
    care_instructions: "",
    material: "",
    fit: "",
    length: "",
    colors: [""],
    sizes: [""],
    gender: "",
    model_info: "",
    price: 0,
    original_price: null,
    discount_percentage: 0,
    quantity: 0,
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const handleProductSelect = async (productId: number) => {
    const res = await fetch(`/api/product-details/${productId}`);
    const product = products.find((p) => p.id === productId);

    if (res.ok) {
      const data = await res.json();
      const discount =
        product?.original_price && product.original_price > product.price
          ? Math.round(
              ((product.original_price - product.price) /
                product.original_price) *
                100
            )
          : 0;

      setForm({
        ...data,
        product_id: productId,
        price: product?.price,
        original_price: product?.original_price || null,
        discount_percentage: discount,
        gallery: data.gallery || ["", "", "", ""],
        colors: data.colors || [""],
        sizes: data.sizes || [""],
        quantity: data.quantity || 0,
      });
      setIsEditing(true);
    } else {
      setForm({
        product_id: productId,
        gallery: ["", "", "", ""],
        rating: 0,
        full_description: "",
        care_instructions: "",
        material: "",
        fit: "",
        length: "",
        colors: [""],
        sizes: [""],
        gender: "",
        model_info: "",
        price: product?.price,
        original_price: product?.original_price || null,
        discount_percentage: 0,
        quantity: 0,
      });
      setIsEditing(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "product_id") {
      handleProductSelect(Number(value));
      return;
    }
    setForm((prev) => ({ 
      ...prev, 
      [name]: name === "quantity" || name === "rating" 
        ? Number(value) 
        : value 
    }));
  };

  const handleGalleryChange = (index: number, value: string) => {
    const updated = [...form.gallery];
    updated[index] = value;
    setForm({ ...form, gallery: updated });
  };

  const handleColorChange = (index: number, value: string) => {
    const updated = [...form.colors];
    updated[index] = value;
    setForm({ ...form, colors: updated });
  };

  const addColor = () => setForm({ ...form, colors: [...form.colors, ""] });
  const removeColor = (index: number) =>
    setForm({ ...form, colors: form.colors.filter((_, i) => i !== index) });

  const handleSizeChange = (index: number, value: string) => {
    const updated = [...form.sizes];
    updated[index] = value;
    setForm({ ...form, sizes: updated });
  };

  const addSize = () => setForm({ ...form, sizes: [...form.sizes, ""] });
  const removeSize = (index: number) =>
    setForm({ ...form, sizes: form.sizes.filter((_, i) => i !== index) });

  const handleSubmit = async () => {
    const method = isEditing ? "PUT" : "POST";
    const res = await fetch(
      `/api/product-details${isEditing ? `/${form.product_id}` : ""}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: Number(form.rating),
          product_id: Number(form.product_id),
        }),
      }
    );

    if (!res.ok) {
      alert("Failed to save details");
    } else {
      alert(`Product details ${isEditing ? "updated" : "created"} successfully`);
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    const confirmDelete = confirm("Are you sure you want to delete this product detail?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/product-details/${form.product_id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Product details deleted successfully");
      setForm({
        product_id: 0,
        gallery: ["", "", "", ""],
        rating: 0,
        full_description: "",
        care_instructions: "",
        material: "",
        fit: "",
        length: "",
        colors: [""],
        sizes: [""],
        gender: "",
        model_info: "",
        price: 0,
        original_price: null,
        discount_percentage: 0,
        quantity: 0,
      });
      setIsEditing(false);
    } else {
      alert("Failed to delete details");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Add / Edit Product Details</h2>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <select
            name="product_id"
            value={form.product_id}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="0">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="original_price"
              placeholder="Original Price"
              type="number"
              value={form.original_price?.toString() || ""}
              disabled
            />
            <Input
              name="price"
              placeholder="Discounted Price"
              type="number"
              value={form.price?.toString() || ""}
              disabled
            />
            <Input
              name="discount_percentage"
              placeholder="Discount %"
              type="number"
              value={form.discount_percentage?.toString() || "0"}
              disabled
            />
            <Input
              name="quantity"
              placeholder="Quantity In Stock"
              type="number"
              min={0}
              value={form.quantity}
              onChange={handleChange}
            />
          </div>

          {/* Gallery */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Gallery Images</label>
            {form.gallery.map((img, index) => (
              <Input
                key={index}
                placeholder={`Gallery Image ${index + 1} URL`}
                value={img}
                onChange={(e) => handleGalleryChange(index, e.target.value)}
              />
            ))}
          </div>

          <Input
            name="rating"
            placeholder="Rating (e.g. 4.5)"
            type="number"
            step="0.1"
            value={form.rating}
            onChange={handleChange}
          />

          <Textarea
            name="full_description"
            placeholder="Full Product Description"
            value={form.full_description}
            onChange={handleChange}
            rows={4}
          />

          <Input
            name="fit"
            placeholder="Fit (e.g. Regular Fit)"
            value={form.fit}
            onChange={handleChange}
          />

          <Input
            name="gender"
            placeholder="Gender (e.g. Men, Women, Unisex)"
            value={form.gender}
            onChange={handleChange}
          />

          {/* Colors */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Colors</label>
              <Button type="button" size="sm" onClick={addColor}>Add Color</Button>
            </div>
            {form.colors.map((color, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Color ${index + 1}`}
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                />
                {form.colors.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeColor(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Sizes</label>
              <Button type="button" size="sm" onClick={addSize}>Add Size</Button>
            </div>
            {form.sizes.map((size, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Size ${index + 1}`}
                  value={size}
                  onChange={(e) => handleSizeChange(index, e.target.value)}
                />
                {form.sizes.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSize(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Accordions */}
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="product-details">
              <AccordionTrigger>Product Details & Composition</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <Input
                  name="material"
                  placeholder="Material (e.g. Cotton Blend)"
                  value={form.material}
                  onChange={handleChange}
                />
                <Input
                  name="length"
                  placeholder="Length (e.g. Long)"
                  value={form.length}
                  onChange={handleChange}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="care-instructions">
              <AccordionTrigger>Care Instructions</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  name="care_instructions"
                  placeholder="Care Instructions"
                  value={form.care_instructions}
                  onChange={handleChange}
                  rows={4}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {isEditing ? "Update Details" : "Save Details"}
            </Button>
            {isEditing && (
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}