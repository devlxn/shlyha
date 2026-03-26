import { Schema, model } from "mongoose";

const transactionSchema = new Schema({
  type: {
    type: String,
    enum: ["income", "outcome", "writeoff"], // приход, расход, списание
    required: true,
  },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, default: 0 }, // цена за единицу на момент операции
  totalAmount: { type: Number, required: true, default: 0 },
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier", default: null }, // только для прихода
  comment: { type: String, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model("Transaction", transactionSchema);
