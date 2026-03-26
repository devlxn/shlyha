import { Schema, model } from "mongoose";

const supplierSchema = new Schema({
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  address: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default model("Supplier", supplierSchema);
