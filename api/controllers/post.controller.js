import Post from "../models/post.model.js";
import { generateSlug } from "../utils/common.js";
import { errorHandler } from "../utils/error.js";
import { slugSearch } from "../utils/search.js";

export const createPost = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  const { title, content } = req.body;

  if (!title || !content) {
    return next(errorHandler(400, "Some fields is required!"));
  }
  const slug = generateSlug(title);
  const newPost = new Post({ ...req.body, slug });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    let posts = await Post.find({
      ...(req.query.id && { _id: req.query.id }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.user && { user: req.query.user }),
    }).populate("user");

    const keys = ["title", "content"];

    const result = slugSearch(posts, req.query.search, keys, req);

    const totalPosts = await Post.countDocuments();

    res.status(200).json({ posts: result, totalPosts });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json("The post has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const deleteManyPosts = async (req, res, next) => {
  const postIds = req.body.postIds;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  if (!postIds || !Array.isArray(postIds)) {
    return next(
      errorHandler(400, "The postIds is required and should be an array!")
    );
  }
  try {
    const result = await Post.deleteMany({
      _id: { $in: postIds },
    });
    res.status(200).json(`${result.deletedCount} posts has been deleted!`);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not allowed!"));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          ...req.body,
          ...(req.body.title && { slug: generateSlug(req.body.title) }),
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};
