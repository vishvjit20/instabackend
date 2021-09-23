const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");

router.get("/", (req, res) => {
  res.send("Hello");
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name)
      return res.status(422).json({ error: "Please add all the fields" });

    const searchUser = await User.findOne({ email });
    if (searchUser)
      return res.status(422).json({ error: "User already exists" });

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    res.status(200).json({
      status: "success",
      user: newUser,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      data: newUser,
    });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please provide email / password" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(422).json({ error: "Invalid email / password" });

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // return res.status(200).json({ message: "Sign in successful" });
      const token = await jwt.sign({ _id: user._id }, JWT_SECRET);
      res.status(200).json({ token });
    } else return res.status(422).json({ error: "Invalid email / password" });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
