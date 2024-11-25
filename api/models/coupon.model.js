import mongoose, { Schema } from "mongoose";

const couponSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    discountAmout: { type: Number, default: 0 },
    type: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    usageLimit: { type: Number, default: 0 },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
