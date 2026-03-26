import { Router, Request, Response } from "express";
import Product from "../models/Product";
import Transaction from "../models/Transaction";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/dashboard — сводная статистика
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const [
      totalProducts,
      totalCategories,
      lowStockProducts,
      recentTransactions,
      incomeSum,
      outcomeSum,
    ] = await Promise.all([
      // Всего наименований товаров
      Product.countDocuments(),

      // Всего категорий
      Product.distinct("category").then((arr) => arr.length),

      // Товары с низким остатком (quantity <= minQuantity)
      Product.find({ $expr: { $lte: ["$quantity", "$minQuantity"] } })
        .populate("category", "name")
        .select("name sku quantity minQuantity unit")
        .limit(10),

      // Последние 10 операций
      Transaction.find()
        .populate("product", "name sku")
        .populate("createdBy", "displayName")
        .sort({ createdAt: -1 })
        .limit(10),

      // Сумма всех приходов
      Transaction.aggregate([
        { $match: { type: "income" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Сумма всех расходов
      Transaction.aggregate([
        { $match: { type: "outcome" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    // Общая стоимость склада
    const warehouseValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } },
        },
      },
    ]);

    res.json({
      totalProducts,
      totalCategories,
      lowStockProducts,
      recentTransactions,
      totalIncome: incomeSum[0]?.total || 0,
      totalOutcome: outcomeSum[0]?.total || 0,
      warehouseValue: warehouseValue[0]?.total || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка получения статистики", details: err.message });
  }
});

export default router;
