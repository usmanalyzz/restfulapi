const express = require("express");
const router = express.Router();
const { User } = require("../../models/user");
const { CheckInOut } = require("../../models/checkInOut");
const auth = require("../../middlewares/auth");

// Check-In Route
router.post("/check-in", auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      console.log("Invalid User ID");
      return res.status(400).send("Invalid User ID");
    }

    let checkInOut = new CheckInOut({
      userId: user._id,
      checkInTime: new Date(),
      date: new Date(),
    });

    await checkInOut.save();

    checkInOut = await CheckInOut.findById(checkInOut._id)
      .populate("userId")
      .exec();
    return res.send(checkInOut);
  } catch (error) {
    console.log("Error during check-in:", error);
    return res.status(500).send("An error occurred while checking in the user");
  }
});

// Check-Out Route
router.post("/check-out", auth, async (req, res) => {
  try {
    const user = req.user;
    console.log("User ID for checkout:", user._id);

    // Find the latest check-in record without a check-out time
    const checkInOut = await CheckInOut.findOne({
      userId: user._id,
      checkOutTime: null,
    }).sort({ checkInTime: -1 });

    if (!checkInOut) {
      console.log("No active check-in found for user ID:", user._id);
      return res.status(400).send("No active check-in for the current user ID");
    }

    // Log the check-in record details before updating
    console.log("Active check-in record found:", checkInOut);

    checkInOut.checkOutTime = new Date();
    await checkInOut.save();

    const populatedCheckInOut = await CheckInOut.findById(checkInOut._id)
      .populate("userId")
      .exec();
    return res.send(populatedCheckInOut);
  } catch (error) {
    console.log("Error during check-out:", error);
    return res
      .status(500)
      .send("An error occurred while checking out the user");
  }
});

// Details of single User's check-in & check-out
router.get("/userCheckInOutDetails", auth, async (req, res) => {
  try {
    const user = req.user;
    console.log("User ID for retrieving check-in/out details:", user._id);

    const checkInOuts = await CheckInOut.find({ userId: user._id })
      .sort({ date: -1 })
      .populate("userId");

    return res.send(checkInOuts);
  } catch (error) {
    console.log("Error retrieving user check-in/out details:", error);
    return res
      .status(500)
      .send("An error occurred while retrieving user check-in/out details");
  }
});

module.exports = router;
