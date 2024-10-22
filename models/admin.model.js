// server/models/admin.model.js

import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
  editEmailToken: { type: String },
}, { timestamps: true });

const AdminModel = mongoose.model("admin", AdminSchema);

export default AdminModel;
