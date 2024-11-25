import mongoose, { Schema } from "mongoose";

const scheduleDetailSchema = new Schema(
  {
    name: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const ScheduleDetail = mongoose.model("ScheduleDetail", scheduleDetailSchema);
export default ScheduleDetail;
