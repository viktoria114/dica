import { Router } from "express";
import "dotenv/config";
import {login } from "../controllers/authController";

const router = Router();


router.post("/login", login);



export default router;
