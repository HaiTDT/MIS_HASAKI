"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { useCart } from "../CartProvider";
import { CATEGORY_GROUPS } from "../../lib/constants";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  const activeGroup = searchParams.get("group");
  const isHome = pathname === "/" && !activeGroup;

  return (
    <header className="fixed top-0 w-full z-50 bg-white dark:bg-stone-900 backdrop-blur-md shadow-sm">
      <div className="flex flex-col w-full max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8 mb-4">
          <Link href="/" className="text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-50 font-headline">
            Botanical Atelier
          </Link>
          <div className="flex-1 max-w-xl relative">
            <input
              className="w-full bg-surface-variant border-none rounded-sm px-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all"
              placeholder="Tìm kiếm sản phẩm chăm sóc da..." type="text" />
            <span className="material-symbols-outlined absolute right-3 top-2 text-primary">search</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden lg:block text-emerald-900 dark:text-emerald-400 font-medium text-sm">Hotline: 1900 1234</span>
            <div className="flex items-center gap-4">
              {user && (
                <button 
                  onClick={() => router.push("/orders")} 
                  className="p-2 text-emerald-900 hover:bg-stone-50 transition-all rounded-full relative"
                  title="Lịch sử đơn hàng"
                >
                  <span className="material-symbols-outlined">receipt_long</span>
                </button>
              )}
              <button onClick={() => router.push("/cart")} className="p-2 text-emerald-900 hover:bg-stone-50 transition-all rounded-full relative">
                <span className="material-symbols-outlined">shopping_cart</span>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              {user?.role === "ADMIN" && (
                <Link
                  className="hidden md:flex items-center gap-1 text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                  href="/admin"
                >
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  Quản trị Admin
                </Link>
              )}
              {user ? (
                <button
                  className="p-2 text-emerald-900 hover:bg-stone-50 transition-all rounded-full"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  type="button"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              ) : (
                <button
                  className="p-2 text-emerald-900 hover:bg-stone-50 transition-all rounded-full"
                  onClick={() => router.push("/login")}
                  type="button"
                >
                  <span className="material-symbols-outlined">person</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <nav className="flex items-center justify-center gap-8">
          <Link
            className={`py-1 text-sm font-headline transition-colors ${isHome ? "text-emerald-700 border-b-2 border-orange-500 font-semibold" : "text-stone-600 dark:text-stone-400 hover:text-emerald-800"}`}
            href="/"
          >
            Trang chủ
          </Link>
          {CATEGORY_GROUPS.map((group) => (
            <Link
              key={group.key}
              className={`py-1 text-sm font-headline transition-colors ${activeGroup === group.key ? "text-emerald-700 border-b-2 border-orange-500 font-semibold" : "text-stone-600 dark:text-stone-400 hover:text-emerald-800"}`}
              href={`/products?group=${group.key}`}
            >
              {group.label}
            </Link>
          ))}
          <Link
            className={`py-1 text-sm font-headline flex items-center gap-1 font-bold transition-colors ${searchParams.get("flashSale") === "true" ? "text-orange-700 border-b-2 border-orange-500" : "text-orange-600 hover:text-orange-800"}`}
            href="/products?flashSale=true"
          >
            Khuyến mãi <span className="material-symbols-outlined text-[16px]">bolt</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

