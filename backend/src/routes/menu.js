import { Router } from "express";
import { getMenu } from "../controllers/menu.js";

const router = Router();

// Customers can browse the menu without a staff account.
router.get("/", getMenu);

export default router;
