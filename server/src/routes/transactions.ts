import { Router, Request, Response } from "express";
import Transaction from "../models/Transaction";
import Product from "../models/Product";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/transactions — история операций
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { type, product, startDate, endDate, page = "1", limit = "20" } = req.query;
    const filter: any = {};

    if (type) filter.type = type;
    if (product) filter.product = product;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("product", "name sku unit")
        .populate("supplier", "name")
        .populate("createdBy", "displayName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка получения транзакций", details: err.message });
  }
});

// POST /api/transactions — создать операцию и обновить остаток
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { type, product: productId, quantity, price, supplier, comment } = req.body;

  if (!type || !productId || !quantity || !price) {
    return res.status(400).json({ error: "Заполните все обязательные поля" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Товар не найден" });

    // Для расхода и списания проверяем наличие
    if ((type === "outcome" || type === "writeoff") && product.quantity < quantity) {
      return res.status(400).json({
        error: `Недостаточно товара на складе. Доступно: ${product.quantity} ${product.unit}`,
      });
    }

    // Обновляем количество
    const quantityDelta = type === "income" ? quantity : -quantity;
    product.quantity += quantityDelta;
    await product.save();

    // Создаём транзакцию
    const transaction = await Transaction.create({
      type,
      product: productId,
      quantity,
      price,
      totalAmount: quantity * price,
      supplier: supplier || null,
      comment: comment || "",
      createdBy: (req as any).user._id,
    });

    const populated = await transaction.populate([
      { path: "product", select: "name sku unit" },
      { path: "supplier", select: "name" },
      { path: "createdBy", select: "displayName" },
    ]);

    res.status(201).json(populated);
  } catch (err: any) {
    res.status(400).json({ error: "Ошибка создания операции", details: err.message });
  }
});

// GET /api/transactions/:id — одна транзакция
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("product", "name sku unit")
      .populate("supplier", "name")
      .populate("createdBy", "displayName");
    if (!transaction) return res.status(404).json({ error: "Операция не найдена" });
    res.json(transaction);
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка получения операции", details: err.message });
  }
});

export default router;
