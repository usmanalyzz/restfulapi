var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const { type } = require("@hapi/joi/lib/extend");

var userSchema = mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    jobtitle: String,
    role: {
      type: String,
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

var User = mongoose.model("User", userSchema);

module.exports = { User };
