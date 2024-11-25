import Order from "../models/order.model.js";
import { generateSlug } from "../utils/common.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createOrder = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { status, paymentMethod } = req.body;

  if (!status || !paymentMethod) {
    return next(errorHandler(400, "Some fields is required!"));
  }

  const newOrder = new Order({ ...req.body });

  try {
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    let orders = await Order.find({
      ...(req.query.id && { _id: req.query.id }),
      ...(req.query.tour && { tour: req.query.tour }),
      ...(req.query.user && { user: req.query.user }),
      ...(req.query.coupon && { coupon: req.query.coupon }),
    })
      .populate("user")
      .populate("tour");

    const keys = ["status", "paymentMethod"];

    const result = slugSearch(orders, req.query.search, keys, req);

    const totalOrders = await Order.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthTours = await Order.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    const lastMonthToursLastMonth = await Order.find({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      orders: result,
      totalOrders,
      lastMonthTours,
      lastMonthToursLastMonth,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.status(200).json("The order has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyOrders = async (req, res, next) => {
  const orderIds = req.body.orderIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!orderIds || !Array.isArray(orderIds)) {
    return next(
      errorHandler(400, "The orderIds is required and should be an array!")
    );
  }
  try {
    const result = await Order.deleteMany({
      _id: { $in: orderIds },
    });
    res.status(200).json(`${result.deletedCount} orders has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};
