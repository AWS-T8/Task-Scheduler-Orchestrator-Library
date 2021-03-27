const userDB = require("../models/userDB");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: "./.env" });
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(406).json({ message: "Not Acceptable" });
    }
    const username = req.body.username;
    const password = req.body.password;

    userDB.findOne({ username: username }).then(async (result) => {
      if (result != null) {
        return res.status(409).json({ message: "Username Already Exists" });
      }
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await new userDB({
        username: username,
        password: hashedPassword,
      });
      user.save().then((newUser) => {
        res.status(201).json({ message: "User Created" });
      });
    });
  } catch (err) {
    // Server Error
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(406).json({ message: "Not Acceptable" });
  }
  const username = req.body.username;
  const password = req.body.password;

  const user = await userDB.findOne({ username: username });
  if (user == null) {
    return res.status(400).json({ message: "User Not Found" });
  } else {
    try {
      if (await bcrypt.compare(password, user.password)) {
        const currUser = {
          id: user._id,
          username: user.username,
        };
        const accessToken = await jwt.sign(
          currUser,
          process.env.ACCESS_TOKEN_SECRET
        );
        res.status(200).json({ accessToken: accessToken });
      } else {
        return res.status(403).json({ message: "Wrong Password" });
      }
    } catch (err) {
      // Server Error
      res.status(500).json({ message: err.message });
    }
  }
};

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ message: "Unauthorized Client" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }
    req.user = user;
    next();
  });
};
