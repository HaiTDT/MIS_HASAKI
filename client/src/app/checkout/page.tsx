"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Protected } from "../../components/Protected";
import { ErrorMessage } from "../../components/ui";
import { api, formatPrice, type Cart } from "../../lib/api";
import { useCart } from "../../components/CartProvider";

function CheckoutContent() {
  const { cart, setCart, refreshCart } = useCart();
  const [form, setForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.checkout(form);
      setSuccess("Thanh toán thành công. Đơn hàng của bạn đã được đặt.");
      setCart(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="w-full bg-primary-fixed/30 py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary tracking-tight">Thanh toán</h1>
          <p className="mt-2 text-on-surface-variant font-body">Hoàn tất thông tin để đặt hàng</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <ErrorMessage message={error} />
        {success && (
          <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800 organic-shadow">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </h2>
            <Link className="font-bold underline text-primary hover:text-primary-fixed transition-colors" href="/orders">
              Xem lịch sử đơn hàng
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="bg-surface-container-lowest rounded-xl p-8 organic-shadow border border-outline-variant/30">
              <form className="space-y-8" onSubmit={submit}>
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">contact_mail</span>
                    Thông tin liên hệ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface-variant mb-2">Họ và tên</label>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-primary px-4 py-3 text-on-surface transition-colors"
                        onChange={(event) => setForm({ ...form, shippingName: event.target.value })}
                        required
                        placeholder="Nhập họ tên của bạn"
                        value={form.shippingName}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface-variant mb-2">Số điện thoại</label>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-primary px-4 py-3 text-on-surface transition-colors"
                        onChange={(event) => setForm({ ...form, shippingPhone: event.target.value })}
                        required
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        value={form.shippingPhone}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-surface-variant">
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    Địa chỉ giao hàng
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">Địa chỉ chi tiết (Số nhà, đường...)</label>
                    <textarea
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-primary px-4 py-3 text-on-surface transition-colors"
                      onChange={(event) => setForm({ ...form, shippingAddress: event.target.value })}
                      required
                      rows={3}
                      placeholder="Nhập địa chỉ nhận hàng"
                      value={form.shippingAddress}
                    />
                  </div>
                </div>

                <button
                  className="w-full mt-6 bg-gradient-to-br from-secondary to-secondary-container text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-secondary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={loading || !cart || cart.items.length === 0}
                  type="submit"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận Thanh toán"}
                  {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4">
            <aside className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 sticky top-28 organic-shadow">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-6">Tóm tắt đơn hàng</h2>
              
              {!cart || cart.items.length === 0 ? (
                <p className="text-sm text-on-surface-variant p-4 bg-surface-container-low rounded-lg text-center">
                   Giỏ hàng trống.
                </p>
              ) : (
                <>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {cart.items.map((item) => (
                      <div className="flex gap-4 items-start" key={item.id}>
                        <div className="w-16 h-16 rounded-md bg-surface-container-low overflow-hidden flex-shrink-0">
                           <img src={item.product.imageUrl || 'https://via.placeholder.com/150'} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-sm text-on-surface line-clamp-2 leading-snug">{item.product.name}</h4>
                           <div className="flex justify-between items-end mt-2">
                              <span className="text-xs text-on-surface-variant font-medium">SL: {item.quantity}</span>
                              <span className="font-bold text-sm text-secondary">{formatPrice(item.lineTotal ?? 0)}</span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-surface-variant space-y-4">
                     <div className="flex justify-between text-sm text-on-surface-variant">
                        <span>Tạm tính ({cart.totalQuantity} sản phẩm)</span>
                        <span className="font-medium text-on-surface">{formatPrice(cart.totalAmount)}</span>
                     </div>
                     <div className="flex justify-between text-sm text-on-surface-variant">
                        <span>Phí vận chuyển</span>
                        <span className="font-medium text-on-surface">Miễn phí</span>
                     </div>
                     <div className="flex justify-between items-center pt-4 mt-4 border-t border-surface-variant">
                        <span className="text-lg font-bold">Tổng cộng</span>
                        <div className="text-right">
                           <span className="block text-2xl font-headline font-extrabold text-secondary tracking-tight">
                              {formatPrice(cart.totalAmount)}
                           </span>
                           <span className="text-[10px] text-on-surface-variant italic">(Đã bao gồm VAT)</span>
                        </div>
                     </div>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Protected>
      <CheckoutContent />
    </Protected>
  );
}
