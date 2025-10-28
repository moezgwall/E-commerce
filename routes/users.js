const express = require("express");
const Router = express.Router();
const USERDB = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// singup  for user
const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "input filed are empty" });
  }
  // isFound?
  const user = await USERDB.findOne({ $or: [{ username }, { email }] });
  if (user) {
    return res.status(400).json({ message: "user already exist" });
  }
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const db_user = await USERDB.create({
      username: username,
      email: email,
      password: hashPassword,
      role: "user",
    });

    if (!db_user) {
      return res.status(401).json({ error: " failed to create a user" });
    }
    const payload = {
      id: db_user._id,
      username: db_user.username,
      email: db_user.email,
      role: db_user.role,
    };

    const token = jwt.sign(payload, process.env.SEC_KEY, {
      expiresIn: "1h",
    });

    //req.user = token;

    return res
      .status(201)
      .json({ message: "user has been created successfuly", token: token });
  } catch (error) {
    console.error("error message :", error.message);
    return res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

// post
// user login

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "input filed are empty" });
  }

  try {
    // does user exist
    const user = await USERDB.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const newToken = jwt.sign(payload, process.env.SEC_KEY, {
      expiresIn: "1h",
    });

    return res
      .status(200)
      .json({ message: "User has been logged in ", token: newToken });
  } catch (error) {
    console.error("error with message : ", error.message);
    return res
      .status(500)
      .json({ message: "internal server error ", error: error.message });
  }
};

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
