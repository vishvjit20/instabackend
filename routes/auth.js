const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const requireLogin = require("../middleware/requireLogin");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;
    if (!email || !password || !name)
      return res.status(422).json({ error: "Please add all the fields" });

    const searchUser = await User.findOne({ email });
    if (searchUser)
      return res.status(422).json({ error: "User already exists" });

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      pic: req.body.pic,
    });

    res.status(200).json({
      message: "Data saved successfully",
      user: newUser,
    });
  } catch (err) {
    res.status(400).json({
      error: "failed to signup",
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
      const { _id, name, email, followers, following, pic } = user;
      res
        .status(200)
        .json({ token, user: { _id, name, email, followers, following, pic } });
    } else return res.status(422).json({ error: "Invalid email / password" });
  } catch (err) {
    console.log(err);
  }
});

router.get("/protected", requireLogin, (req, res) => {
  res.send("hello user");
});

module.exports = router;
