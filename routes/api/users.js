var express = require("express");
var router = express.Router();
let { User } = require("../../models/user");
var bcrypt = require("bcryptjs");

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
  });
  await user.save();
  return res.send(user);
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
