const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const User = require("../Models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const password = req.fields.password;
    const salt = uid2(16);
    const hash = SHA256(password, salt).toString(encBase64);
    const token = uid2(16);
    const doesExist = await User.findOne({ email: req.fields.email });
    if (!req.fields.username) {
      res.json("Please insert a valid username");
    } else {
      if (doesExist) {
        res.json("You already have an account");
      } else {
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
          },
          token: token,
          hash: hash,
          salt: salt,
        });
        const response = {
          token: token,
          email: req.fields.email,
          account: newUser.account,
        };
        const avatar = await cloudinary.uploader.upload(req.files.avatar.path, {
          folder: `/vinted/users/${newUser._id}`,
        });
        console.log({ avatar });

        newUser.account.avatar = avatar;

        await newUser.save();
        res.json(response);
      }
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (user) {
      const password = req.fields.password;
      const token = uid2(16);
      const salt = uid2(16);
      const userHash = SHA256(password, salt).toString(encBase64);
      if (user.hash === userHash) {
        const response = {
          token: token,
          email: req.fields.email,
          account: user.account,
        };
        res.json(response);
      } else {
        res.json("ACCES DENIED");
      }
    } else {
      res.json("ACCES DENIED");
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
