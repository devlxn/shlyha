import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "worker"], default: "worker" },
  displayName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model("User", userSchema);
