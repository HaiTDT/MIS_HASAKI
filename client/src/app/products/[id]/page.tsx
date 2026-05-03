"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";
import { ErrorMessage } from "../../../components/ui";
import { api, type Product, type Review } from "../../../lib/api";
import { useCart } from "../../../components/CartProvider";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewMeta, setReviewMeta] = useState({ averageRating: 0, totalReviews: 0 });
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [productData, reviewData] = await Promise.all([
        api.getProduct(productId),
        api.getProductReviews(productId)
      ]);
      setProduct(productData);
      setReviews(reviewData.data);
      setReviewMeta(reviewData.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load product");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const addToCart = async () => {
    setMessage("");
    setError("");

    try {
      await api.addCartItem({ productId, quantity });
      setMessage("Đã thêm vào giỏ hàng");
      refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm vào giỏ hàng");
    }
  };

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.createProductReview(productId, { rating, comment });
      setComment("");
      setRating(5);
      setMessage("Đánh giá đã được gửi");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi đánh giá");
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <ErrorMessage message={error} />
        {!error && <p className="text-sm text-slate-600">Đang tải sản phẩm...</p>}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* IMAGE */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden aspect-square flex items-center justify-center p-8 organic-shadow">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} className="w-full h-full object-contain" alt={product.name} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">No image</div>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="lg:col-span-5 space-y-8">
          <span className="text-primary font-semibold uppercase text-sm">
            {product.brand ?? product.category?.name ?? "Sản phẩm"}
          </span>

          <h1 className="text-4xl font-headline font-bold text-on-surface">
            {product.name}
          </h1>

          <div className="flex items-center gap-4">
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
             <span className="text-sm font-medium text-on-surface-variant">
                {reviewMeta.averageRating} / 5 ({reviewMeta.totalReviews} đánh giá)
             </span>
          </div>

          <p className="text-lg leading-relaxed text-on-surface-variant">
            {product.description ?? "Chưa có mô tả cho sản phẩm này."}
          </p>

          <ErrorMessage message={error} />
          {message && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}
        </div>

        {/* BUY */}
        <div className="lg:col-span-3">
          <div className="bg-surface-container-lowest rounded-xl p-6 space-y-6 organic-shadow">
            <span className="text-sm text-on-surface-variant font-medium">Giá sản phẩm</span>
            <div className="text-3xl font-headline font-bold text-primary">
              {Number(product.price).toLocaleString()}đ
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-on-surface-variant">Số lượng</label>
              <input
                className="rounded-lg border border-outline-variant bg-white px-3 py-2 w-20 focus:ring-primary text-center font-bold text-on-surface"
                min="1"
                max={product.stock}
                onChange={(event) => setQuantity(Number(event.target.value))}
                type="number"
                value={quantity}
              />
              <span className="text-xs text-on-surface-variant">Còn {product.stock} sp</span>
            </div>

            <button
              className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors shadow-md disabled:opacity-50"
              disabled={!product.isActive || product.stock <= 0}
              onClick={addToCart}
              type="button"
            >
              Mua ngay
            </button>

            <button
              className="w-full py-4 bg-surface-container-high text-on-surface font-bold rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-50"
              disabled={!product.isActive || product.stock <= 0}
              onClick={addToCart}
              type="button"
            >
              Thêm vào giỏ hàng
            </button>

            <div className="text-sm text-on-surface-variant pt-4 border-t border-outline-variant/30">
              <div className="flex items-start gap-3 mb-2">
                 <span className="material-symbols-outlined text-primary">local_shipping</span>
                 <div>
                    <p className="font-semibold text-on-surface">Giao hàng dự kiến</p>
                    <p>Trong 2-3 ngày làm việc</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-32 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div>
          <h2 className="mb-8 text-3xl font-headline font-bold text-primary">Đánh giá từ khách hàng</h2>
          {reviews.length === 0 ? (
            <div className="bg-surface-container-low p-8 rounded-xl text-center text-on-surface-variant">
               Chưa có đánh giá nào cho sản phẩm này.
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <article className="rounded-xl bg-surface-container-lowest p-6 organic-shadow" key={review.id}>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold font-headline uppercase">
                          {review.userName?.[0] || 'U'}
                       </div>
                       <div>
                          <p className="font-bold text-on-surface">{review.userName}</p>
                          <div className="flex text-yellow-500 text-xs">
                             {Array.from({ length: 5 }).map((_, i) => (
                               <span
                                 className="material-symbols-outlined"
                                 style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                                 key={i}
                               >
                                 star
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">{review.comment ?? "Không có bình luận."}</p>
                </article>
              ))}
            </div>
          )}
        </div>
        <div>
           <form className="space-y-6 rounded-xl bg-surface-container-lowest p-8 organic-shadow sticky top-24" onSubmit={submitReview}>
             <h2 className="font-headline font-bold text-xl text-primary">Viết đánh giá của bạn</h2>
             {!user && <p className="text-sm text-secondary p-3 bg-secondary-fixed rounded-md">Vui lòng đăng nhập và mua sản phẩm để đánh giá.</p>}
             
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-semibold mb-2 text-on-surface">Đánh giá sao</label>
                   <select
                     className="w-full rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm focus:ring-primary text-on-surface"
                     disabled={!user}
                     onChange={(event) => setRating(Number(event.target.value))}
                     value={rating}
                   >
                     {[5, 4, 3, 2, 1].map((value) => (
                       <option key={value} value={value}>
                         {value} Sao
                       </option>
                     ))}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-semibold mb-2 text-on-surface">Nội dung đánh giá</label>
                   <textarea
                     className="w-full rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm focus:ring-primary text-on-surface"
                     disabled={!user}
                     onChange={(event) => setComment(event.target.value)}
                     rows={4}
                     placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                     value={comment}
                   />
                </div>
             </div>

             <button
               className="w-full cta-gradient px-4 py-4 font-bold text-white rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
               disabled={!user}
               type="submit"
             >
               Gửi đánh giá
             </button>
           </form>
        </div>
      </section>
    </>
  );
}
