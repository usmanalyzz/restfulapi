const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const { Leave } = require("../../models/leaveRequest");

router.post("/request-leave", auth, async (req, res) => {
  try {
    const user = req.user;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!user) {
      console.error("User not found in request");
      return res.status(401).send("Unauthorized");
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).send("End date must be after the start date");
    }

    const leaveRequest = new Leave({
      userId: user._id,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await leaveRequest.save();

    const populateLeaveRequest = await Leave.findById(leaveRequest._id)
      .populate("userId", "firstname lastname jobtitle")
      .exec();

    if (!populateLeaveRequest) {
      console.error("Failed to populate leave request");
      return res.status(404).send("Leave request not found");
    }

    const fullName = `${populateLeaveRequest.userId.firstname} ${populateLeaveRequest.userId.lastname}`;

    return res.status(201).send({
      _id: populateLeaveRequest._id,
      userId: populateLeaveRequest.userId._id,
      fullName: fullName,
      jobTitle: populateLeaveRequest.userId.jobtitle,
      leaveType: populateLeaveRequest.leaveType,
      startDate: populateLeaveRequest.startDate,
      endDate: populateLeaveRequest.endDate,
      reason: populateLeaveRequest.reason,
      status: populateLeaveRequest.status,
      createdAt: populateLeaveRequest.createdAt,
      updatedAt: populateLeaveRequest.updatedAt,
    });
  } catch (error) {
    console.error("Error creating leave request:", error.message);
    return res.status(500).send("An error occurred while requesting leave");
  }
});

module.exports = router;
