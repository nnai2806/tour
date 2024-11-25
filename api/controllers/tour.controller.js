import { model } from "mongoose";
import Tour from "../models/tour.model.js";
import { generateSlug } from "../utils/common.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createTour = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }

  const slug = generateSlug(req.body.name);
  const newTour = new Tour({ ...req.body, slug });
  try {
    const savedTour = await newTour.save();
    res.status(201).json(savedTour);
  } catch (error) {
    next(error);
  }
};

export const getTours = async (req, res, next) => {
  try {
    let tours = await Tour.find({
      ...(req.query.id && { _id: req.query.id }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.isOutstanding && {
        isOutstanding: req.query.isOutstanding,
      }),
      ...(req.query.price && { price: req.query.price }),
      ...(req.query.destinations && { destinations: req.query.destinations }),
      ...(req.query.schedule && { schedule: req.query.schedule }),
      ...(req.query.tourType && { tourType: req.query.tourType }),
    })
      .populate("destinations")
      .populate("price")
      .populate("startDestination")
      .populate("schedule")
      .populate("tourType")
      .populate({
        path: "destinations",
        populate: {
          path: "province",
          model: "Province",
        },
      });

    // Lọc theo priceForAdult sau khi populate
    if (req.query.min && req.query.max) {
      const min = req.query.min;
      const max = req.query.max;
      tours = tours.filter(
        (tour) =>
          tour.price?.priceForAdult >= min && tour.price?.priceForAdult <= max
      );
    }

    const keys = ["name", "description", "vehicle"];

    const result = slugSearch(tours, req.query.search, keys, req);

    const totalTours = tours.length;

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthTours = await Tour.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({ tours: result, totalTours, lastMonthTours });
  } catch (error) {
    next(error);
  }
};

export const deleteTour = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await Tour.findByIdAndDelete(req.params.tourId);
    res.status(200).json("The tour has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyTours = async (req, res, next) => {
  const tourIds = req.body.tourIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!tourIds || !Array.isArray(tourIds)) {
    return next(
      errorHandler(400, "The tourIds is required and should be an array!")
    );
  }
  try {
    const result = await Tour.deleteMany({ _id: { $in: tourIds } });
    res.status(200).json(`${result.deletedCount} tours has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updateTour = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.tourId,
      {
        $set: {
          ...req.body,
          ...(req.body.name && { slug: generateSlug(req.body.name) }),
        },
      },
      { new: true }
    );
    res.status(200).json(updatedTour);
  } catch (error) {
    next(error);
  }
};
