const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
require("dotenv").config();

const app = express();
app.use(formidable());

mongoose.connect("MONGODB_URI", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
});

const userRoutes = require("./Routes/user");
const offerRoutes = require("./Routes/offer");
const offersRoutes = require("./Routes/offers");
app.use(userRoutes);
app.use(offerRoutes);
app.use(offersRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found !" });
});

app.listen(PORT, () => {
  console.log("Server Started");
});
