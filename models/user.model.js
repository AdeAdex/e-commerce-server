// server/models/user.model.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  username: { type: String },
  password: { type: String },
  photo: { type: String, default: ""},
  googleId: { type: String, default: ""},
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String }
  },
  dateOfBirth: { type: Date },
  gender: { type: String },
  bio: { type: String },
  socialMedia: {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String }
  },
  preferences: {
    language: { type: String },
    notifications: { type: Boolean, default: false }
  },
  token: { type: String },
  isAdmin: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  editEmailToken: { type: String },
  purchasedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  lastLogin: { type: Date },

}, { timestamps: true });

const UserModel = mongoose.model("user", UserSchema);

export default UserModel;
