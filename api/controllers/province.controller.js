import Province from "../models/province.model.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createProvince = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { name } = req.body;

  if (!name) {
    return next(errorHandler(400, "Some fields is required!"));
  }

  const newProvince = new Province({ ...req.body });

  try {
    const savedProvince = await newProvince.save();
    res.status(201).json(savedProvince);
  } catch (error) {
    next(error);
  }
};

export const getProvinces = async (req, res, next) => {
  try {
    let provinces = await Province.find({
      ...(req.query.id && { _id: req.query.id }),
    });

    const keys = ["name", "description"];

    const result = slugSearch(provinces, req.query.search, keys, req);

    const totalProvinces = await Province.countDocuments();

    res.status(200).json({ provinces: result, totalProvinces });
  } catch (error) {
    next(error);
  }
};

export const deleteProvince = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await Province.findByIdAndDelete(req.params.provinceId);
    res.status(200).json("The province has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyProvinces = async (req, res, next) => {
  const provinceIds = req.body.provinceIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!provinceIds || !Array.isArray(provinceIds)) {
    return next(
      errorHandler(400, "The provinceIds is required and should be an array!")
    );
  }
  try {
    const result = await Province.deleteMany({
      _id: { $in: provinceIds },
    });
    res.status(200).json(`${result.deletedCount} provinces has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updateProvince = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedProvince = await Province.findByIdAndUpdate(
      req.params.provinceId,
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedProvince);
  } catch (error) {
    next(error);
  }
};
