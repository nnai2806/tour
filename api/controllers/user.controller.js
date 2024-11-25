import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import { slugSearch } from "../utils/search.js";

export const updateUser = async (req, res, next) => {
  if (!req.user) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (req.body.password) {
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  try {
    if (req.user.isAdmin || req.user.id === req.params.userId) {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        {
          $set: {
            fullName: req.body.fullName,
            image: req.body.image,
            cccd: req.body.cccd,
            dateOfBirth: req.body.dateOfBirth,
            sex: req.body.sex,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            address: req.body.address,
            isAdmin: req.body.isAdmin,
            tourFavourites: req.body.tourFavourites,
            postFavourites: req.body.postFavourites,
            destinationFavourites: req.body.destinationFavourites,
          },
        },
        { new: true }
      );
      const { password, ...rest } = updatedUser._doc;
      res.status(200).json(rest);
    } else {
      next(errorHandler(403, "Not allowed!"));
    }
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    let users = await User.find({
      ...(req.query.id && { _id: req.query.id }),
    })
      .populate("tourFavourites")
      .populate("destinationFavourites")
      .populate("postFavourites");

    const keys = ["fullName", "address", "sex", "cccd", "email", "phone"];

    const result = slugSearch(users, req.query.search, keys, req);

    const userWithoutPassword = result.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: userWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteManyUsers = async (req, res, next) => {
  const userIds = req.body.userIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!userIds || !Array.isArray(userIds)) {
    return next(
      errorHandler(400, "The userIds is required and should be an array!")
    );
  }
  try {
    const result = await User.deleteMany({ _id: { $in: userIds } });
    res.status(200).json(`${result.deletedCount} users has been deleted!`);
  } catch (error) {
    next(error);
  }
};
