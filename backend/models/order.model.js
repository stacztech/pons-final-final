import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    weight: { type: String },
  },
  { _id: false }
);

const deliveryDetailsSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: String, required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentMethod: { type: String, required: true },
    deliveryDetails: deliveryDetailsSchema,
    orderDate: { type: String, required: true },
    expectedDeliveryDate: { type: String },
  },
  { timestamps: true }
);

// Virtual id field for frontend compatibility
orderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
orderSchema.set('toJSON', { virtuals: true });

export const Order = mongoose.model("Order", orderSchema); 