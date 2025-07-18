import { Router } from "express";
import "dotenv/config";
import {login, logout } from "../controllers/authController";

const router = Router();


router.post("/login", login);
router.delete("/logout", logout);




export default router;
