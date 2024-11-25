import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    image: { type: String, default: "" },
    cccd: { type: String },
    dateOfBirth: { type: String },
    sex: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    isAdmin: { type: Boolean, default: false },
    tourFavourites: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
    postFavourites: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    destinationFavourites: [
      { type: Schema.Types.ObjectId, ref: "Destination" },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
