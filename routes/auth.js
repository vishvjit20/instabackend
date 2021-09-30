const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const requireLogin = require("../middleware/requireLogin");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { API_KEY, EMAIL } = require("../keys");
const { getMaxListeners } = require("process");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: API_KEY,
    },
  })
);

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

router.post("/reset-password", (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) console.log(err);
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user)
        return res
          .status(422)
          .json({ error: "User doesn't exist with such email" });
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        transporter.sendMail({
          from: EMAIL,
          to: user.email,
          subject: "Password Reset",
          html: `<p>You requested for password change, </p>
          <h5><a href="http://localhost:3000/reset/${token}">Click</a> below link to reset the password </h5>`,
        });

        res.json({ message: "Check your email" });
      });
    });
  });
});

router.post("/newPassword", (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "Try again, session expired!" });
      }
      user.password = newPassword;
      user.resetToken = undefined;
      user.expireToken = undefined;
      user.save().then((savedUser) => {
        res.json({ message: "Password updated successfully" });
      });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
