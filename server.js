const mongoose = require("mongoose");
const dotenv = require("dotenv");

// gives you access to environment variables
dotenv.config({ path: "./config.env" });

const app = require("./app");

//connect to mongoose db
mongoose
  .connect(process.env.DATABASE, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB Connection successful... 🔥🔥🔥"));

// start server and listen on port
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`App running on port ${port} === 🚀🚀🚀`);
});
