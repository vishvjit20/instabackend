const express = require("express");
const mongoose = require("mongoose");
const app = express();
const authRoutes = require("./routes/auth");
const { MONGOURI } = require("./keys");
const User = require("./models/user");

const PORT = 5000;

app.use(express.json());
app.use("/", authRoutes);

mongoose
  .connect(MONGOURI)
  .then(() => console.log("DATABASE CONNECTED SUCCESSFULLY"));

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
