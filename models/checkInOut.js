var mongoose = require("mongoose");

var checkInOutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
    },
    checkOutTime: {
      type: Date,
    },
    breakTime: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

checkInOutSchema.methods.calculateDuration = function () {
  if (!this.checkOutTime) {
    return 0;
  }

  const totalDuration =
    (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60);
  const breakDuration = this.breakTime / 60;
  return totalDuration - breakDuration;
};

var CheckInOut = mongoose.model("CheckInOut", checkInOutSchema);

module.exports = { CheckInOut };
