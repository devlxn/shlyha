import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true }, // артикул
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier", default: null },
  quantity: { type: Number, required: true, default: 0, min: 0 },
  unit: { type: String, required: true, default: "шт" }, // шт, кг, л и т.д.
  purchasePrice: { type: Number, required: true, default: 0 }, // цена закупки
  salePrice: { type: Number, required: true, default: 0 },     // цена продажи
  minQuantity: { type: Number, default: 0 }, // минимальный остаток (для уведомлений)
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Обновляем updatedAt при сохранении
productSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default model("Product", productSchema);
