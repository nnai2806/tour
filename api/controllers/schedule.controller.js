import Schedule from "../models/schedule.model.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createSchedule = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { name } = req.body;

  if (!name) {
    return next(errorHandler(400, "Some fields is required!"));
  }
  const newSchedule = new Schedule(req.body);
  try {
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    next(error);
  }
};

export const getSchedules = async (req, res, next) => {
  try {
    let schedules = await Schedule.find({
      ...(req.query.id && { _id: req.query.id }),
    });

    const keys = ["name"];

    const result = slugSearch(schedules, req.query.search, keys, req);

    const totalSchedules = await Schedule.countDocuments();

    res.status(200).json({ schedules: result, totalSchedules });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await Schedule.findByIdAndDelete(req.params.scheduleId);
    res.status(200).json("The schedule has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManySchedules = async (req, res, next) => {
  const scheduleIds = req.body.scheduleIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!scheduleIds || !Array.isArray(scheduleIds)) {
    return next(
      errorHandler(400, "The scheduleIds is required and should be an array!")
    );
  }
  try {
    const result = await Schedule.deleteMany({ _id: { $in: scheduleIds } });
    res.status(200).json(`${result.deletedCount} schedules has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.scheduleId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedSchedule);
  } catch (error) {
    next(error);
  }
};
