import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default model("Category", categorySchema);
