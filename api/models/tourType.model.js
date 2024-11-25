import mongoose, { Schema } from "mongoose";

const tourTypeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    slug: { type: String },
  },
  {
    timestamps: true,
  }
);

const TourType = mongoose.model("TourType", tourTypeSchema);
export default TourType;
