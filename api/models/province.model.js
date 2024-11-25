import mongoose, { Schema } from "mongoose";

const provinceSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Province = mongoose.model("Province", provinceSchema);
export default Province;
