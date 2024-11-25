import mongoose, { Schema } from "mongoose";

const destinationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    images: { type: Array },
    description: { type: String },
    province: { type: Schema.Types.ObjectId, ref: "Province", required: true },
  },
  {
    timestamps: true,
  }
);

const Destination = mongoose.model("Destination", destinationSchema);
export default Destination;
