const express = require("express");
const morgan = require("morgan");

const userRouter = require("./routes/userRoutes");

const AppError = require("./utils/appError");

/**
 * * app.use allow you to add middle to the express middleware stack
 * * express.json() ## express middleware ## gives you access to data(data sent from client)
 * * non the request body. eg. req.body.password
 */

// initialize express with app
const app = express();

// gives access to the request body
app.use(express.json());

// morgan is for logging http request in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//The routes below could be written this way
// app.post("/api/v1/users", sigup)

// * Routes Middlewares ==> talks with router middlewares in the routes folder

app.use("/api/v1/users", userRouter);


// * catch all unhandled routes(get, post, update, delete)
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

module.exports = app;
