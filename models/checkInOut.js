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
  return (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60);
};

var CheckInOut = mongoose.model("CheckInOut", checkInOutSchema);

module.exports = { CheckInOut };
