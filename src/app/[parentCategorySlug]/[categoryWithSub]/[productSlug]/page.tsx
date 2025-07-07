"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/getproducts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
  parent_category_slug: string;
  image: string;
  description: string;
  price: string;
  discount_price?: string;
  discount_percentage?: string;
  fit?: string;
  colors?: string[];
  sizes?: string[];
  gender?: string;
  full_description?: string;
  material?: string;
  care_instructions?: string;
  model_info?: string;
  rating?: number;
  gallery?: string[];
  length?: string;
  quantity?: number;
}

export default function ProductDetailPage() {
  const { parentCategorySlug, categoryWithSub, productSlug } = useParams() as {
    parentCategorySlug: string;
    categoryWithSub: string;
    productSlug: string;
  };

  const dispatch = useDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const all = await getProducts();
        const basic = all.find(
          (p: Product) =>
            p.slug === productSlug &&
            p.category_slug === categoryWithSub &&
            p.parent_category_slug === parentCategorySlug
        );

        if (!basic) {
          setProduct(null);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/product-details/${basic.id}`
        );
        const details = res.ok ? await res.json() : {};

        const parsedRating =
          typeof details.rating === "string"
            ? parseFloat(details.rating)
            : details.rating;

        const fullProduct: Product = {
          ...basic,
          ...details,
          rating:
            typeof parsedRating === "number" && !isNaN(parsedRating)
              ? parsedRating
              : undefined,
          colors: Array.isArray(details.colors) ? details.colors : [],
          sizes: Array.isArray(details.sizes) ? details.sizes : [],
          gallery: Array.isArray(details.gallery) ? details.gallery : [],
          quantity: typeof details.quantity === "number" ? details.quantity : 0,
        };

        setProduct(fullProduct);
        setMainImage(fullProduct.gallery?.[0] || fullProduct.image);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [parentCategorySlug, categoryWithSub, productSlug]);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color before adding to cart.");
      return;
    }

    if (!product || product.quantity === 0) {
      alert("Product is out of stock.");
      return;
    }

    try {
      setIsAdding(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/product-details/${product.id}/reduce-stock`,
        { method: "POST" }
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Stock update failed.");
        return;
      }

      const result = await res.json();

      dispatch(
        addToCart({
          id: product.id,
          name: product.name,
          image: product.image,
          price: Number(product.discount_price || product.price),
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
        })
      );

      setProduct((prev) =>
        prev ? { ...prev, quantity: result.quantity } : prev
      );
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Something went wrong.");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <div className="p-6 text-sm">Loading...</div>;
  if (!product) return <div className="p-6 text-sm text-red-500">Product not found.</div>;

  return (
    <div className="pt-16 px-2 max-w-7xl mx-auto h-screen overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start text-sm">
        {/* Product Images */}
        <div className="flex gap-4">
          {Array.isArray(product.gallery) && product.gallery.length > 0 && (
            <div className="flex flex-col gap-2">
              {product.gallery.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setMainImage(img)}
                  className="w-28 h-20 rounded overflow-hidden cursor-pointer transition-opacity duration-200 hover:opacity-80"
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${i}`}
                    className="object-contain w-full h-full"
                    width={112}
                    height={80}
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="w-[580px] lg:w-[920px] aspect-[3/4] overflow-hidden rounded-lg">
            <Image
              src={mainImage || product.image}
              alt={product.name}
              className="object-contain w-full h-full transition-opacity duration-300"
              width={920}
              height={1226}
              priority
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <p className="text-gray-500 text-xs">FPT/SPLENDER-SOBBYSS</p>
          </div>

          {/* Price + Rating */}
          <div className="space-y-1.5">
            {product.discount_price ? (
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold">
                  PKR {Number(product.discount_price).toLocaleString()}
                </span>
                <span className="text-base line-through text-gray-500">
                  PKR {Number(product.price).toLocaleString()}
                </span>
                <Badge variant="destructive" className="px-2 py-0.5 text-xs">
                  -{product.discount_percentage || "51"}%
                </Badge>
              </div>
            ) : (
              <span className="text-xl font-bold">
                PKR {Number(product.price).toLocaleString()}
              </span>
            )}

            {typeof product.rating === "number" && !isNaN(product.rating) && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500 text-xl font-bold">★</span>
                <span className="text-gray-800 text-sm font-medium">
                  {product.rating.toFixed(1)} / 5
                </span>
              </div>
            )}

            <div className="mt-1 text-xs font-medium">
              {product.quantity === 0 ? (
                <span className="text-red-600">Out of Stock</span>
              ) : (
                <span className="text-green-600">
                  Only {product.quantity} left in stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className="text-gray-700">
              {product.full_description || product.description}
            </p>
            {product.model_info && (
              <p className="text-xs text-gray-500">Model Details: {product.model_info}</p>
            )}
          </div>

          {/* Fit */}
          {product.fit && (
            <div>
              <h3 className="font-medium">FIT</h3>
              <p className="text-gray-700">{product.fit}</p>
            </div>
          )}

          {/* Colors */}
          {Array.isArray(product.colors) && product.colors.length > 0 && (
            <div>
              <h3 className="font-medium">COLORS</h3>
              <div className="flex gap-2 mt-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition duration-200 ${
                      selectedColor === color
                        ? "border-black scale-105"
                        : "border-gray-300 hover:opacity-80"
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div>
              <h3 className="font-medium">SIZE</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 border rounded text-sm transition ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gender */}
          {product.gender && (
            <div>
              <h3 className="font-medium">GENDER</h3>
              <p className="text-gray-700">{product.gender}</p>
            </div>
          )}

          <Button
            onClick={handleAddToCart}
            className="w-full py-5 rounded-none bg-black hover:bg-gray-800 text-base"
            disabled={product.quantity === 0 || isAdding}
          >
            {product.quantity === 0 ? "Out of Stock" : isAdding ? "Adding..." : "Add To Bag"}
          </Button>

          {/* Accordion */}
          <Accordion type="single" collapsible className="w-full transition-all duration-300 ease-in-out">
            <AccordionItem value="product-details">
              <AccordionTrigger className="text-base font-medium">
                PRODUCT DETAILS & COMPOSITION
              </AccordionTrigger>
              <AccordionContent
                className="text-sm text-gray-700 space-y-1 overflow-hidden transition-all duration-500 ease-in-out"
                style={{ willChange: 'max-height' }}
              >
                {product.material && <p><strong>Material:</strong> {product.material}</p>}
                {product.length && <p><strong>Length:</strong> {product.length}</p>}
                {product.fit && <p><strong>Fit:</strong> {product.fit}</p>}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="care-instructions">
              <AccordionTrigger className="text-base font-medium">
                CARE INSTRUCTIONS
              </AccordionTrigger>
              <AccordionContent
                className="text-sm text-gray-700 overflow-hidden transition-all duration-500 ease-in-out"
                style={{ willChange: 'max-height' }}
              >
                {product.care_instructions || "Machine wash cold. Do not bleach."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}