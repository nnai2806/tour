import Coupon from "../models/coupon.model.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createCoupon = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { name, code, type, startDate, endDate } = req.body;

  if (!name || !code || !type || !startDate || !endDate) {
    return next(errorHandler(400, "Some fields is required!"));
  }

  const newCoupon = new Coupon({ ...req.body });

  try {
    const savedCoupon = await newCoupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    let coupons = await Coupon.find({
      ...(req.query.id && { _id: req.query.id }),
      ...(req.query.code && { code: req.query.code }),
    });

    const keys = ["name", "type", "description"];

    const result = slugSearch(coupons, req.query.search, keys, req);

    const totalCoupons = await Coupon.countDocuments();

    res.status(200).json({ coupons: result, totalCoupons });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await Coupon.findByIdAndDelete(req.params.couponId);
    res.status(200).json("The coupon has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyCoupons = async (req, res, next) => {
  const couponIds = req.body.couponIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!couponIds || !Array.isArray(couponIds)) {
    return next(
      errorHandler(400, "The couponIds is required and should be an array!")
    );
  }
  try {
    const result = await Coupon.deleteMany({ _id: { $in: couponIds } });
    res.status(200).json(`${result.deletedCount} coupons has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.couponId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedCoupon);
  } catch (error) {
    next(error);
  }
};
