"use client";

import Link from "next/link";
import { useState } from "react";
import { api, type Product } from "../lib/api";
import { useCart } from "./CartProvider";

export function ProductCard({ product }: { product: Product }) {
  const [message, setMessage] = useState("");
  const { refreshCart } = useCart();

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.addCartItem({ productId: product.id, quantity: 1 });
      setMessage("Đã thêm vào giỏ hàng");
      refreshCart();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng");
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group relative flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-300 organic-shadow hover:-translate-y-1">
      <div className="aspect-square w-full relative overflow-hidden bg-stone-50">
        <img
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={product.imageUrl || 'https://via.placeholder.com/400'}
        />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-3 py-1 rounded-lg text-xs font-bold">
            Sắp hết
          </div>
        )}
        <button
          className="absolute bottom-4 right-4 cta-gradient text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!product.isActive || product.stock <= 0}
          onClick={addToCart}
          type="button"
        >
          <span className="material-symbols-outlined">add_shopping_cart</span>
        </button>
      </div>
      <div className="pt-6 px-2 flex flex-col gap-2 pb-4">
        <div className="flex text-yellow-500">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
              key={star}
            >
              star
            </span>
          ))}
        </div>
        <h3 className="text-on-surface font-headline font-bold text-lg leading-tight line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-3 mt-auto pt-2">
          <span className="text-secondary font-headline text-xl font-bold">
            {Number(product.price).toLocaleString()}<span className="text-sm ml-1">đ</span>
          </span>
        </div>
        {message && <p className="text-xs text-emerald-700">{message}</p>}
      </div>
    </Link>
  );
}
