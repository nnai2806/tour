import mongoose, { Schema } from "mongoose";

const reviewsSchema = new Schema(
  {
    quantityStar: { type: Number, min: 0, max: 5, default: 0 },
    content: { type: String, required: true },
    tour: { type: Schema.Types.ObjectId, ref: "Tour" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Reviews = mongoose.model("Reviews", reviewsSchema);
export default Reviews;
