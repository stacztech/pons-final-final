import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["home", "work", "other"], default: "home" },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    altPhone: { type: String },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    locality: { type: String },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual id field for frontend compatibility
addressSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
addressSchema.set('toJSON', { virtuals: true });

export const Address = mongoose.model("Address", addressSchema); 