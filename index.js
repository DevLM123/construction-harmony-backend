require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("./src/middlewares/errorMiddleware");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const authRoutes = require("./src/routes/authRoutes");
const scheduleRoutes = require("./src/routes/scheduleRoutes");

app.use("/", authRoutes);
app.use("/", scheduleRoutes);

app.listen(5000, () => {
  console.log("Server started on http://localhost:5000");
});

app.use(errorHandler);
