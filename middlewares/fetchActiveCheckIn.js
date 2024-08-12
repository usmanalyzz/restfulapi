const { CheckInOut } = require("../models/checkInOut");

const fetchActiveCheckIn = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).send("Invalid User ID");
    }

    const checkInOut = await CheckInOut.findOne({
      userId: user._id,
      checkOutTime: null,
    }).sort({ checkInTime: -1 });

    if (!checkInOut) {
      return res.status(400).send("No active check-in for the current user ID");
    }
    
    req.checkInOut = checkInOut;
    next();
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while fetching the active check-in");
  }
};
module.exports = fetchActiveCheckIn;
