import { Router, Request, Response } from "express";
import Category from "../models/Category";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/categories
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка получения категорий", details: err.message });
  }
});

// POST /api/categories
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err: any) {
    res.status(400).json({ error: "Ошибка создания категории", details: err.message });
  }
});

// PUT /api/categories/:id
router.put("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ error: "Категория не найдена" });
    res.json(category);
  } catch (err: any) {
    res.status(400).json({ error: "Ошибка обновления категории", details: err.message });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: "Категория не найдена" });
    res.json({ message: "Категория удалена" });
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка удаления категории", details: err.message });
  }
});

export default router;
