const express = require("express");
const morgan = require("morgan");

/** app.use allow you to add middle to the express middleware stack
 * express.json() ## express middleware ## gives you access to data(data sent from client)
 * on the request body. eg. req.body.password
 */

// initialize express with app
const app = express();

// gives access to the request body
app.use(express.json());

// morgan is for logging http request in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

module.exports = app;
