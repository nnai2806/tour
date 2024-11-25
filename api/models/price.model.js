import mongoose, { Schema } from "mongoose";

const priceSchema = new Schema(
  {
    priceForAdult: { type: Number, required: true },
    priceForChildren: { type: Number, required: true },
    priceForBaby: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Price = mongoose.model("Price", priceSchema);
export default Price;
