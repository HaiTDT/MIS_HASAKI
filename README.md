# 💄 Cosmetics E-commerce Monorepo

Một nền tảng thương mại điện tử chuyên cung cấp mỹ phẩm được xây dựng theo kiến trúc Monorepo. Dự án cung cấp đầy đủ các tính năng cho khách hàng (mua sắm, giỏ hàng, thanh toán) và quản trị viên (quản lý sản phẩm, danh mục, đơn hàng).

## 🚀 Tính năng nổi bật

### Dành cho Khách hàng (Customer)
- **Xác thực & Phân quyền**: Đăng ký, đăng nhập an toàn sử dụng JWT & bcrypt.
- **Duyệt sản phẩm**: Xem danh sách sản phẩm, chi tiết sản phẩm, lọc theo danh mục.
- **Giỏ hàng (Cart)**: Thêm, sửa, xóa sản phẩm trong giỏ hàng.
- **Thanh toán (Checkout)**: Quy trình đặt hàng, nhập thông tin giao hàng.
- **Đơn hàng (Orders)**: Theo dõi lịch sử và trạng thái đơn hàng.
- **Đánh giá (Reviews)**: Đánh giá và nhận xét sản phẩm đã mua.
- **Khám phá Nội dung**: Xem các bài viết tin tức và bí quyết làm đẹp (Blog).
- **Săn Sale**: Mua sắm các sản phẩm giới hạn trong chương trình Flash Sale tại trang chủ.

### Dành cho Quản trị viên (Admin)
- Quản lý danh mục sản phẩm (Categories).
- Quản lý sản phẩm (Products) bao gồm giá cả, hình ảnh, tồn kho và thiết lập Flash Sale.
- Quản lý đơn hàng (Orders) và thay đổi trạng thái giao hàng.
- Quản lý bài viết (Blogs): Tạo và chỉnh sửa nội dung tin tức, bài viết làm đẹp hiển thị ở trang chủ.
- Bảng điều khiển quản trị (Dashboard).

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Client (Frontend)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Ngôn ngữ**: TypeScript

### Server (Backend)
- **Framework**: [Express.js](https://expressjs.com/)
- **Ngôn ngữ**: Node.js & TypeScript
- **Bảo mật**: Helmet, CORS, JWT
- **Database ORM**: [Prisma](https://www.prisma.io/)

### Database & DevOps
- **Cơ sở dữ liệu**: PostgreSQL 16 — hosted trên [Neon](https://neon.tech/) (cloud, serverless)
- **ORM**: Prisma (schema migration & type-safe queries)
- **Containerization** *(tuỳ chọn)*: Docker & Docker Compose (chạy DB local)
- **Workspace Manager**: npm workspaces (Monorepo)

## 📂 Cấu trúc thư mục

Dự án được tổ chức theo dạng Monorepo với cấu trúc như sau:

```text
.
├── client/                 # Ứng dụng Next.js (Frontend)
│   ├── src/
│   │   ├── app/            # Next.js App Router (pages, layouts)
│   │   ├── components/     # Các React components dùng chung
│   │   └── lib/            # Tiện ích, hooks, API calls
│   └── package.json
├── server/                 # Ứng dụng Express.js (Backend API)
│   ├── prisma/
│   │   └── schema.prisma   # Định nghĩa cấu trúc database cho Prisma
│   ├── src/
│   │   ├── controllers/    # Xử lý logic của các API endpoints
│   │   ├── middlewares/    # Middleware xác thực, phân quyền, lỗi
│   │   ├── routes/         # Định nghĩa các endpoints (auth, products, admin, v.v.)
│   │   ├── services/       # Xử lý logic nghiệp vụ (business logic)
│   │   └── types/          # Khai báo TypeScript types/interfaces
│   └── package.json
├── docker-compose.yml      # Cấu hình container PostgreSQL
└── package.json            # Cấu hình Root Workspace và Scripts
```

## 🗄️ Cấu trúc Cơ sở dữ liệu (Database Schema)

Dự án sử dụng PostgreSQL với các Model chính:
- **User**: Lưu trữ thông tin người dùng và phân quyền (`ADMIN`, `CUSTOMER`).
- **Category**: Danh mục sản phẩm (ví dụ: Son môi, Chăm sóc da).
- **Product**: Thông tin chi tiết mỹ phẩm (tên, mô tả, giá, tồn kho, hình ảnh, trạng thái Flash Sale).
- **Cart & CartItem**: Quản lý giỏ hàng tạm thời của người dùng.
- **Order & OrderItem**: Lưu trữ thông tin đơn hàng đã đặt và trạng thái giao hàng.
- **Review**: Lưu trữ đánh giá của khách hàng về sản phẩm.
- **Blog**: Lưu trữ các bài viết, tin tức, chia sẻ bí quyết làm đẹp hiển thị trên trang chủ.

## ⚙️ Hướng dẫn cài đặt và chạy local

> **Database**: Dự án hiện sử dụng **[Neon](https://neon.tech/)** — PostgreSQL serverless trên cloud. Không cần cài đặt hay chạy Docker để dùng database. Mọi thay đổi dữ liệu (thêm sản phẩm, danh mục...) đều được lưu trực tiếp lên Neon.

### Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) phiên bản **18+**
- [Git](https://git-scm.com/)
- *(Tuỳ chọn)* [Docker Desktop](https://www.docker.com/products/docker-desktop/) — chỉ cần nếu muốn chạy database local

---

### Bước 1 — Clone & Cài đặt Dependencies

```bash
git clone <repo-url>
cd MIS_HASAKI
npm install
```

---

### Bước 2 — Cấu hình biến môi trường

Tạo file `server/.env` với nội dung sau:

```env
PORT=4000
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://neondb_owner:<password>@<host>.neon.tech/neondb?sslmode=require
JWT_SECRET=your_jwt_secret_key_here
```

> 💡 **Lấy `DATABASE_URL`**: Đăng nhập [Neon Console](https://console.neon.tech/) → chọn project → **Connection Details** → copy chuỗi kết nối `postgresql://...`

Hoặc copy từ file mẫu rồi điền vào:

```bash
# Windows (PowerShell)
Copy-Item server/.env.example server/.env

# Linux / macOS
cp server/.env.example server/.env
```

Tạo file `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

### Bước 3 — Đồng bộ Schema Database

Chạy lệnh này **một lần duy nhất** để Prisma tạo đầy đủ bảng trên Neon:

```bash
cd server
npx prisma db push
```

Kết quả thành công:

```
The database is already in sync with the Prisma schema.
```

---

### Bước 4 — Khởi động dự án

Quay về thư mục gốc và chạy:

```bash
cd ..
npm run dev
```

| Dịch vụ | URL |
|---------|-----|
| 🌐 **Client** (Next.js) | http://localhost:3000 |
| 🔌 **API Server** (Express) | http://localhost:4000 |
| 🏥 **Health Check** | http://localhost:4000/health |

---

### Tài khoản mặc định

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| `huy@gmail.com` | `123456` | ADMIN |
| `binh@gmail.com` | `123456` | ADMIN |

> ⚠️ Đổi mật khẩu sau khi chạy lần đầu nếu dùng cho môi trường thực tế.

---

### *(Tuỳ chọn)* Chạy Database local với Docker

Nếu muốn dùng PostgreSQL local thay vì Neon:

```bash
# 1. Khởi động container
npm run db:up

# 2. Đổi DATABASE_URL trong server/.env thành:
# DATABASE_URL=postgresql://cosmetics:cosmetics_password@localhost:5432/cosmetics_ecommerce?schema=public

# 3. Chạy migration
npm run prisma:migrate
```

---

## 📜 NPM Scripts

Chạy tại thư mục **gốc** của dự án:

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Khởi động **cả** Client + Server (development) |
| `npm run dev:client` | Chỉ khởi động frontend Next.js |
| `npm run dev:server` | Chỉ khởi động backend Express |
| `npm run build` | Build production cho cả Client và Server |
| `npm run db:up` | Khởi động PostgreSQL container (Docker) |
| `npm run db:down` | Dừng và xóa container |
| `npm run prisma:generate` | Tạo Prisma Client từ schema |
| `npm run prisma:migrate` | Chạy migration cập nhật cấu trúc DB |
| `npm run prisma:studio` | Mở Prisma Studio (quản lý DB trực quan) tại cổng `5555` |

---- NEW UPDATE ---- 
// Tạo file .env.local trong client/.env.local copy .env.example bỏ vào 
// // Tạo file .env trong server/.env copy .env.example bỏ vào 
