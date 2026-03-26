import { Router, Request, Response } from "express";
import Product from "../models/Product";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/products — список всех товаров
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { search, category, lowStock } = req.query;
    const filter: any = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (lowStock === "true") filter.$expr = { $lte: ["$quantity", "$minQuantity"] };

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("supplier", "name")
      .sort({ name: 1 });

    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка получения товаров", details: err.message });
  }
});

// GET /api/products/:id — один товар
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("supplier", "name");
    if (!product) return res.status(404).json({ error: "Товар не найден" });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка получения товара", details: err.message });
  }
});

// POST /api/products — создать товар
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: "Ошибка создания товара", details: err.message });
  }
});

// PUT /api/products/:id — обновить товар
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Товар не найден" });
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: "Ошибка обновления товара", details: err.message });
  }
});

// DELETE /api/products/:id — удалить товар
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Товар не найден" });
    res.json({ message: "Товар удалён" });
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка удаления товара", details: err.message });
  }
});

export default router;
