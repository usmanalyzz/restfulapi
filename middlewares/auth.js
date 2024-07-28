const jwt = require("jsonwebtoken");
const config = require("config");
const { User } = require("../models/user");

async function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(400).send("Token not provided");
  }

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = await User.findById(decoded._id);
    if (!req.user) {
      return res.status(401).send("Invalid token");
    }
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
  next();
}

module.exports = auth;
