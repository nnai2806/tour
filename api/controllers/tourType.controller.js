import slugify from "slugify";
import TourType from "../models/tourType.model.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createTourType = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { name, description } = req.body;
  if (!name) {
    return next(errorHandler(400, "The name is required!"));
  }
  const slug = slugify(name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    locale: "vi",
  });
  try {
    const newTourType = new TourType({ ...req.body, slug });
    const savedTourType = await newTourType.save();
    res.status(201).json(savedTourType);
  } catch (error) {
    next(error);
  }
};

export const getTourTypes = async (req, res, next) => {
  try {
    let tourTypes = await TourType.find({
      ...(req.query.id && { _id: req.query.id }),
      ...(req.query.slug && { slug: req.query.slug }),
    });

    const keys = ["name", "description"];

    const result = slugSearch(tourTypes, req.query.search, keys, req);

    const totalTourTypes = await TourType.countDocuments();

    res.status(200).json({ tourTypes: result, totalTourTypes });
  } catch (error) {
    next(error);
  }
};

export const deleteTourType = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await TourType.findByIdAndDelete(req.params.tourTypeId);
    res.status(200).json("The tourType has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyTourTypes = async (req, res, next) => {
  const tourTypeIds = req.body.tourTypeIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!tourTypeIds || !Array.isArray(tourTypeIds)) {
    return next(
      errorHandler(400, "The tourTypeIds is required and should be an array!")
    );
  }
  try {
    const result = await TourType.deleteMany({ _id: { $in: tourTypeIds } });
    res.status(200).json(`${result.deletedCount} tourType has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updateTourType = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedTourType = await TourType.findByIdAndUpdate(
      req.params.tourTypeId,
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          slug: slugify(req.body.name, {
            lower: true,
            remove: /[*+~.()'"!:@]/g,
            locale: "vi",
          }),
        },
      },
      { new: true }
    );
    res.status(200).json(updatedTourType);
  } catch (error) {
    next(error);
  }
};
