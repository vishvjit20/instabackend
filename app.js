const express = require("express");
const mongoose = require("mongoose");
const app = express();
const authRoutes = require("./routes/auth");
const { MONGOURI } = require("./keys");
const User = require("./models/user");
const Post = require("./models/posts");
const postRoutes = require("./routes/post");

const PORT = 5000;

mongoose
  .connect(MONGOURI)
  .then(() => console.log("DATABASE CONNECTED SUCCESSFULLY"));

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/post", postRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
