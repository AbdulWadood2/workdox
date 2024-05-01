const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
/* routes */
const adminRouter = require("./route/admin_routes");
const userRouter = require("./route/user_routes");
const resumeRouter = require("./route/resume_routes");

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = express();
app.enable("trust proxy");
app.use(cors());
app.options("*", cors());

app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* routes */
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/resume", resumeRouter);
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

app.use((err, req, res, next) => {
  return next(new AppError(err, 404));
});

const DB = process.env.mongo_uri;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connection Successful!!"))
  .catch((err) => console.error(err));

const port = 7000;

const server = app.listen(port, () => {
  console.log(`App run with url: http://localhost:${port}`);
});
