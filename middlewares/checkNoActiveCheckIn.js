const { CheckInOut } = require("../models/checkInOut");

const checkNoActiveCheckIn = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).send("Invalid User ID");
    }

    const existingCheckIn = await CheckInOut.findOne({
      userId: user._id,
      checkOutTime: null,
    }).sort({ checkInTime: -1 });

    if (existingCheckIn) {
      return res.status(400).send("User is already checked in");
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while checking for active check-ins");
  }
};
module.exports = checkNoActiveCheckIn;
