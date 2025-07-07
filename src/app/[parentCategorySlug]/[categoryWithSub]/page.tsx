'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/getproducts";
import { Button } from "@/components/ui/button";
import { Filter, Grid2x2, Grid3x3, X } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
  parent_category_slug: string;
  image: string;
  price: string;
  original_price?: string;
  is_on_sale?: boolean;
  sale_percentage?: number;
}

type SortOption = 
  | "featured" 
  | "price-low" 
  | "price-high" 
  | "name-asc" 
  | "name-desc" 
  | "sale"
  | "newest";

export default function CategoryPage() {
  const params = useParams();
  const parentCategorySlug = params.parentCategorySlug as string;
  const categoryWithSub = params.categoryWithSub as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridView, setGridView] = useState<"2x2" | "3x3">("3x3");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [filters, setFilters] = useState({
    onSale: false,
    sortBy: "featured" as SortOption,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const allProducts = await getProducts();
        
        if (!Array.isArray(allProducts)) {
          throw new Error("Invalid products data");
        }

        const filtered = allProducts.filter(
          (p: Product) =>
            p.category_slug === categoryWithSub &&
            p.parent_category_slug === parentCategorySlug
        );

        const productsWithSale = filtered.map(product => {
          if (product.original_price && 
              parseFloat(product.original_price) > parseFloat(product.price)) {
            const original = parseFloat(product.original_price);
            const sale = parseFloat(product.price);
            const percentage = Math.round(((original - sale) / original) * 100);
            return {
              ...product,
              is_on_sale: true,
              sale_percentage: percentage,
            };
          }
          return product;
        });

        setProducts(productsWithSale);
        setFilteredProducts(productsWithSale);
        
        if (productsWithSale.length > 0) {
          const prices = productsWithSale.map(p => parseFloat(p.price));
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setPriceRange([min, max]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [categoryWithSub, parentCategorySlug]);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    if (filters.onSale) {
      result = result.filter(p => p.is_on_sale);
    }

    result = result.filter(
      p => parseFloat(p.price) >= priceRange[0] && parseFloat(p.price) <= priceRange[1]
    );

    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-high":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "sale":
        result.sort((a, b) => (b.sale_percentage || 0) - (a.sale_percentage || 0));
        break;
      case "newest":
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [filters, priceRange, products]);

  const handlePriceChange = (index: 0 | 1, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    const newPriceRange = [...priceRange] as [number, number];
    newPriceRange[index] = isNaN(numValue) ? 0 : numValue;
    setPriceRange(newPriceRange);
  };

  const resetFilters = () => {
    setFilters({
      onSale: false,
      sortBy: "featured",
    });
    const prices = products.map(p => parseFloat(p.price));
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    setPriceRange([min, max]);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto relative">
      {/* Filter Sidebar */}
      {mounted && (
        <>
          <div className={`fixed inset-y-0 right-0 w-80 bg-white z-50 shadow-xl transition-all duration-300 ease-in-out ${showFilters ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetFilters}
                    className="text-sm text-gray-500 hover:text-black"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setShowFilters(false)} 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-medium mb-3">Sort By</h3>
                  <div className="space-y-2">
                    {[
                      { value: "featured", label: "Featured" },
                      { value: "newest", label: "Newest" },
                      { value: "price-low", label: "Price: Low to High" },
                      { value: "price-high", label: "Price: High to Low" },
                      { value: "name-asc", label: "Name: A to Z" },
                      { value: "name-desc", label: "Name: Z to A" },
                      { value: "sale", label: "Best Discount" },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={option.value}
                          name="sortBy"
                          value={option.value}
                          checked={filters.sortBy === option.value}
                          onChange={() => setFilters({...filters, sortBy: option.value as SortOption})}
                          className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                        />
                        <label htmlFor={option.value} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rs.</span>
                      <input
                        type="number"
                        value={priceRange[0] === 0 ? '' : priceRange[0]}
                        onChange={(e) => handlePriceChange(0, e.target.value)}
                        className="w-full border rounded pl-10 px-3 py-2 text-sm"
                        placeholder="Min"
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rs.</span>
                      <input
                        type="number"
                        value={priceRange[1] === 0 ? '' : priceRange[1]}
                        onChange={(e) => handlePriceChange(1, e.target.value)}
                        className="w-full border rounded pl-10 px-3 py-2 text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Availability</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sale"
                      checked={filters.onSale}
                      onChange={(e) => setFilters({...filters, onSale: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label htmlFor="sale" className="text-sm">
                      On Sale Only
                    </label>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-black hover:bg-gray-800 transition-colors"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${showFilters ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setShowFilters(false)}
          />
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 mt-10">
        <h1 className="text-2xl md:text-3xl font-bold capitalize text-black text-center mt-10">
          {categoryWithSub.replace(/-/g, " ")}
        </h1>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden lg:flex gap-1 p-1 bg-gray-100 rounded-md">
            <button
              onClick={() => setGridView("2x2")}
              className={`p-2 rounded transition-colors ${gridView === "2x2" ? "bg-gray-300" : "hover:bg-gray-200"}`}
            >
              <Grid2x2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setGridView("3x3")}
              className={`p-2 rounded transition-colors ${gridView === "3x3" ? "bg-gray-300" : "hover:bg-gray-200"}`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
          </div>

          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters to find what you&apos;re looking for.
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            gridView === "2x2"
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }`}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden transition-shadow duration-300 bg-white"
            >
              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {product.is_on_sale && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    {product.sale_percentage}% OFF
                  </span>
                )}
                <a
                  href={`/${product.parent_category_slug}/${product.category_slug}/${product.slug}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <button className="relative z-10 bg-white text-black px-4 py-2 rounded-[30px] font-medium hover:bg-gray-100 transition-colors">
                    View Details
                  </button>
                </a>
              </div>

              <div className="p-4 text-center">
                <h2 className="text-base font-semibold text-gray-900">{product.name}</h2>
                <div className="flex justify-center items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-gray-900">
                    Rs. {Number(product.price).toLocaleString()}
                  </span>
                  {product.original_price && (
                    <span className="text-xs line-through text-gray-400">
                      Rs. {Number(product.original_price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <Image
              src={selectedImage}
              alt="Enlarged product"
              width={800}
              height={800}
              className="object-contain max-h-[90vh]"
            />
            <button 
              className="absolute top-4 right-4 text-white text-2xl bg-black/50 rounded-full h-10 w-10 flex items-center justify-center hover:bg-black/80 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}