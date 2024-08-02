var express = require("express");
var router = express.Router();
let { User } = require("../../models/user");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

//? List of all users
router.get("/list-users", async (req, res) => {
  let users = await User.find();
  return res.send(users);
});

//? User by ID
router.get("/user/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) return user.status(400).send("Given ID is not present");
    res.send(user);
  } catch (error) {
    res.status(400).send("Invalid Id");
  }
});

// Creating/ Registering the user
router.post("/register", async function (req, res) {
  let user = await User.findOne({ email: req.body.email });
  if (user)
    return res.status(400).send("User with the given email already exist");
  user = await new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    jobtitle: req.body.jobtitle,
    role: req.body.role || "user",
  });
  await user.save();
  return res.send(user);
});

// Login User
router.post("/login", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("User not registered");

    let isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) return res.status(401).send("Invalid Password");

    let token = jwt.sign(
      { _id: user._id, firstname: user.firstname },
      config.get("jwtPrivateKey")
    );
    res.send(token);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

//! Deleting the User
router.delete("/delete/:id", async (req, res) => {
  let user = await User.findByIdAndDelete(req.params.id);
  return res.send(user);
});

//* Update the user
router.put("/update/:id", async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("Given ID is not present");
  user.firstname = req.body.firstname;
  user.lastname = req.body.lastname;
  user.email = req.body.email;
  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }
  user.jobtitle = req.body.jobtitle;
  user.isActive =
    req.body.isActive !== undefined ? req.body.isActive : user.isActive;
  await user.save();
  return res.send(user);
});

module.exports = router;
