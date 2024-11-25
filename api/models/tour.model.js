import mongoose, { Schema } from "mongoose";

const tourSchema = new Schema(
  {
    name: { type: String, required: true },
    images: { type: Array, default: [] },
    description: { type: String },
    price: { type: Schema.Types.ObjectId, ref: "Price" },
    destinations: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
    startDestination: { type: Schema.Types.ObjectId, ref: "Destination" },
    startDate: { type: String },
    endDate: { type: String },
    availableSeats: { type: Number, default: 0 },
    schedule: { type: Schema.Types.ObjectId, ref: "Schedule" },
    isOutstanding: { type: Boolean, default: false },
    vehicle: { type: String },
    slug: { type: String, required: true },
    tourType: { type: Schema.Types.ObjectId, ref: "TourType" },
  },
  {
    timestamps: true,
  }
);

const Tour = mongoose.model("Tour", tourSchema);
export default Tour;
