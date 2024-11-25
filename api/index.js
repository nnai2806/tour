import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import tourRoute from "./routes/tour.route.js";
import tourTypeRoute from "./routes/tourType.route.js";
import scheduleRoute from "./routes/schedule.route.js";
import scheduleDetailRoute from "./routes/scheduleDetail.route.js";
import priceRoute from "./routes/price.route.js";
import destinationRoute from "./routes/destination.route.js";
import provinceRoute from "./routes/province.route.js";
import reviewsRoute from "./routes/reviews.route.js";
import postRoute from "./routes/post.route.js";
import orderRoute from "./routes/order.route.js";
import couponRoute from "./routes/coupon.route.js";

// Config dotenv
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB is connected!");
  })
  .catch((err) => {
    console.log(err);
  });

// Start the api
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});

// Routes api
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/tour", tourRoute);
app.use("/api/tourType", tourTypeRoute);
app.use("/api/schedule", scheduleRoute);
app.use("/api/scheduleDetail", scheduleDetailRoute);
app.use("/api/price", priceRoute);
app.use("/api/destination", destinationRoute);
app.use("/api/province", provinceRoute);
app.use("/api/reviews", reviewsRoute);
app.use("/api/post", postRoute);
app.use("/api/order", orderRoute);
app.use("/api/coupon", couponRoute);

// Config error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
