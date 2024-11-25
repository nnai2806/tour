import Reviews from "../models/reviews.model.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createReviews = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { content } = req.body;

  if (!content) {
    return next(errorHandler(400, "Some fields is required!"));
  }

  const newReviews = new Reviews({ ...req.body });

  try {
    const savedReviews = await newReviews.save();
    res.status(201).json(savedReviews);
  } catch (error) {
    next(error);
  }
};

export const getReviewss = async (req, res, next) => {
  try {
    let reviews = await Reviews.find({
      ...(req.query.id && { _id: req.query.id }),
      ...(req.query.user && { user: req.query.user }),
      ...(req.query.tour && { tour: req.query.tour }),
    })
      .populate("user")
      .populate("tour");

    const keys = ["content"];

    const result = slugSearch(reviews, req.query.search, keys, req);

    const totalReviewss = await Reviews.countDocuments();

    res.status(200).json({ reviews: result, totalReviewss });
  } catch (error) {
    next(error);
  }
};

export const deleteReviews = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await Reviews.findByIdAndDelete(req.params.reviewsId);
    res.status(200).json("The reviews has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyReviewss = async (req, res, next) => {
  const reviewsIds = req.body.reviewsIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!reviewsIds || !Array.isArray(reviewsIds)) {
    return next(
      errorHandler(400, "The reviewsIds is required and should be an array!")
    );
  }
  try {
    const result = await Reviews.deleteMany({
      _id: { $in: reviewsIds },
    });
    res.status(200).json(`${result.deletedCount} reviews has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updateReviews = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedReviews = await Reviews.findByIdAndUpdate(
      req.params.reviewsId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedReviews);
  } catch (error) {
    next(error);
  }
};
