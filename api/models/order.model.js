import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    numOfAdults: { type: Number, default: 0 },
    numOfChildren: { type: Number, default: 0 },
    numOfBabies: { type: Number, default: 0 },
    surcharge: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    status: { type: String },
    paymentMethod: { type: String },
    note: { type: String },
    tour: { type: Schema.Types.ObjectId, ref: "Tour" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon" },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
