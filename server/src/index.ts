import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
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

import { analyticsRouter } from "./routes/analytics.routes";
import { blogRouter } from "./routes/blogs.routes";
import { flashSaleRouter } from "./routes/flash-sale.routes";
import { userRouter } from "./routes/user.routes";
import { aiRouter } from "./routes/ai.routes";

dotenv.config();
// Load root .env if it exists (useful for local monorepo development)
const rootEnvPath = path.resolve(process.cwd(), "../.env");
dotenv.config({ path: rootEnvPath });

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [clientUrl, "http://localhost:3000", "https://mis-hasaki-client.vercel.app"];
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
app.use("/api/admin/analytics", analyticsRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/flash-sales", flashSaleRouter);
app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Error:", err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
  });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
