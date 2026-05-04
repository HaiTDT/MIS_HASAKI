import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { adminRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth";
import { cartRouter } from "./routes/cart.routes";
import { categoryRouter } from "./routes/categories";
import { checkoutRouter } from "./routes/checkout.routes";
import { healthRouter } from "./routes/health";
import { orderRouter } from "./routes/orders.routes";
import { productRouter } from "./routes/products";

import { blogRouter } from "./routes/blogs.routes";
import { flashSaleRouter } from "./routes/flash-sale.routes";

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});
// dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: clientUrl,
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    name: "Cosmetics E-commerce API",
    status: "running"
  });
});

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/flash-sales", flashSaleRouter);

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
