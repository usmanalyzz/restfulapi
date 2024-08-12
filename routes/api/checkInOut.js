const express = require("express");
const router = express.Router();
const { User } = require("../../models/user");
const { CheckInOut } = require("../../models/checkInOut");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");
const fetchActiveCheckIn = require("../../middlewares/fetchActiveCheckIn");
const checkNoActiveCheckIn = require("../../middlewares/checkNoActiveCheckIn");

// Check-In Route
router.post("/check-in", [auth, checkNoActiveCheckIn], async (req, res) => {
  try {
    const user = req.user;

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

//? Break Time Route
router.post("/add-break/:id", [auth, fetchActiveCheckIn], async (req, res) => {
  try {
    const checkInOut = req.checkInOut;

    if (typeof req.body.breakTime !== "number" || req.body.breakTime <= 0) {
      return res.status(400).send("InValid break time provided");
    }

    checkInOut.breakTime += req.body.breakTime;
    await checkInOut.save();

    return res.send(checkInOut);
  } catch (error) {
    return res.status(500).send("An error occurred while adding break time");
  }
});

// Check-Out Route
router.post("/check-out", [auth, fetchActiveCheckIn], async (req, res) => {
  try {
    const checkInOut = req.checkInOut;

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

//? Admin Only
router.get("/allUsersCheckInOutDetails", [auth, admin], async (req, res) => {
  try {
    const checkInOuts = await CheckInOut.find()
      .sort({ date: -1 })
      .populate("userId");

    return res.send(checkInOuts);
  } catch (error) {
    console.log("Error retrieving all users' check-in/out details: ", error);
    return res
      .status(500)
      .send(
        "An error occurred while retrieving all users' check-in/out details:"
      );
  }
});

//* Time Duration of each worker

router.get("/userTotalWorkingTime/:id", auth, async (req, res) => {
  console.log("Route /userTotalWorkingTime/:id called");
  try {
    const userId = req.params.id;
    console.log("User ID:", userId);

    const checkInOuts = await CheckInOut.find({ userId });
    console.log("CheckInOuts:", checkInOuts);

    const totalTime = {};

    checkInOuts.forEach((checkInOut) => {
      const date = checkInOut.date.toISOString().split("T")[0];
      const duration = checkInOut.calculateDuration();

      if (!totalTime[date]) {
        totalTime[date] = 0;
      }
      totalTime[date] += duration;
    });

    const formattedTime = {};
    for (const date in totalTime) {
      const totalMinutes = totalTime[date] * 1440;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      formattedTime[date] = `${hours}h ${minutes}m`;
    }

    console.log("Total Time:", formattedTime);
    return res.send(formattedTime);
  } catch (error) {
    console.error("Error calculating total working time:", error);
    return res
      .status(500)
      .send("An error occurred while calculating total working time");
  }
});

module.exports = router;
