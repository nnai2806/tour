import mongoose, { Schema } from "mongoose";

const scheduleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    scheduleDetail: [{ type: Schema.Types.ObjectId, ref: "ScheduleDetail" }],
  },
  {
    timestamps: true,
  }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
