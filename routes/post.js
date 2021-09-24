const express = require("express");
const router = express.Router();
const Post = require("../models/posts");
const requireLogin = require("../middleware/requireLogin");

router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("postedBy", "_id name");
    res.status(200).json({
      status: "success",
      posts,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      error: err,
    });
  }
});

router.post("/createPost", requireLogin, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      res.status(422).json({ error: "Please add all the fields" });
    }

    req.user.password = undefined;
    const post = await Post.create({ title, body, postedBy: req.user });
    res.status(200).json({
      status: "success",
      post,
    });
  } catch (err) {
    return res.send(err);
  }
});

router.get("/myposts", requireLogin, async (req, res) => {
  try {
    const mypost = await Post.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "_id name"
    );

    res.status(200).json({
      status: "success",
      posts: mypost,
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      error: err,
    });
  }
});

module.exports = router;
