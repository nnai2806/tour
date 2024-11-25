import Price from "../models/price.model.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createPrice = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { priceForAdult, priceForChildren, priceForBaby } = req.body;

  if (!priceForAdult || !priceForChildren || !priceForBaby) {
    return next(errorHandler(400, "Some fields is required!"));
  }
  const newPrice = new Price({ ...req.body });
  try {
    const savedPrice = await newPrice.save();
    res.status(201).json(savedPrice);
  } catch (error) {
    next(error);
  }
};

export const getPrices = async (req, res, next) => {
  try {
    let prices = await Price.find({
      ...(req.query.id && { _id: req.query.id }),
    });

    const keys = [];

    const result = slugSearch(prices, req.query.search, keys, req);

    const totalPrices = await Price.countDocuments();

    res.status(200).json({ prices: result, totalPrices });
  } catch (error) {
    next(error);
  }
};

export const deletePrice = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await Price.findByIdAndDelete(req.params.priceId);
    res.status(200).json("The price has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyPrices = async (req, res, next) => {
  const priceIds = req.body.priceIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!priceIds || !Array.isArray(priceIds)) {
    return next(
      errorHandler(400, "The priceIds is required and should be an array!")
    );
  }
  try {
    const result = await Price.deleteMany({ _id: { $in: priceIds } });
    res.status(200).json(`${result.deletedCount} prices has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updatePrice = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedPrice = await Price.findByIdAndUpdate(
      req.params.priceId,
      {
        $set: {
          priceForAdult: req.body.priceForAdult,
          priceForChildren: req.body.priceForChildren,
          priceForBaby: req.body.priceForBaby,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPrice);
  } catch (error) {
    next(error);
  }
};
