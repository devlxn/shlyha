import { Router, Request, Response } from "express";
import Supplier from "../models/Supplier";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/suppliers
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка получения поставщиков", details: err.message });
  }
});

// GET /api/suppliers/:id
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Поставщик не найден" });
    res.json(supplier);
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка получения поставщика", details: err.message });
  }
});

// POST /api/suppliers
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err: any) {
    res.status(400).json({ error: "Ошибка создания поставщика", details: err.message });
  }
});

// PUT /api/suppliers/:id
router.put("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) return res.status(404).json({ error: "Поставщик не найден" });
    res.json(supplier);
  } catch (err: any) {
    res.status(400).json({ error: "Ошибка обновления поставщика", details: err.message });
  }
});

// DELETE /api/suppliers/:id
router.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Поставщик не найден" });
    res.json({ message: "Поставщик удалён" });
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка удаления поставщика", details: err.message });
  }
});

export default router;
