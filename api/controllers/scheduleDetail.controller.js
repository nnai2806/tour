import ScheduleDetail from "../models/scheduleDetail.model.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createScheduleDetail = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { name, content } = req.body;

  if (!name || !content) {
    return next(errorHandler(400, "Some fields is required!"));
  }
  const newScheduleDetail = new ScheduleDetail(req.body);
  try {
    const savedScheduleDetail = await newScheduleDetail.save();
    res.status(201).json(savedScheduleDetail);
  } catch (error) {
    next(error);
  }
};

export const getScheduleDetails = async (req, res, next) => {
  try {
    let scheduleDetails = await ScheduleDetail.find({
      ...(req.query.id && { _id: req.query.id }),
    });

    const keys = ["name", "content"];

    const result = slugSearch(scheduleDetails, req.query.search, keys, req);

    const totalScheduleDetails = await ScheduleDetail.countDocuments();

    res.status(200).json({ scheduleDetails: result, totalScheduleDetails });
  } catch (error) {
    next(error);
  }
};

export const deleteScheduleDetail = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await ScheduleDetail.findByIdAndDelete(req.params.scheduleDetailId);
    res.status(200).json("The scheduleDetail has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyScheduleDetails = async (req, res, next) => {
  const scheduleDetailIds = req.body.scheduleDetailIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!scheduleDetailIds || !Array.isArray(scheduleDetailIds)) {
    return next(
      errorHandler(
        400,
        "The scheduleDetailIds is required and should be an array!"
      )
    );
  }
  try {
    const result = await ScheduleDetail.deleteMany({
      _id: { $in: scheduleDetailIds },
    });
    res
      .status(200)
      .json(`${result.deletedCount} scheduleDetails has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updateScheduleDetail = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedScheduleDetail = await ScheduleDetail.findByIdAndUpdate(
      req.params.scheduleDetailId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedScheduleDetail);
  } catch (error) {
    next(error);
  }
};
