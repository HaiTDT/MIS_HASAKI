import { Router } from "express";
import { authController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/register/google", authController.registerWithGoogle);
authRouter.post("/login", authController.login);
