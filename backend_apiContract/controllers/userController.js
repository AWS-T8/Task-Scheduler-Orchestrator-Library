//Imports
const userDB = require("../models/userDB");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: "./.env" });
const jwt = require("jsonwebtoken");

//Reguster Handler
exports.register = async (req, res) => {
  try {
    //Input validation
    if (!req.body.username || !req.body.password) {
      return res.status(406).json({ message: "Not Acceptable" });
    }
    const username = req.body.username;
    const password = req.body.password;

    userDB.findOne({ username: username }).then(async (result) => {
      if (result != null) {
        //If username already exists
        return res.status(409).json({ message: "Username Already Exists" });
      }
      //Hash password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await new userDB({
        username: username,
        password: hashedPassword,
      });
      //Save document
      user.save().then((newUser) => {
        res.status(201).json({ message: "User Created" });
      });
    });
  } catch (err) {
    // Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Login Handler
exports.login = async (req, res) => {
  //Input validation
  if (!req.body.username || !req.body.password) {
    return res.status(406).json({ message: "Not Acceptable" });
  }
  const username = req.body.username;
  const password = req.body.password;

  const user = await userDB.findOne({ username: username });
  //If user does not exists
  if (user == null) {
    return res.status(400).json({ message: "User Not Found" });
  } else {
    try {
      //Decrypt password
      if (await bcrypt.compare(password, user.password)) {
        const currUser = {
          id: user._id,
          username: user.username,
        };
        //Set JWT token
        const accessToken = await jwt.sign(
          currUser,
          process.env.ACCESS_TOKEN_SECRET
        );
        // New change
        // res.cookie("token", token, { httpOnly: true });
        //Return JWT token
        res.status(200).json({ accessToken: accessToken });
      } else {
        return res.status(403).json({ message: "Wrong Password" });
      }
    } catch (err) {
      // Server Error
      console.log(err.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

//Middleware to verify user & store in req objext
exports.authenticateToken = (req, res, next) => {
  //Getting auth header from request
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  //If token not found
  if (token == null) {
    return res.status(401).json({ message: "Unauthorized Client" });
  }
  //Verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }
    //Store user in request
    req.user = user;
    next();
  });
};
