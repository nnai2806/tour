import Destination from "../models/destination.model.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createDestination = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { name } = req.body;

  if (!name) {
    return next(errorHandler(400, "Some fields is required!"));
  }

  const newDestination = new Destination({ ...req.body });

  try {
    const savedDestination = await newDestination.save();
    res.status(201).json(savedDestination);
  } catch (error) {
    next(error);
  }
};

export const getDestinations = async (req, res, next) => {
  try {
    let destinations = await Destination.find({
      ...(req.query.id && { _id: req.query.id }),
      ...(req.query.province && { province: req.query.province }),
      ...(req.query.tour && { tour: req.query.tour }),
    }).populate("province");

    const keys = ["name", "description"];

    const result = slugSearch(destinations, req.query.search, keys, req);

    const totalDestinations = await Destination.countDocuments();

    res.status(200).json({ destinations: result, totalDestinations });
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await Destination.findByIdAndDelete(req.params.destinationId);
    res.status(200).json("The destination has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyDestinations = async (req, res, next) => {
  const destinationIds = req.body.destinationIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!destinationIds || !Array.isArray(destinationIds)) {
    return next(
      errorHandler(
        400,
        "The destinationIds is required and should be an array!"
      )
    );
  }
  try {
    const result = await Destination.deleteMany({
      _id: { $in: destinationIds },
    });
    res
      .status(200)
      .json(`${result.deletedCount} destinations has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedDestination = await Destination.findByIdAndUpdate(
      req.params.destinationId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedDestination);
  } catch (error) {
    next(error);
  }
};
