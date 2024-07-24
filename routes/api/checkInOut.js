var express = require("express");
var router = express.Router();
let { User } = require("../../models/user");
let { CheckInOut } = require("../../models/checkInOut");

//? Check-In Route
router.post("/check-in/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("Invalid User ID");

    let checkInOut = new CheckInOut({
      userId: req.params.id,
      checkInTime: new Date(),
      date: new Date(),
    });

    await checkInOut.save();

    checkInOut = await CheckInOut.findById(checkInOut._id)
      .populate("userId")
      .exec();
    return res.send(checkInOut);
  } catch (error) {
    return res.status(500).send("An error occurred while checking in the user");
  }
});

//? Check-Out Route
router.post("/check-out/:id", async (req, res) => {
  try {
    let checkInOut = await CheckInOut.findOne({
      userId: req.params.id,
      checkOutTime: null,
    }).sort({
      checkInTime: -1,
    });
    if (!checkInOut)
      return res.status(400).send("No active check-in for the current user ID");

    checkInOut.checkOutTime = new Date();
    await checkInOut.save();

    // Populate user details in the response
    checkInOut = await CheckInOut.findById(checkInOut._id)
      .populate("userId")
      .exec();
    return res.send(checkInOut);
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while checking out the user");
  }
});

//* Details of single User's check-in & check-out
router.get("/userCheckInOutDetails/:id", async (req, res) => {
  try {
    let checkInOuts = await CheckInOut.find({
      userId: req.params.id,
    })
      .sort({ date: -1 })
      .populate("userId");

    return res.send(checkInOuts);
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while retrieving user check-in/out details");
  }
});

module.exports = router;
